import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import RoleRequirement from '@/models/RoleRequirement';
import Roadmap from '@/models/Roadmap';
import jwt from 'jsonwebtoken';
import { generateRoadmapForGaps, checkATSCompatibility } from '@/services/groqService';
import { calculateSkillGap, runRuleBasedATSChecks, extractSkillsFromText } from '@/services/skillGapService';

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Skill extraction ab pure code se hota hai — reliable, koi AI JSON parsing risk nahi
    const roleSkillNames = roleReq.requiredSkills.map((r: { skill: string }) => r.skill);
    const extractedSkills = extractSkillsFromText(resume.rawText, roleSkillNames);

    const gapResult = calculateSkillGap(extractedSkills, roleReq.requiredSkills);

    let atsCheck;
    let weeks;

    try {
      const aiATSCheck = await checkATSCompatibility(resume.rawText);
      const ruleCheck = runRuleBasedATSChecks(resume.rawText);
      const combinedScore = Math.round((aiATSCheck.score + ruleCheck.score) / 2);

      atsCheck = {
        score: combinedScore,
        issues: [...ruleCheck.issues, ...aiATSCheck.issues],
        suggestions: aiATSCheck.suggestions
      };

      resume.extractedSkills = extractedSkills;
      resume.analysis = gapResult;
      resume.atsCheck = atsCheck;
      await resume.save();

      weeks = await generateRoadmapForGaps(gapResult.missingSkills, resume.targetRole);
    } catch (aiErr) {
      console.error('AI processing error:', aiErr);
      return NextResponse.json(
        { error: 'The AI analysis service is temporarily unavailable. Please try again in a moment.' },
        { status: 502 }
      );
    }

    const roadmap = await Roadmap.create({
      userId,
      resumeId: resume._id,
      weeks
    });

    return NextResponse.json({
      message: 'Analysis complete',
      extractedSkills,
      analysis: resume.analysis,
      atsCheck: resume.atsCheck,
      rawText: resume.rawText,
      roadmapId: roadmap._id,
      roadmap: weeks
    });

  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume', details: String(error) },
      { status: 500 }
    );
  }
}