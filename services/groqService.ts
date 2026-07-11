import groq from '@/lib/groq';

function safeJsonParse(content: string, fallback: any): any {
  const cleaned = content.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        console.error('Could not parse extracted JSON:', jsonMatch[0].substring(0, 300));
        return fallback;
      }
    }
    console.error('No JSON found in AI response:', cleaned.substring(0, 200));
    return fallback;
  }
}

const SYSTEM_INSTRUCTION = 'You are a JSON-only API. Respond with a single valid JSON object and nothing else. No preamble, no explanation, no repeated lists, no markdown. Output must start with "{" and end with "}". Do not list items twice.';

export async function extractSkillsFromResume(resumeText: string): Promise<string[]> {
  const prompt = `Extract up to 25 of the most important technical skills mentioned in the resume text below. Do not repeat any skill. Be concise.

Format: {"skills": ["skill1", "skill2"]}

Resume text:
"""
${resumeText.substring(0, 3500)}
"""`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    max_tokens: 1024,
  });

  const content = response.choices[0].message.content || '{"skills":[]}';
  const parsed = safeJsonParse(content, { skills: [] });
  return parsed.skills || [];
}

interface RoadmapWeek {
  weekNumber: number;
  topics: string[];
  resources: { title: string; url: string }[];
  miniProjects: string[];
}

export async function generateRoadmapForGaps(
  missingSkills: string[],
  targetRole: string
): Promise<RoadmapWeek[]> {
  if (missingSkills.length === 0) {
    return [{
      weekNumber: 1,
      topics: ['You already have all the required skills for this role'],
      resources: [],
      miniProjects: ['Consider building an advanced project to showcase your expertise']
    }];
  }

  const prompt = `Target role: ${targetRole}
Skills the candidate is missing: ${JSON.stringify(missingSkills)}

Generate a week-by-week learning roadmap (6 weeks) to help them learn ONLY these missing skills. Be concise.

Format:
{
  "roadmap": [
    {
      "weekNumber": 1,
      "topics": ["topic1", "topic2"],
      "resources": [{"title": "resource name", "url": "https://..."}],
      "miniProjects": ["mini project idea"]
    }
  ]
}`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 2500,
  });

  const content = response.choices[0].message.content || '{"roadmap":[]}';
  const parsed = safeJsonParse(content, { roadmap: [] });
  return parsed.roadmap || [];
}

interface ATSCheckResult {
  score: number;
  issues: string[];
  suggestions: string[];
}

export async function checkATSCompatibility(resumeText: string): Promise<ATSCheckResult> {
  const prompt = `You are a strict, realistic ATS compatibility evaluator. Most real-world resumes score 40-65. Only exceptional resumes score above 80. A resume with 2-3 minor issues should not exceed 70.

Check for: missing section headers, vague descriptions without metrics, long paragraphs instead of bullets, weak action verbs, missing contact info, length issues. You cannot see visual formatting since this is plain text. List at most 5 issues and 5 suggestions.

Format:
{
  "score": 55,
  "issues": ["issue 1", "issue 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Resume text:
"""
${resumeText.substring(0, 3500)}
"""`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.2,
    max_tokens: 1500,
  });

  const content = response.choices[0].message.content || '{"score":0,"issues":[],"suggestions":[]}';
  const parsed = safeJsonParse(content, { score: 0, issues: [], suggestions: [] });
  return parsed;
}