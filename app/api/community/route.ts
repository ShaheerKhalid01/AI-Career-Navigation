import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!rateLimit(ip, 30, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(ip, 30, 60000) }
      );
    }
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    if (!role || role === 'all') {
      if (!role) {
        // Return community stats (post count + avg readiness per role)
        const stats = await Post.aggregate([
          {
            $group: {
              _id: '$targetRole',
              memberCount: { $sum: 1 },
              avgReadiness: { $avg: '$readinessScore' },
            }
          }
        ]);
        return NextResponse.json({ stats });
      }
      // role === 'all' — return all posts across all roles
      const posts = await Post.find({}).sort({ createdAt: -1 }).limit(50);
      return NextResponse.json({ posts });
    }

    const posts = await Post.find({ targetRole: role }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Community fetch error:', error);
    return NextResponse.json({ error: 'Failed to load community data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!rateLimit(ip, 30, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(ip, 30, 60000) }
      );
    }
    const { authorName, message, targetRole, readinessScore } = await request.json();

    if (!authorName || !authorName.trim()) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }
    if (!targetRole) {
      return NextResponse.json({ error: 'Please select a community.' }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message is too long (max 1000 characters).' }, { status: 400 });
    }

    const post = await Post.create({
      authorName: authorName.trim().substring(0, 50),
      message: message.trim(),
      targetRole,
      readinessScore: typeof readinessScore === 'number' ? readinessScore : undefined,
    });

    return NextResponse.json({ message: 'Posted successfully', post });
  } catch (error) {
    console.error('Community post error:', error);
    return NextResponse.json({ error: 'Failed to post. Please try again.' }, { status: 500 });
  }
}