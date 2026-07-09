import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import RoleRequirement from '@/models/RoleRequirement';
import Roadmap from '@/models/Roadmap';
import { extractSkillsFromResume, generateRoadmap } from '@/services/groqService';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { resumeId } = await request.json();

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found. It may have been deleted, please upload again.' }, { status: 404 });
    }

    const roleReq = await RoleRequirement.findOne({ role: resume.targetRole });
    if (!roleReq) {
      return NextResponse.json({ error: 'No skill data exists for this role yet. Try a different role.' }, { status: 404 });
    }

    let extractedSkills: string[];
    let result;
    try {
      extractedSkills = await extractSkillsFromResume(resume.rawText);
      result = await generateRoadmap(extractedSkills, resume.targetRole, roleReq.requiredSkills);
    } catch (aiErr) {
      console.error('AI processing error:', aiErr);
      return NextResponse.json(
        { error: 'The AI analysis service is temporarily unavailable. Please try again in a moment.' },
        { status: 502 }
      );
    }

    resume.extractedSkills = extractedSkills;
    resume.analysis = {
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      readinessScore: result.readinessScore
    };
    await resume.save();

    const roadmap = await Roadmap.create({
      resumeId: resume._id,
      weeks: result.roadmap
    });

    return NextResponse.json({
      message: 'Analysis complete',
      extractedSkills,
      analysis: resume.analysis,
      roadmapId: roadmap._id,
      roadmap: result.roadmap
    });

  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume', details: String(error) },
      { status: 500 }
    );
  }
}