interface RequiredSkill {
  skill: string;
  priority: string;
}

interface GapResult {
  matchedSkills: string[];
  missingSkills: string[];
  readinessScore: number;
}

function normalize(skill: string): string {
  return skill.toLowerCase().replace(/[.\-\s]/g, '');
}

export function calculateSkillGap(
  extractedSkills: string[],
  requiredSkills: RequiredSkill[]
): GapResult {
  const normalizedExtracted = extractedSkills.map(normalize);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of requiredSkills) {
    const normalizedReq = normalize(req.skill);
    const isMatched = normalizedExtracted.some(
      (extracted) => extracted.includes(normalizedReq) || normalizedReq.includes(extracted)
    );

    if (isMatched) {
      matchedSkills.push(req.skill);
    } else {
      missingSkills.push(req.skill);
    }
  }

  const readinessScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return { matchedSkills, missingSkills, readinessScore };
}

interface RuleBasedCheck {
  score: number;
  issues: string[];
}

export function runRuleBasedATSChecks(resumeText: string): RuleBasedCheck {
  const issues: string[] = [];
  let deductions = 0;

  const wordCount = resumeText.trim().split(/\s+/).length;

  if (wordCount < 150) {
    issues.push('Resume is too short — ATS systems may flag it as incomplete.');
    deductions += 20;
  } else if (wordCount > 1200) {
    issues.push('Resume is too long — aim for 1-2 pages worth of content.');
    deductions += 10;
  }

  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  if (!hasEmail) {
    issues.push('No email address detected — this is critical for ATS contact extraction.');
    deductions += 15;
  }

  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(resumeText);
  if (!hasPhone) {
    issues.push('No phone number detected.');
    deductions += 10;
  }

  const sectionKeywords = ['experience', 'education', 'skills', 'summary', 'projects'];
  const lowerText = resumeText.toLowerCase();
  const foundSections = sectionKeywords.filter((kw) => lowerText.includes(kw));

  if (foundSections.length < 3) {
    issues.push('Missing standard section headers (Experience, Education, Skills, etc.) — ATS relies on these to categorize content.');
    deductions += 20;
  }

  const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ (users|students|projects|clients|team)/i.test(resumeText);
  if (!hasNumbers) {
    issues.push('No quantifiable achievements found (numbers, percentages, metrics) — these strengthen impact statements.');
    deductions += 15;
  }

  const lines = resumeText.split('\n').filter((l) => l.trim().length > 0);
  const avgWordsPerLine = wordCount / Math.max(lines.length, 1);
  if (avgWordsPerLine > 40) {
    issues.push('Content appears to be in long paragraphs rather than concise bullet points.');
    deductions += 10;
  }

  const score = Math.max(0, 100 - deductions);
  return { score, issues };
}

// Master skill dictionary — combines multiple career domains
const COMMON_TECH_SKILLS = [
  // Software / Tech
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  'React', 'Next.js', 'Vue', 'Angular', 'Redux', 'Redux Toolkit', 'Node.js', 'Express.js', 'NestJS',
  'HTML5', 'HTML', 'CSS3', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Material-UI',
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Firebase', 'SQL',
  'REST API', 'RESTful APIs', 'GraphQL', 'WebSocket', 'Socket.io', 'WebRTC',
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'AWS', 'Azure',
  'Google Cloud', 'Vercel', 'Netlify', 'Render',
  'JWT', 'OAuth', 'bcrypt', 'Passport.js',
  'Jest', 'Mocha', 'Cypress', 'Enzyme', 'Testing Library',
  'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier',
  'System Design', 'Microservices', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
  'Terraform', 'Linux', 'Bash', 'PowerShell',

  // Design
  'Figma', 'Adobe XD', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Sketch',
  'UI/UX Design', 'Wireframing', 'Prototyping', 'Typography', 'Branding', 'Canva',

  // Data / Analytics
  'Power BI', 'Tableau', 'Excel', 'R', 'Google Analytics', 'Google Data Studio', 'Data Visualization',

  // Project Management
  'Agile', 'Scrum', 'Kanban', 'Jira', 'Trello', 'Asana', 'Monday.com', 'Risk Management',
  'Stakeholder Management', 'Budgeting', 'Gantt Charts', 'PMP', 'Waterfall',

  // Marketing
  'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'Meta Ads', 'Content Marketing', 'Email Marketing',
  'Social Media Marketing', 'Copywriting', 'Marketing Strategy', 'HubSpot', 'Mailchimp',
  'Brand Management', 'Market Research', 'A/B Testing', 'Google Tag Manager', 'CRM',

  // Sales
  'Salesforce', 'Lead Generation', 'Cold Calling', 'Negotiation', 'Account Management',
  'Sales Forecasting', 'Pipeline Management', 'B2B Sales', 'B2C Sales', 'CRM Software',
  'Customer Relationship Management', 'Upselling', 'Closing Deals',

  // HR
  'Recruitment', 'Talent Acquisition', 'Onboarding', 'Employee Relations', 'HRIS',
  'Payroll Management', 'Performance Management', 'Conflict Resolution', 'Compensation & Benefits',
  'Workday', 'BambooHR', 'Labor Law Compliance',

  // Finance / Accounting
  'QuickBooks', 'SAP', 'Financial Analysis', 'Financial Reporting', 'Bookkeeping', 'Tax Preparation',
  'Budget Forecasting', 'Accounts Payable', 'Accounts Receivable', 'GAAP', 'Auditing',
  'Financial Modeling', 'Reconciliation', 'Payroll',

  // Writing / Content
  'Content Writing', 'Copywriting', 'Blogging', 'Technical Writing', 'Proofreading', 'Editing',
  'SEO Writing', 'Creative Writing', 'Content Strategy', 'WordPress',

  // Customer Support
  'Customer Service', 'Zendesk', 'Freshdesk', 'Live Chat Support', 'Ticketing Systems',
  'Conflict Resolution', 'Customer Satisfaction', 'Help Desk',

  // Teaching / Education
  'Curriculum Development', 'Lesson Planning', 'Classroom Management', 'Instructional Design',
  'Student Assessment', 'E-Learning', 'Google Classroom', 'LMS',

  // General / Soft
  'Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Time Management',
  'Public Speaking', 'Critical Thinking', 'Microsoft Office', 'PowerPoint', 'Word'
];

const SKILL_ALIASES: Record<string, string[]> = {
  'Git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
  'Node.js': ['node.js', 'nodejs', 'node js', 'node'],
  'Next.js': ['next.js', 'nextjs', 'next js'],
  'Express.js': ['express.js', 'expressjs', 'express js', 'express'],
  'REST API': ['rest api', 'restful api', 'restful apis', 'rest apis'],
  'SEO': ['seo', 'search engine optimization'],
  'SEM': ['sem', 'search engine marketing'],
  'CRM': ['crm', 'customer relationship management'],
  'Excel': ['excel', 'ms excel', 'microsoft excel'],
  'PowerPoint': ['powerpoint', 'ms powerpoint', 'microsoft powerpoint'],
  'Word': ['ms word', 'microsoft word'],
};

function addBoundariesForConcatenatedText(text: string): string {
  return text.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function textContainsSkill(originalLowerText: string, spacedLowerText: string, skill: string): boolean {
  const aliases = SKILL_ALIASES[skill] || [skill.toLowerCase()];

  for (const alias of aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');

    if (pattern.test(originalLowerText) || pattern.test(spacedLowerText)) {
      return true;
    }
  }
  return false;
}

export function extractSkillsFromText(resumeText: string): string[] {
  const found: string[] = [];

  const originalLowerText = resumeText.toLowerCase();
  const spacedText = addBoundariesForConcatenatedText(resumeText);
  const spacedLowerText = spacedText.toLowerCase();

  for (const skill of COMMON_TECH_SKILLS) {
    if (textContainsSkill(originalLowerText, spacedLowerText, skill)) {
      found.push(skill);
    }
  }

  return found;
}