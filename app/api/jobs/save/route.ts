import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = jwt.verify(auth.slice(7), getJwtSecret()) as unknown as { userId: string };
    const { jobId } = await request.json();
    
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    return NextResponse.json({ message: 'Job saved' });
  } catch (error) {
    console.error('Save job error:', error);
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
  }
}
