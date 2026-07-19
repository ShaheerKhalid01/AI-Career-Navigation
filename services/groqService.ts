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
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an ATS resume analysis assistant. Return concise JSON with score, issues, suggestions.'
        },
        {
          role: 'user',
          content: `Analyze the following resume text for ATS compatibility. Return JSON only with keys score, issues, suggestions. Resume text:\n${resumeText.slice(0, 8000)}`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 900
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(content);

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

  return Array.from({ length: weekCount }, (_, index) => {
    const focus = skillList[index % skillList.length];
    return {
      week: index + 1,
      title: `Week ${index + 1}: Strengthen ${focus}`,
      focus,
      goal: `Build confidence in ${focus} for ${normalizedRole}`
    };
  });
}
