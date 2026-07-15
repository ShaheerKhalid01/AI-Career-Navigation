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

    const { jobTitle, company, skills, extractedSkills, targetRole } = await request.json();

    if (!jobTitle || !company) {
      return NextResponse.json({ error: 'Job title and company are required.' }, { status: 400 });
    }

    const allSkills = [...new Set([...(skills || []), ...(extractedSkills || [])])];
    const skillsText = allSkills.length > 0 ? allSkills.join(', ') : 'relevant professional skills';

    const prompt = `Write a professional cover letter for a ${jobTitle} position at ${company}.

Context:
- Target role: ${targetRole || jobTitle}
- Key skills: ${skillsText}
- The candidate's resume has been analyzed and these are their strengths

Write a compelling, ATS-friendly cover letter that:
1. Opens with a strong introduction expressing interest in ${company}
2. Highlights relevant experience with ${skillsText}
3. Shows knowledge of the company/industry
4. Has a confident closing with a call to action
5. Is 3-4 paragraphs, concise and professional
6. Uses "[Your Name]" as the signature

Return only the letter text, no preamble or explanation.`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional career coach and cover letter writer. Write concise, impactful cover letters that pass ATS filters.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.4,
      max_tokens: 1500,
    });

    const letter = response.choices[0].message.content || `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background in ${targetRole || 'my field'} and expertise in ${skillsText}, I am confident that I would be a valuable addition to your team.

Throughout my career, I have developed a comprehensive skill set that includes ${skillsText}. I have a proven track record of delivering results and driving innovation in fast-paced environments.

Thank you for considering my application. I look forward to the opportunity to discuss how my experience aligns with the needs of your team.

Best regards,
[Your Name]`;

    return NextResponse.json({ letter });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}
