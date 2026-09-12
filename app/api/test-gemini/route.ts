import { NextRequest, NextResponse } from 'next/server';
import gemini from '@/lib/gemini';

export async function GET(request: NextRequest) {
  if (!gemini) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 400 });
  }

  try {
    // Try a simple generation to test the API key
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say "Hello"');
    const text = result.response.text();
    return NextResponse.json({ success: true, response: text });
  } catch (error) {
    console.error('Gemini test error:', error);
    return NextResponse.json({ 
      error: 'Gemini API test failed', 
      details: error instanceof Error ? error.message : 'unknown' 
    }, { status: 500 });
  }
}
