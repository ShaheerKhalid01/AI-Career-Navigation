import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Roadmap from '@/models/Roadmap';
import Resume from '@/models/Resume';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found. It may have expired or the link is incorrect.' }, { status: 404 });
    }

    const resume = await Resume.findById(roadmap.resumeId);

    return NextResponse.json({
      roadmap: roadmap.weeks,
      targetRole: resume?.targetRole || 'unknown',
      analysis: resume?.analysis || null,
    });
  } catch (error) {
    console.error('Roadmap fetch error:', error);
    return NextResponse.json({ error: 'Failed to load roadmap' }, { status: 500 });
  }
}