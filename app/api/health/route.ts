import connectDB from '@/lib/db';
import groq from '@/lib/groq';
import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    env: {
      mongoUri: !!process.env.MONGO_URI,
      jwtSecret: !!process.env.JWT_SECRET,
      groqApiKey: !!process.env.GROQ_API_KEY,
    },
    database: 'not_checked',
    groq: 'not_checked',
  };

  // Check MongoDB
  try {
    await connectDB();
    checks.database = 'connected';
  } catch (error) {
    console.error('Health check error:', error);
    checks.database = 'failed';
  }

  // Check Groq API
  if (!groq) {
    checks.groq = 'not_configured';
  } else {
    try {
      await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: 'llama-3.1-8b-instant',
        max_tokens: 1,
      });
      checks.groq = 'connected';
    } catch (error) {
      console.error('Groq health check error:', error);
      checks.groq = 'failed';
    }
  }

  const isHealthy = checks.database === 'connected' && checks.groq === 'connected';
  
  return NextResponse.json(
    { 
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    },
    { status: isHealthy ? 200 : 503 }
  );
}