import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Roadmap from '@/models/Roadmap';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

function getUserId(req: NextRequest): string | null {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as unknown as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = getUserId(request);
    const filter = userId ? { userId } : {};
    const recent = await Roadmap.find(filter).sort({ generatedAt: -1 }).limit(10).populate('resumeId', 'targetRole');
    return NextResponse.json({ roadmaps: recent });
  } catch {
    return NextResponse.json({ roadmaps: [] });
  }
}
