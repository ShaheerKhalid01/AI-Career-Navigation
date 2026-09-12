import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

// Fallback evaluation that works without AI
const getFallbackEvaluation = (ans: string, q: string) => {
  const trimmed = ans.trim();
  const wordCount = trimmed.split(/\s+/).length;
  const charCount = trimmed.length;
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);

  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 1. Length scoring (0-25 points)
  if (charCount < 30) {
    score += 5;
    improvements.push('Your answer is too brief. Expand with more details.');
  } else if (charCount < 80) {
    score += 12;
    improvements.push('Add more specific examples to strengthen your response.');
  } else if (charCount < 200) {
    score += 18;
    strengths.push('Good length with adequate detail');
  } else if (charCount < 400) {
    score += 23;
    strengths.push('Comprehensive answer with good detail');
  } else {
    score += 25;
    strengths.push('Thorough and detailed response');
  }

  // 2. Structure scoring (0-20 points)
  if (sentences.length >= 3) {
    score += 15;
    strengths.push('Well-structured with multiple sentences');
  } else if (sentences.length >= 2) {
    score += 10;
    strengths.push('Has basic structure');
  } else {
    score += 3;
    improvements.push('Structure your answer with multiple sentences for clarity.');
  }

  // 3. Specificity scoring (0-20 points)
  const actionVerbs = ['managed', 'developed', 'created', 'implemented', 'led', 'designed', 'built', 'achieved', 'improved', 'increased', 'reduced', 'handled', 'coordinated', 'organized', 'executed'];
  const hasActionVerbs = actionVerbs.some(verb => ans.toLowerCase().includes(verb));
  if (hasActionVerbs) {
    score += 15;
    strengths.push('Used action-oriented language');
  }

  const hasExamples = ans.toLowerCase().includes('for example') || ans.toLowerCase().includes('such as') || ans.toLowerCase().includes('like');
  if (hasExamples) {
    score += 10;
    strengths.push('Provided specific examples');
  } else {
    improvements.push('Include specific examples to make your answer more compelling.');
  }

  // 4. Results/impact scoring (0-15 points)
  const resultWords = ['result', 'outcome', 'impact', 'achieved', 'success', 'improved', 'increased', 'reduced', 'saved', 'generated'];
  const hasResults = resultWords.some(word => ans.toLowerCase().includes(word));
  if (hasResults) {
    score += 12;
    strengths.push('Highlighted results and impact');
  } else {
    improvements.push('Mention the results or impact of your actions.');
  }

  // 5. Quantitative details (0-10 points)
  if (ans.match(/\d+/)) {
    score += 8;
    strengths.push('Included quantitative details');
  }

  // 6. First-person perspective (0-5 points)
  if (ans.toLowerCase().includes('i ') && (ans.toLowerCase().includes('did ') || ans.toLowerCase().includes('was ') || ans.toLowerCase().includes('have '))) {
    score += 5;
    strengths.push('Used first-person perspective effectively');
  }

  // 7. Relevance to question (0-5 points)
  const questionWords = q.toLowerCase().split(/\s+/);
  const answerWords = ans.toLowerCase().split(/\s+/);
  const commonWords = questionWords.filter(w => answerWords.includes(w) && w.length > 3);
  if (commonWords.length >= 2) {
    score += 5;
    strengths.push('Answer is relevant to the question');
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  // Adjust feedback based on score
  if (score >= 80) {
    strengths.push('Strong overall answer');
  } else if (score >= 60) {
    improvements.push('Add more specific details and measurable results to improve further.');
  } else if (score >= 40) {
    improvements.push('Focus on adding concrete examples and clear structure.');
  } else {
    improvements.push('Provide a more detailed and structured response with specific examples.');
  }

  return {
    score,
    strengths,
    improvements,
    sampleAnswer: 'A strong answer would include: 1) A clear context, 2) Specific actions you took, 3) Measurable results achieved, and 4) What you learned from the experience.'
  };
};

export async function POST(request: NextRequest) {
  console.log('Interview evaluate API called');
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    console.log('IP:', ip);

    // Stricter rate limiting for AI endpoints (3 requests per minute)
    const isRateLimited = await rateLimit(ip, 3, 60000);
    if (!isRateLimited) {
      console.log('Rate limited');
      return NextResponse.json(
        { error: 'Too many AI requests. Please try again later.' },
        { status: 429, headers: await getRateLimitHeaders(ip, 3, 60000) }
      );
    }

    const { question, answer, targetRole } = await request.json();
    console.log('Received question and answer, length:', answer?.length);

    if (!question || !answer) {
      console.log('Missing question or answer');
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    // If Groq is not configured, use fallback evaluation
    if (!groq) {
      const result = getFallbackEvaluation(answer, question);
      return NextResponse.json({ ...result, evaluationMethod: 'Content-based evaluation (no Groq API)' });
    }

    try {
      const prompt = `You are an expert interview coach evaluating a candidate's answer.

Interview Question: "${question}"
Target Role: ${targetRole || 'Not specified'}
Candidate's Answer: "${answer}"

Evaluate the answer on these criteria:
1. Relevance — Does it directly address the question?
2. Structure — Does it use a clear logical flow?
3. Specificity — Does it include concrete details and examples?
4. Impact — Does it highlight the candidate's contribution and results?

Return valid JSON only, no markdown, no explanations:
{
  "score": 0-100,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "sampleAnswer": "a short model answer (2-3 sentences)"
}`;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert interview coach. Always return valid JSON only, no markdown, no explanations.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 0.3,
        max_tokens: 1200,
      });

      const content = response.choices[0].message.content || '';
      console.log('Groq response content:', content);
      const cleaned = content.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Parsed Groq response:', parsed);
          return NextResponse.json({
            score: Math.min(100, Math.max(0, parsed.score || 50)),
            strengths: parsed.strengths || [],
            improvements: parsed.improvements || [],
            sampleAnswer: parsed.sampleAnswer || '',
            evaluationMethod: 'Groq AI'
          });
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      }

      // If AI failed to parse, use fallback
      const fallbackResult = getFallbackEvaluation(answer, question);
      return NextResponse.json({ ...fallbackResult, evaluationMethod: 'Content-based evaluation (Groq parse failed)' });
    } catch (aiError) {
      console.error('Groq API error:', aiError);
      if (aiError instanceof Error) {
        console.error('Error message:', aiError.message);
        console.error('Error stack:', aiError.stack);
      }
      const fallbackResult = getFallbackEvaluation(answer, question);
      return NextResponse.json({ ...fallbackResult, evaluationMethod: `Content-based evaluation (Groq error: ${aiError instanceof Error ? aiError.message : 'unknown'})` });
    }
  } catch (error) {
    console.error('Interview evaluation error:', error);
    // Return fallback evaluation even on error
    try {
      const { answer, question } = await request.json().catch(() => ({ answer: '', question: '' }));
      const fallbackResult = getFallbackEvaluation(answer, question);
      return NextResponse.json({ ...fallbackResult, evaluationMethod: 'Content-based evaluation (error recovery)' });
    } catch (e) {
      return NextResponse.json({ score: 50, strengths: [], improvements: ['Evaluation failed'], sampleAnswer: '', evaluationMethod: 'Content-based evaluation (complete error)' });
    }
  }
}
