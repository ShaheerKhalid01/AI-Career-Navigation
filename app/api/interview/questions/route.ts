import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
const VALID_DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Stricter rate limiting for AI endpoints (3 requests per minute)
    const isRateLimited = await rateLimit(ip, 3, 60000);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many AI requests. Please try again later.' },
        { status: 429, headers: await getRateLimitHeaders(ip, 3, 60000) }
      );
    }

    const { targetRole, skills, missingSkills, difficulty } = await request.json();

    if (!targetRole) {
      return NextResponse.json({ error: 'Target role is required.' }, { status: 400 });
    }

    const requestedDifficulty: Difficulty = VALID_DIFFICULTIES.includes(difficulty)
      ? difficulty
      : 'Easy';

    const hasSkills = Array.isArray(skills) && skills.length > 0;
    const hasMissing = Array.isArray(missingSkills) && missingSkills.length > 0;
    const coreSkills = hasSkills ? skills.slice(0, 8) : null;

    // ── Fallback questions, split by difficulty ───────────────────────
    const getFallbackQuestions = (role: string, level: Difficulty) => {
      const roleSkillFocus = coreSkills
        ? coreSkills.slice(0, 2).join(', ')
        : `${role} fundamentals`;

      const easy = [
        { id: 1, question: `Walk us through your experience with ${roleSkillFocus}.`, category: 'Experience', difficulty: 'Easy' as Difficulty, answer: `Start with your current role, mention specific projects where you applied ${roleSkillFocus}, and quantify results if possible. Keep it under 2 minutes.` },
        { id: 2, question: `What tools or frameworks do you regularly use as a ${role}?`, category: 'Technical', difficulty: 'Easy' as Difficulty, answer: 'List the tools you use most often, briefly mention why you chose each, and give a quick example of something you built with them.' },
        { id: 3, question: `Tell me about a recent ${role}-related task you completed successfully.`, category: 'Behavioral', difficulty: 'Easy' as Difficulty, answer: 'Use a brief STAR structure: Situation (1 sentence), Task, Action you personally took, Result with numbers if possible.' },
      ];

      const medium = [
        { id: 4, question: coreSkills && coreSkills[0]
          ? `Explain a time you used ${coreSkills[0]} to solve a non-trivial problem.`
          : `Describe a challenging bug or problem you solved as a ${role}.`,
          category: 'Technical', difficulty: 'Medium' as Difficulty, answer: 'Structure this with STAR method. Emphasize your problem-solving process, not just the final answer. Mention trade-offs you considered.' },
        { id: 5, question: `How do you prioritize tasks when working on multiple ${role} deliverables with tight deadlines?`, category: 'Behavioral', difficulty: 'Medium' as Difficulty, answer: 'Describe your actual system: e.g., Eisenhower matrix, ticket triage, stakeholder alignment. Include a concrete example of how it worked.' },
        { id: 6, question: `How do you ensure the quality of your work before delivering it?`, category: 'Process', difficulty: 'Medium' as Difficulty, answer: 'Talk about testing approach, peer reviews, checklists, linting/CI, or other specific processes you follow. Mention specific examples of issues caught early.' },
      ];

      const hard = [
        { id: 7, question: hasMissing
          ? `${missingSkills[0]} is often needed for this role. Walk us through how you would approach a task requiring ${missingSkills[0]} with your current knowledge.`
          : `Describe the most complex technical challenge you have faced as a ${role} and how you overcame it.`,
          category: 'Technical', difficulty: 'Hard' as Difficulty, answer: 'Be specific: describe the constraints, what you tried first, what failed, how you iterated, and the measurable final outcome. Interviewers care about process, not perfection.' },
        { id: 8, question: `Tell me about a time you made a major mistake in your work. What did you learn?`, category: 'Behavioral', difficulty: 'Hard' as Difficulty, answer: 'Be honest, pick a real (but not catastrophic) mistake. Focus on accountability (no blame), immediate remediation steps, and specific long-term changes you made to prevent recurrence.' },
        { id: 9, question: coreSkills
          ? `Suppose we give you a project combining ${coreSkills.slice(0, 3).join(', ')} — how would you design and plan it end-to-end?`
          : `Where do you see yourself contributing most to our team in the first 90 days?`,
          category: 'System Design', difficulty: 'Hard' as Difficulty, answer: 'Use a structured approach: 1) clarify requirements & constraints, 2) break into milestones, 3) tech choices with reasoning, 4) risks & how to de-risk, 5) success metrics. Keep it high-level first, then dive deep if asked.' },
      ];

      if (level === 'Easy') return easy;
      if (level === 'Medium') return medium;
      return hard;
    };

    // If Groq is not configured, use fallback questions for the requested level
    if (!groq) {
      return NextResponse.json({ questions: getFallbackQuestions(targetRole, requestedDifficulty) });
    }

    try {
      const skillContext = coreSkills
        ? `IMPORTANT — The candidate has proven experience in these skills, so questions MUST reference these specifically:
  • Already has: [${coreSkills.join(', ')}]
  ${hasMissing ? `• Still learning / missing for this role: [${missingSkills.slice(0, 4).join(', ')}]  — if generating Hard questions, make at least 1 test how they'd approach an unfamiliar skill.` : ''}`
        : `No existing skills on record. Generate role-appropriate questions for a solid ${targetRole} candidate.`;

      const levelGuidance: Record<Difficulty, string> = {
        Easy: 'foundational, warm-up, experience verification, low pressure',
        Medium: 'problem-solving, behavioral, process, requires concrete examples',
        Hard: 'deep technical, system design, pressure, edge cases, mistakes & learning',
      };

      const prompt = `You are a senior hiring manager for a "${targetRole}" position. Generate EXACTLY 3 realistic interview questions, ALL at the "${requestedDifficulty}" difficulty level.

${skillContext}

Difficulty guidance for "${requestedDifficulty}": ${levelGuidance[requestedDifficulty]}

${requestedDifficulty === 'Easy' && coreSkills ? 'Every question should directly reference at least one of the candidate\'s existing skills listed above.' : ''}
${requestedDifficulty !== 'Easy' && coreSkills ? 'Questions should combine multiple skills or require critical thinking, building on the candidate\'s existing skills.' : ''}

For EACH question provide:
- id (1-3)
- question (clear, specific, not generic)
- category (single short label: Technical / Behavioral / Experience / System Design / Process)
- difficulty (EXACTLY "${requestedDifficulty}")
- answer (a 1-2 sentence actionable coaching tip for the interviewee — how to structure a STRONG answer, what the interviewer is really looking for)

Return valid JSON only, no markdown, no code fences, no explanations. Must be parseable by JSON.parse():
{
  "questions": [
    { "id": 1, "question": "...", "category": "...", "difficulty": "${requestedDifficulty}", "answer": "..." },
    { "id": 2, "question": "...", "category": "...", "difficulty": "${requestedDifficulty}", "answer": "..." },
    { "id": 3, "question": "...", "category": "...", "difficulty": "${requestedDifficulty}", "answer": "..." }
  ]
}

Questions MUST be specific to "${targetRole}" — no generic HR fluff.`;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a senior technical interviewer who always writes valid JSON. Never output markdown, code fences, or commentary — only a raw JSON object.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 0.6,
        max_tokens: 1200,
      });

      const content = response.choices[0].message.content || '';
      const cleaned = content.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      let questions: any[] = [];
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          questions = (parsed.questions || []).filter(Boolean).map((q: any, i: number) => ({
            ...q,
            id: q.id ?? (i + 1),
            difficulty: requestedDifficulty,
          }));
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      }

      if (questions.length === 0) {
        questions = getFallbackQuestions(targetRole, requestedDifficulty);
      }

      return NextResponse.json({ questions });
    } catch (aiError) {
      console.error('Groq API error:', aiError);
      return NextResponse.json({ questions: getFallbackQuestions(targetRole, requestedDifficulty) });
    }
  } catch (error) {
    console.error('Interview questions generation error:', error);
    let role = 'this role';
    let level: Difficulty = 'Easy';
    try {
      const body = await request.json().catch(() => null);
      if (body?.targetRole) role = body.targetRole;
      if (VALID_DIFFICULTIES.includes(body?.difficulty)) level = body.difficulty;
    } catch {}

    const fallbackByLevel: Record<Difficulty, any[]> = {
      Easy: [
        { id: 1, question: `What experience do you have as a ${role}?`, category: 'Experience', difficulty: 'Easy', answer: 'Highlight relevant projects, tools you have used, and measurable outcomes from your work.' },
        { id: 2, question: `How do you stay updated with ${role} trends?`, category: 'General', difficulty: 'Easy', answer: 'Mention specific blogs, courses, communities, or certifications you follow.' },
        { id: 3, question: `Describe a small ${role} win you had recently.`, category: 'Behavioral', difficulty: 'Easy', answer: 'Keep it short: what was the situation, what did you do, what was the result.' },
      ],
      Medium: [
        { id: 4, question: `Describe a challenging ${role} project you worked on.`, category: 'Technical', difficulty: 'Medium', answer: 'Be specific about the challenge, your actions, trade-offs you made, and the results achieved.' },
        { id: 5, question: `How do you handle competing priorities in your work?`, category: 'Behavioral', difficulty: 'Medium', answer: 'Describe your prioritization framework and give a concrete example.' },
        { id: 6, question: `How do you review someone else's work in your field?`, category: 'Process', difficulty: 'Medium', answer: "Talk about what you look for (functionality, style, security, edge cases) and how you give constructive feedback." },
      ],
      Hard: [
        { id: 7, question: `Describe the toughest problem you've faced as a ${role}.`, category: 'Technical', difficulty: 'Hard', answer: 'Be honest. Interviewers care about your process — how you debugged, iterated, and learned — more than a perfect answer.' },
        { id: 8, question: `Tell me about a time you failed or made a bad call. What did you change?`, category: 'Behavioral', difficulty: 'Hard', answer: 'Avoid blaming others. Focus on accountability, remediation, and the specific permanent changes you made afterward.' },
        { id: 9, question: `How would you design a production-ready solution for a complex ${role} requirement?`, category: 'System Design', difficulty: 'Hard', answer: 'Structure it: clarify constraints, define milestones, choose tools with reasoning, list risks and success metrics.' },
      ],
    };

    return NextResponse.json({ questions: fallbackByLevel[level] });
  }
}