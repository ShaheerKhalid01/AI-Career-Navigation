import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import { parseResume } from '@/services/resumeParser';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['pdf', 'docx'];
const VALID_ROLES = [
  'software-development', 'ai-ml', 'devops', 'data-science', 'frontend', 'backend',
  'digital-marketing', 'sales', 'human-resources', 'finance-accounting',
  'graphic-design', 'content-writing', 'customer-support', 'project-management',
  'teaching-education'
];

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const targetRole = formData.get('targetRole') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No resume file was received. Please attach a PDF or DOCX file.' }, { status: 400 });
    }

    if (!targetRole || !VALID_ROLES.includes(targetRole)) {
      return NextResponse.json({ error: 'Select a valid target role before uploading.' }, { status: 400 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are supported.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 5MB.' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'The uploaded file is empty.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rawText: string;
    try {
      rawText = await parseResume(buffer, file.name);
    } catch (parseErr) {
      console.error('Parse error:', parseErr);
      return NextResponse.json({ error: 'Could not read this file. It may be corrupted or password-protected.' }, { status: 422 });
    }

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ error: 'This resume has too little readable text. Try a different file.' }, { status: 422 });
    }

    const resume = await Resume.create({
      fileName: file.name,
      rawText,
      targetRole,
      extractedSkills: [],
      analysis: { matchedSkills: [], missingSkills: [], readinessScore: 0 }
    });

    return NextResponse.json({
      message: 'Resume uploaded and parsed successfully',
      resumeId: resume._id,
      fileName: resume.fileName,
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: 'Something went wrong while processing your resume. Please try again.' }, { status: 500 });
  }
}