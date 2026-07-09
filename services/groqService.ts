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

// Ye function ab sirf roadmap banata hai, matched/missing calculate NAHI karta
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

  const prompt = `
You are a career advisor for software developers.

Target role: ${targetRole}
Skills the candidate is missing: ${JSON.stringify(missingSkills)}

Generate a week-by-week learning roadmap (6 weeks) to help them learn ONLY these missing skills.
Return ONLY valid JSON in this exact format, no extra text, no markdown:

{
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

  const content = response.choices[0].message.content || '{"roadmap":[]}';
  const cleaned = content.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed.roadmap || [];
}