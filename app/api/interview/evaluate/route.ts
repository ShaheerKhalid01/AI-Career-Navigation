import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    
    // Stricter rate limiting for AI endpoints (3 requests per minute)
    if (!rateLimit(ip, 3, 60000)) {
      return NextResponse.json(
        { error: 'Too many AI requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(ip, 3, 60000) }
      );
    }

    const { question, answer, targetRole } = await request.json();

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const prompt = `You are an expert interview coach evaluating a candidate's answer.

Interview Question: "${question}"
Target Role: ${targetRole || 'Not specified'}
Candidate's Answer: "${answer}"

Evaluate the answer on these criteria:
1. Relevance — Does it directly address the question?
2. Structure — Does it use STAR or a clear logical flow?
3. Specificity — Does it include concrete details and examples?
4. Impact — Does it highlight the candidate's contribution and results?

Return JSON:
{
  "score": 0-100,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "sampleAnswer": "a short model answer (2-3 sentences)"
}`;

    if (!groq) {
      return NextResponse.json(
        { error: 'AI service is unavailable because GROQ_API_KEY is not configured.' },
        { status: 503 }
      );
    }

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a strict but fair interview coach. Evaluate answers honestly. Scores above 85 are rare.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || '';
    const cleaned = content.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        score: Math.min(100, Math.max(0, parsed.score || 50)),
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        sampleAnswer: parsed.sampleAnswer || '',
      });
    }

    return NextResponse.json({
      score: 50,
      strengths: ['Attempted to answer'],
      improvements: ['Try using the STAR method for more structure'],
      sampleAnswer: '',
    });
  } catch (error) {
    console.error('Interview evaluation error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to evaluate answer' }, { status: 500 });
  }
}
