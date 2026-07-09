interface RequiredSkill {
  skill: string;
  priority: string;
}

interface GapResult {
  matchedSkills: string[];
  missingSkills: string[];
  readinessScore: number;
}

// Normalize karta hai taake "Node.js" aur "NodeJS" aur "node js" sab match ho jayein
function normalize(skill: string): string {
  return skill.toLowerCase().replace(/[.\-\s]/g, '');
}

export function calculateSkillGap(
  extractedSkills: string[],
  requiredSkills: RequiredSkill[]
): GapResult {
  const normalizedExtracted = extractedSkills.map(normalize);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of requiredSkills) {
    const normalizedReq = normalize(req.skill);
    const isMatched = normalizedExtracted.some(
      (extracted) => extracted.includes(normalizedReq) || normalizedReq.includes(extracted)
    );

    if (isMatched) {
      matchedSkills.push(req.skill);
    } else {
      missingSkills.push(req.skill);
    }
  }

  const readinessScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return { matchedSkills, missingSkills, readinessScore };
}