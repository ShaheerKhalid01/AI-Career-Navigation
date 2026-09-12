import groq from '@/lib/groq';
import { runRuleBasedATSChecks } from '@/services/skillGapService';

interface AtsCompatibilityResult {
  score: number;
  issues: string[];
  suggestions: string[];
}

function buildFallbackATSResult(resumeText: string): AtsCompatibilityResult {
  const ruleCheck = runRuleBasedATSChecks(resumeText);
  return {
    score: ruleCheck.score,
    issues: ruleCheck.issues,
    suggestions: [
      'Add measurable achievements and numbers wherever possible.',
      'Use clear section headers such as Experience, Education, and Skills.',
      'Tailor the resume text to include the target role keywords.'
    ]
  };
}

export async function checkATSCompatibility(resumeText: string): Promise<AtsCompatibilityResult> {
  if (!groq) {
    return buildFallbackATSResult(resumeText);
  }

  try {
    const prompt = `You are an ATS resume analysis assistant. Return concise JSON with score, issues, suggestions.

Analyze the following resume text for ATS compatibility. Return JSON only with keys score, issues, suggestions.

JSON format:
{
  "score": 0-100,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Resume text:\n${resumeText.slice(0, 8000)}`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert ATS resume analyzer. Always return valid JSON only, no markdown, no explanations.' },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.2,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content?.trim() || '';
    const cleaned = content.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    let parsed;
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(cleaned);
    }

    return {
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    };
  } catch (error) {
    console.error('ATS compatibility analysis failed, using fallback:', error);
    return buildFallbackATSResult(resumeText);
  }
}

export async function generateRoadmapForGaps(gaps: string[], role: string) {
  const normalizedRole = role || 'target role';
  const skillList = gaps.length > 0 ? gaps : ['core fundamentals', 'project experience', 'industry alignment'];
  const weekCount = Math.min(Math.max(skillList.length, 4), 6);

  // Ensure unique topics for each week by expanding the skill list if needed
  const expandedSkills: string[] = [];
  for (let i = 0; i < weekCount; i++) {
    if (i < skillList.length) {
      expandedSkills.push(skillList[i]);
    } else {
      // Add progressive variations for additional weeks
      const baseSkill = skillList[i % skillList.length];
      expandedSkills.push(`${baseSkill} - advanced practices`);
    }
  }

  return Array.from({ length: weekCount }, (_, index) => {
    const focus = expandedSkills[index];
    return {
      weekNumber: index + 1,
      topics: [focus],
      resources: [],
      miniProjects: []
    };
  });
}
