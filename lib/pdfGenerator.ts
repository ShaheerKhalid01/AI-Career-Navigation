import jsPDF from 'jspdf';

interface Week {
  weekNumber: number;
  topics: string[];
  resources: { title: string; url: string }[];
  miniProjects: string[];
}

interface RoadmapPdfData {
  targetRole: string;
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  weeks: Week[];
}

export function generateRoadmapPdf(data: RoadmapPdfData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Career Navigator', margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Skill Gap Report — ${data.targetRole.replace(/-/g, ' ').toUpperCase()}`, margin, y);
  y += 12;

  // Readiness Score
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Readiness Score: ${data.readinessScore}%`, margin, y);
  y += 10;

  // Matched Skills
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Matched Skills:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const matchedText = data.matchedSkills.length > 0 ? data.matchedSkills.join(', ') : 'None';
  const matchedLines = doc.splitTextToSize(matchedText, pageWidth - margin * 2);
  doc.text(matchedLines, margin, y);
  y += matchedLines.length * 5 + 6;

  // Missing Skills
  checkPageBreak(20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Missing Skills:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const missingText = data.missingSkills.length > 0 ? data.missingSkills.join(', ') : 'None';
  const missingLines = doc.splitTextToSize(missingText, pageWidth - margin * 2);
  doc.text(missingLines, margin, y);
  y += missingLines.length * 5 + 12;

  // Roadmap
  checkPageBreak(15);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Learning Roadmap', margin, y);
  y += 10;

  data.weeks.forEach((week) => {
    checkPageBreak(30);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Week ${week.weekNumber}`, margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Topics:', margin, y);
    doc.setFont('helvetica', 'normal');
    const topicsText = week.topics.join(', ');
    const topicsLines = doc.splitTextToSize(topicsText, pageWidth - margin * 2 - 20);
    doc.text(topicsLines, margin + 20, y);
    y += topicsLines.length * 5 + 3;

    if (week.miniProjects.length > 0) {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Project:', margin, y);
      doc.setFont('helvetica', 'normal');
      const projLines = doc.splitTextToSize(week.miniProjects[0], pageWidth - margin * 2 - 20);
      doc.text(projLines, margin + 20, y);
      y += projLines.length * 5 + 3;
    }

    if (week.resources.length > 0) {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Resources:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      week.resources.forEach((r) => {
        checkPageBreak(6);
        doc.setTextColor(37, 99, 235);
        doc.textWithLink(`- ${r.title}`, margin + 5, y, { url: r.url });
        doc.setTextColor(0);
        y += 5;
      });
    }

    y += 8;
  });

  doc.save(`Career-Roadmap-${data.targetRole}.pdf`);
}