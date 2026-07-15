import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

function getUserId(req: NextRequest): string | null {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(auth.slice(7), getJwtSecret()) as unknown as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const query: Record<string, any> = {};
    if (role) query.role = role;
    
    const jobs = await Job.find(query).sort({ postedAt: -1 }).limit(50);
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Require authentication for posting jobs
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { title, company, location, description, requirements, role, url } = body;
    
    if (!title || !company || !description) {
      return NextResponse.json({ error: 'Title, company, and description are required.' }, { status: 400 });
    }
    
    const job = await Job.create({
      title, company, location, description,
      requirements: requirements || [],
      role: role || 'general',
      url: url || '',
      postedBy: userId,
    });
    return NextResponse.json({ message: 'Job posted', job });
  } catch (error) {
    console.error('Job create error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
