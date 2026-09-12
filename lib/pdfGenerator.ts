import jsPDF from 'jspdf';

interface Week {
  weekNumber: number;
  topics: string[];
  resources: { title: string; url: string }[];
  miniProjects: string[];
}

interface ATSIssue {
  category?: string;
  issue?: string;
  message?: string;
  severity?: string;
  [key: string]: any;
}

interface ATSSuggestion {
  category?: string;
  suggestion?: string;
  message?: string;
  priority?: string;
  [key: string]: any;
}

interface ResumeAnalysisPdfData {
  targetRole: string;
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  weeks?: Week[];
  atsScore?: number;
  atsIssues?: ATSIssue[];
  atsSuggestions?: ATSSuggestion[];
  extractedSkills?: string[];
  extractedName?: string;
  extractedEmail?: string;
  extractedPhone?: string;
  totalWords?: number;
  generatedAt?: string;
}

function formatRoleName(role: string): string {
  return role
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getScoreColor(score: number): [number, number, number] {
  if (score >= 80) return [22, 163, 74];
  if (score >= 60) return [234, 179, 8];
  return [239, 68, 68];
}

function getScoreGrade(score: number): string {
  if (score >= 90) return 'A+ (Excellent)';
  if (score >= 80) return 'A (Very Strong)';
  if (score >= 70) return 'B (Good)';
  if (score >= 60) return 'C (Fair)';
  if (score >= 50) return 'D (Needs Work)';
  return 'F (Critical)';
}

function getScoreAdvice(score: number): string {
  if (score >= 85) return 'Your resume is well-optimized. Focus on adding quantifiable achievements to stand out further.';
  if (score >= 70) return 'Good foundation! A few targeted improvements will significantly boost your ATS pass rate.';
  if (score >= 55) return 'Several ATS blockers detected. Follow the suggestions below before applying to roles.';
  return 'Your resume has major ATS compatibility issues. We strongly recommend revising it using the suggestions below.';
}

function getReadinessAdvice(score: number): string {
  if (score >= 85) return 'You are highly interview-ready. Practice behavioral questions and begin applying aggressively.';
  if (score >= 70) return 'You have a solid skill base. Close the remaining skill gaps and begin applying in 2-4 weeks.';
  if (score >= 50) return 'You are in the learning phase. Follow the roadmap closely — you will be ready in 1-2 months.';
  return 'You are building fundamentals. Do not rush applications; complete the full roadmap first.';
}

function extractIssueText(i: ATSIssue): string {
  return (i.issue || i.message || i.category || JSON.stringify(i)).toString();
}

function extractSuggestionText(s: ATSSuggestion): string {
  return (s.suggestion || s.message || s.category || JSON.stringify(s)).toString();
}

export function generateRoadmapPdf(data: ResumeAnalysisPdfData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      y = 18;
    }
  };

  const drawFooter = () => {
    const prevY = y;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    const dateText = data.generatedAt ? `Generated: ${data.generatedAt}` : `Generated: ${new Date().toLocaleDateString()}`;
    doc.text(dateText, margin, pageHeight - 10);
    doc.text(
      `AI Career Navigator — ${formatRoleName(data.targetRole)} Report`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
    doc.setTextColor(0);
    y = prevY;
  };

  const drawSectionHeader = (number: string, title: string) => {
    checkPageBreak(18);
    y += 4;
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 8, y);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${number}  ${title}`, margin + 12, y + 1);
    y += 8;
  };

  const drawBullet = (text: string, indent = 20, bulletChar = '•') => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(text, contentWidth - (indent - margin) - 3);
    lines.forEach((line: string, idx: number) => {
      checkPageBreak(5);
      if (idx === 0) {
        doc.text(bulletChar, indent, y);
        doc.text(line, indent + 4, y);
      } else {
        doc.text(line, indent + 4, y);
      }
      y += 5;
    });
  };

  const drawBadge = (label: string, bg: [number, number, number], fg: [number, number, number], x: number, by: number, w: number, h: number) => {
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.roundedRect(x, by - h + 1, w, h, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(fg[0], fg[1], fg[2]);
    doc.text(label, x + w / 2, by - 1, { align: 'center' });
  };

  // ======================================
  // PAGE 1: HEADER BANNER
  // ======================================
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(165, 180, 252);
  doc.text('AI CAREER NAVIGATOR', margin, 12);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Resume & Career Analysis Report', margin, 24);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Target Role:  ${formatRoleName(data.targetRole)}`, margin, 36);

  y = 52;

  // ======================================
  // EXECUTIVE SUMMARY CARDS
  // ======================================
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y - 6, contentWidth, 48, 4, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, y - 6, contentWidth, 48, 4, 4, 'S');

  // Card 1: ATS Score
  const cardX1 = margin + 6;
  const atsScore = data.atsScore != null ? data.atsScore : (data.readinessScore || 0);
  const atsColor = getScoreColor(atsScore);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ATS COMPATIBILITY SCORE', cardX1, y + 2);

  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(atsColor[0], atsColor[1], atsColor[2]);
  doc.text(`${atsScore}%`, cardX1, y + 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(getScoreGrade(atsScore), cardX1, y + 32);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + contentWidth / 3, y - 2, margin + contentWidth / 3, y + 38);

  // Card 2: Role Readiness
  const cardX2 = margin + contentWidth / 3 + 6;
  const readinessColor = getScoreColor(data.readinessScore);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ROLE READINESS', cardX2, y + 2);

  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(readinessColor[0], readinessColor[1], readinessColor[2]);
  doc.text(`${data.readinessScore}%`, cardX2, y + 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(getScoreGrade(data.readinessScore), cardX2, y + 32);

  // Divider line 2
  doc.line(margin + (contentWidth * 2) / 3, y - 2, margin + (contentWidth * 2) / 3, y + 38);

  // Card 3: Skills
  const cardX3 = margin + (contentWidth * 2) / 3 + 6;
  const totalRoleSkills = (data.matchedSkills?.length || 0) + (data.missingSkills?.length || 0);
  const skillPercent = totalRoleSkills > 0
    ? Math.round(((data.matchedSkills?.length || 0) / totalRoleSkills) * 100)
    : 0;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SKILL MATCH', cardX3, y + 2);

  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241);
  doc.text(`${skillPercent}%`, cardX3, y + 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${data.matchedSkills?.length || 0}/${totalRoleSkills || '—'} role skills`, cardX3, y + 32);

  y += 52;

  // ======================================
  // PERSONAL ADVICE SUMMARY
  // ======================================
  checkPageBreak(16);
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(margin, y - 5, contentWidth, 18, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('💡  QUICK SUMMARY FOR YOU', margin + 6, y + 1);
  y += 9;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 48, 163);
  const summaryLines = doc.splitTextToSize(
    `${getScoreAdvice(atsScore)} ${getReadinessAdvice(data.readinessScore)}`,
    contentWidth - 12
  );
  doc.text(summaryLines, margin + 6, y);
  y += summaryLines.length * 5 + 4;

  // ======================================
  // SECTION 1: RESUME PROFILE
  // ======================================
  drawSectionHeader('01', 'Resume Profile');

  if (data.extractedName || data.extractedEmail || data.extractedPhone || data.totalWords) {
    const items = [
      { label: 'Name', value: data.extractedName },
      { label: 'Email', value: data.extractedEmail },
      { label: 'Phone', value: data.extractedPhone },
      { label: 'Resume Word Count', value: data.totalWords ? `${data.totalWords} words` : undefined },
      { label: 'Skills Extracted', value: data.extractedSkills?.length ? `${data.extractedSkills.length} skills` : undefined },
      { label: 'Applied For', value: formatRoleName(data.targetRole) },
    ].filter((i) => i.value);

    items.forEach((item) => {
      checkPageBreak(6);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`${item.label}:`, margin + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(String(item.value), margin + 42, y);
      y += 6;
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Applied for: ${formatRoleName(data.targetRole)}`, margin + 4, y);
    y += 6;
    if (data.extractedSkills?.length) {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`Skills extracted from resume: ${data.extractedSkills.length}`, margin + 4, y);
      y += 6;
    }
  }

  // ======================================
  // SECTION 2: SKILL GAP ANALYSIS
  // ======================================
  drawSectionHeader('02', 'Skill Gap Analysis');

  const missingCount = data.missingSkills?.length || 0;
  const matchedCount = data.matchedSkills?.length || 0;

  if (matchedCount > 0) {
    checkPageBreak(10);
    drawBadge(`${matchedCount} MATCHED`, [220, 252, 231], [22, 101, 52], margin + 4, y, 52, 7);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text('Skills you already have — keep them on your resume:', margin + 4, y);
    y += 6;
    const matchedText = data.matchedSkills.join(', ');
    const matchedLines = doc.splitTextToSize(matchedText, contentWidth - 4);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    matchedLines.forEach((l: string) => { checkPageBreak(5); doc.text(l, margin + 4, y); y += 5; });
    y += 4;
  }

  if (missingCount > 0) {
    checkPageBreak(12);
    drawBadge(`${missingCount} TO LEARN`, [254, 226, 226], [153, 27, 27], margin + 4, y, 52, 7);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(153, 27, 27);
    doc.text('Missing skills — learn these to qualify for the role:', margin + 4, y);
    y += 7;
    data.missingSkills.forEach((s, i) => {
      drawBullet(`${i + 1}. ${s}`, margin + 8, '');
      if ((i + 1) % 3 === 0) y += 1;
    });
    y += 2;
  } else {
    checkPageBreak(10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(22, 101, 52);
    doc.text('✅  You have all required skills for this role!', margin + 4, y);
    y += 8;
  }

  // ======================================
  // SECTION 3: ATS ISSUES & FIXES
  // ======================================
  drawSectionHeader('03', 'ATS Issues to Fix');

  const issues = data.atsIssues?.filter((i) => extractIssueText(i).trim().length > 0) || [];

  if (issues.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const issueIntro = `${issues.length} issue(s) detected that may prevent your resume from passing ATS (Applicant Tracking System) filters.`;
    const il = doc.splitTextToSize(issueIntro, contentWidth - 4);
    doc.text(il, margin + 4, y);
    y += il.length * 5 + 4;

    issues.forEach((issue, i) => {
      drawBullet(`${i + 1}. ${extractIssueText(issue)}`, margin + 8, '');
    });
    y += 2;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(22, 101, 52);
    doc.text('✅  No major ATS issues detected. Great job!', margin + 4, y);
    y += 8;
  }

  // ======================================
  // SECTION 4: AI RECOMMENDATIONS
  // ======================================
  drawSectionHeader('04', 'AI Recommendations');

  const suggestions = data.atsSuggestions?.filter((s) => extractSuggestionText(s).trim().length > 0) || [];

  if (suggestions.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const sugIntro = 'Apply these changes to significantly improve your resume scoring and interview callback rate:';
    const sl = doc.splitTextToSize(sugIntro, contentWidth - 4);
    doc.text(sl, margin + 4, y);
    y += sl.length * 5 + 5;

    suggestions.forEach((s, i) => {
      drawBullet(`${i + 1}. ${extractSuggestionText(s)}`, margin + 8, '');
    });
    y += 2;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(22, 101, 52);
    doc.text('✅  Your resume is well-optimized. Keep it up!', margin + 4, y);
    y += 8;
  }

  // ======================================
  // SECTION 5: PROFESSIONAL ADVICE
  // ======================================
  drawSectionHeader('05', 'Professional Career Advice');

  checkPageBreak(50);
  const advice: { title: string; items: string[] }[] = [
    {
      title: 'For Your Resume',
      items: [
        'Use action verbs (Led, Built, Optimized, Delivered) to start every bullet point.',
        'Add numbers & metrics wherever possible — quantify impact (e.g. "+35% conversion", "served 200+ users").',
        'Keep your resume to 1 page if you have <10 years of experience.',
        'Use a clean, standard font (Calibri, Arial, Garamond, Lato, Helvetica). Avoid graphics or columns.',
        'Save and submit as PDF — never as DOCX — unless specifically requested.',
      ],
    },
    {
      title: 'For Applying & Interviews',
      items: [
        'Tailor your resume summary and top 3 bullets to match keywords from each specific job description.',
        'Prepare 3 STAR-method stories (Situation → Task → Action → Result) before any interview.',
        'Research the company mission, recent news, and product before applying.',
        'After an interview, send a personalized thank-you note within 24 hours.',
        'Track applications in a spreadsheet; follow up after 7-10 days if no response.',
      ],
    },
    {
      title: 'For Long-Term Growth',
      items: [
        'Build 2-3 portfolio projects demonstrating your missing skills — deploy them publicly.',
        'Contribute to open-source or write technical articles to establish credibility.',
        'Network with 2-3 professionals in your target role every week on LinkedIn.',
        'Re-analyze your resume with this tool after every major update to track progress.',
        'Treat job hunting as a full-time job: 4-6 hours of focused effort per day.',
      ],
    },
  ];

  advice.forEach((section) => {
    checkPageBreak(10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`▸  ${section.title}`, margin + 4, y);
    y += 7;
    section.items.forEach((t) => drawBullet(t, margin + 12));
    y += 2;
  });

  // ======================================
  // SECTION 6: LEARNING ROADMAP (if present)
  // ======================================
  if (data.weeks && data.weeks.length > 0) {
    drawSectionHeader('06', 'Learning Roadmap');

    data.weeks.forEach((week) => {
      checkPageBreak(30);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(`Week ${week.weekNumber}`, margin + 4, y);
      y += 7;

      if (week.topics && week.topics.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Topics to learn:', margin + 8, y);
        y += 6;
        week.topics.forEach((t) => drawBullet(t, margin + 14));
        y += 2;
      }

      if (week.miniProjects && week.miniProjects.length > 0) {
        checkPageBreak(10);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Hands-on project:', margin + 8, y);
        y += 6;
        week.miniProjects.forEach((p) => drawBullet(p, margin + 14));
        y += 2;
      }

      if (week.resources && week.resources.length > 0) {
        checkPageBreak(10);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Learning resources:', margin + 8, y);
        y += 6;
        week.resources.forEach((r) => {
          checkPageBreak(6);
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(37, 99, 235);
          doc.textWithLink(`• ${r.title}  ↗`, margin + 14, y, { url: r.url });
          y += 5;
        });
      }

      y += 5;
    });
  }

  // ======================================
  // CLOSING NOTE
  // ======================================
  checkPageBreak(22);
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('You Got This 🚀', margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const closing =
    'Your career journey is unique and incremental. Even 1% improvement per day compounds dramatically over 3 months. ' +
    'Revisit this report weekly, track the checklist of fixes, and celebrate the small wins. ' +
    'The perfect resume does not exist — but a consistently improving one will get you hired.';
  const closingLines = doc.splitTextToSize(closing, contentWidth);
  doc.text(closingLines, margin, y);
  y += closingLines.length * 5 + 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(`— AI Career Navigator  ·  Generated ${data.generatedAt || new Date().toLocaleDateString()}`, margin, y);

  drawFooter();

  // ======================================
  // FINAL — GENERATE FILENAME & SAVE
  // ======================================
  const safeRole = data.targetRole.replace(/[^a-zA-Z0-9_-]/g, '-');
  doc.save(`Career-Report-${safeRole}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
