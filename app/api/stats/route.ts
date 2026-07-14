import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import Roadmap from '@/models/Roadmap';
import Post from '@/models/Post';

export async function GET() {
  try {
    await connectDB();

    const [roadmapCount, postCount, avgResult] = await Promise.all([
      Roadmap.countDocuments({}),
      Post.countDocuments({}),
      Resume.aggregate([
        { $match: { 'analysis.readinessScore': { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$analysis.readinessScore' } } }
      ])
    ]);

    return NextResponse.json({
      roadmapsGenerated: roadmapCount,
      communityPosts: postCount,
      avgReadiness: avgResult[0] ? Math.round(avgResult[0].avg) : 0,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ roadmapsGenerated: 0, communityPosts: 0, avgReadiness: 0 });
  }
}