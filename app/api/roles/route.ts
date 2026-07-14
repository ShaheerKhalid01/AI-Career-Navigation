import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RoleRequirement from '@/models/RoleRequirement';

export async function GET() {
  try {
    await connectDB();
    const roles = await RoleRequirement.find({}).sort({ role: 1 });
    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Roles fetch error:', error);
    return NextResponse.json({ error: 'Failed to load roles' }, { status: 500 });
  }
}