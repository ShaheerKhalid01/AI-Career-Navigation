import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { targetRole, skills } = await request.json();

    const prompt = `Generate 5 realistic interview questions for a "${targetRole}" position.

Context - the candidate's key skills are: ${skills?.length ? skills.join(', ') : 'various relevant skills'}

For each question provide:
1. The interview question
2. The category (Technical, Behavioral, or General)
3. A tip on how to answer using the STAR method or technical explanation

Format:
{
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "category": "Technical/Behavioral/General",
      "answer": "detailed tip on how to answer this question"
    }
  ]
}

Make questions specific to ${targetRole} role, not generic.`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a senior technical recruiter and interview coach. Generate realistic, role-specific interview questions with actionable answering tips.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || '{"questions":[]}';
    const cleaned = content.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    let questions: any[] = [];
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        questions = parsed.questions || [];
      } catch {}
    }

    if (questions.length === 0) {
      questions = [
        { id: 1, question: `What experience do you have as a ${targetRole}?`, category: 'General', answer: 'Highlight relevant projects, tools you have used, and measurable outcomes from your work.' },
        { id: 2, question: `How do you stay updated with ${targetRole} trends?`, category: 'General', answer: 'Mention specific blogs, courses, communities, or certifications you follow.' },
        { id: 3, question: `Describe a challenging ${targetRole} project you worked on.`, category: 'Behavioral', answer: 'Use STAR: Situation, Task, Action, Result. Be specific about your role.' },
      ];
    }

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
