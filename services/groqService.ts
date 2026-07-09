import groq from '@/lib/groq';

export async function extractSkillsFromResume(resumeText: string): Promise<string[]> {
  const prompt = `
You are a resume parser. Extract ALL technical skills mentioned in the resume text below.
Return ONLY valid JSON, no preamble, no markdown, no backticks.

Format:
{"skills": ["skill1", "skill2", "skill3"]}

Resume text:
"""
${resumeText}
"""
`;

  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
  });

  const content = response.choices[0].message.content || '{"skills":[]}';
  const cleaned = content.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed.skills || [];
}

interface RoadmapWeek {
  weekNumber: number;
  topics: string[];
  resources: { title: string; url: string }[];
  miniProjects: string[];
}

interface RoadmapResult {
  matchedSkills: string[];
  missingSkills: string[];
  readinessScore: number;
  roadmap: RoadmapWeek[];
}

export async function generateRoadmap(
  extractedSkills: string[],
  targetRole: string,
  requiredSkills: { skill: string; priority: string }[]
): Promise<RoadmapResult> {
  const prompt = `
You are a career advisor for software developers.

Candidate's current skills: ${JSON.stringify(extractedSkills)}
Target role: ${targetRole}
Required skills for this role: ${JSON.stringify(requiredSkills)}

Analyze the gap and generate a week-by-week learning roadmap (6 weeks).
Return ONLY valid JSON in this exact format, no extra text, no markdown:

{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "readinessScore": 65,
  "roadmap": [
    {
      "weekNumber": 1,
      "topics": ["topic1", "topic2"],
      "resources": [{"title": "resource name", "url": "https://..."}],
      "miniProjects": ["mini project idea"]
    }
  ]
}
`;

  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
  });

  const content = response.choices[0].message.content || '{}';
  const cleaned = content.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}