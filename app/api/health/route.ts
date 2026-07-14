import connectDB from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    env: {
      mongoUri: !!process.env.MONGO_URI,
      jwtSecret: !!process.env.JWT_SECRET,
    },
    database: 'not_checked'
  };

  try {
    await connectDB();
    checks.database = 'connected';
    return NextResponse.json({ status: 'healthy', checks });
  } catch (error) {
    console.error('Health check error:', error);
    checks.database = 'failed';
    return NextResponse.json(
      { status: 'unhealthy', checks, error: String(error) },
      { status: 500 }
    );
  }
}