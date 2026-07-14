import groq from '@/lib/groq';
import { findCuratedResource, getFallbackResource } from '@/lib/resourceLinks';

function safeJsonParse<T>(content: string, fallback: T): T {
  const cleaned = content.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
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
    const defaultWeeks = Array.from({ length: 6 }, (_, i) => ({
      weekNumber: i + 1,
      topics: [`Advanced ${targetRole} skill building`, `Portfolio project week ${i + 1}`],
      resources: [] as { title: string; url: string }[],
      miniProjects: [`Build an advanced ${targetRole} feature or case study`],
    }));
    for (const week of defaultWeeks) {
      for (const topic of week.topics.slice(0, 2)) {
        const curated = findCuratedResource(topic);
        week.resources.push(curated || getFallbackResource(topic));
      }
    }
    return defaultWeeks;
  }

  const prompt = `Target role: ${targetRole}
Skills the candidate is missing: ${JSON.stringify(missingSkills)}

Generate a week-by-week learning plan covering exactly 6 weeks (week 1 through week 6) to help them learn ONLY these missing skills. Every week must be included. Do NOT include any resource links or URLs. Be concise.

Format:
{
  "roadmap": [
    { "weekNumber": 1, "topics": ["topic1", "topic2"], "miniProjects": ["mini project idea"] },
    { "weekNumber": 2, "topics": ["topic3", "topic4"], "miniProjects": ["mini project idea"] },
    { "weekNumber": 3, "topics": ["topic5", "topic6"], "miniProjects": ["mini project idea"] },
    { "weekNumber": 4, "topics": ["topic7", "topic8"], "miniProjects": ["mini project idea"] },
    { "weekNumber": 5, "topics": ["topic9", "topic10"], "miniProjects": ["mini project idea"] },
    { "weekNumber": 6, "topics": ["topic11", "topic12"], "miniProjects": ["mini project idea"] }
  ]
}`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content || '{"roadmap":[]}';
  const parsed = safeJsonParse(content, { roadmap: [] });
  let rawWeeks: any[] = parsed.roadmap || [];

  // Guarantee exactly 6 weeks — pad if AI returns fewer, trim if more
  const TOTAL_WEEKS = 6;
  if (rawWeeks.length < TOTAL_WEEKS) {
    const existing = rawWeeks.map((w: any) => w.weekNumber);
    for (let i = 1; i <= TOTAL_WEEKS; i++) {
      if (!existing.includes(i)) {
        const skillIdx = (i - 1) % Math.max(missingSkills.length, 1);
        rawWeeks.push({
          weekNumber: i,
          topics: [`Practice: ${missingSkills[skillIdx]}`, `Build with ${missingSkills[skillIdx]}`],
          miniProjects: [`Apply ${missingSkills[skillIdx]} in a real project`],
        });
      }
    }
    rawWeeks.sort((a: any, b: any) => a.weekNumber - b.weekNumber);
  }
  rawWeeks = rawWeeks.slice(0, TOTAL_WEEKS);

  // Har week ke topics ke liye khud se curated/reliable links attach karte hain
  return rawWeeks.map((week: any) => {
    const resources: { title: string; url: string }[] = [];
    const topics: string[] = week.topics || [];

    for (const topic of topics.slice(0, 2)) {
      const curated = findCuratedResource(topic);
      resources.push(curated || getFallbackResource(topic));
    }

    return {
      weekNumber: week.weekNumber,
      topics: topics,
      resources,
      miniProjects: week.miniProjects || [],
    };
  });
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