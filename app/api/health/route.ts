import connectDB from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: 'Database connected successfully' });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Database connection failed', details: String(error) },
      { status: 500 }
    );
  }
}