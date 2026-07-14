import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';

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
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
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
    });
    return NextResponse.json({ message: 'Job posted', job });
  } catch (error) {
    console.error('Job create error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
