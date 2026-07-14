import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectDB = require('../lib/db').default;
const RoleRequirement = require('../models/RoleRequirement').default;

const rolesData = [
  {
    role: 'software-development',
    requiredSkills: [
      { skill: 'JavaScript', priority: 'must-have' },
      { skill: 'React', priority: 'must-have' },
      { skill: 'Node.js', priority: 'must-have' },
      { skill: 'REST API', priority: 'must-have' },
      { skill: 'MongoDB', priority: 'must-have' },
      { skill: 'Git', priority: 'must-have' },
      { skill: 'TypeScript', priority: 'good-to-have' },
      { skill: 'Docker', priority: 'good-to-have' },
      { skill: 'System Design', priority: 'good-to-have' },
    ]
  },
  {
    role: 'ai-ml',
    requiredSkills: [
      { skill: 'Python', priority: 'must-have' },
      { skill: 'NumPy', priority: 'must-have' },
      { skill: 'Pandas', priority: 'must-have' },
      { skill: 'Scikit-learn', priority: 'must-have' },
      { skill: 'TensorFlow', priority: 'good-to-have' },
      { skill: 'PyTorch', priority: 'good-to-have' },
      { skill: 'SQL', priority: 'must-have' },
    ]
  },
  {
    role: 'devops',
    requiredSkills: [
      { skill: 'Docker', priority: 'must-have' },
      { skill: 'Kubernetes', priority: 'must-have' },
      { skill: 'CI/CD', priority: 'must-have' },
      { skill: 'AWS', priority: 'must-have' },
      { skill: 'Linux', priority: 'must-have' },
      { skill: 'Terraform', priority: 'good-to-have' },
      { skill: 'Jenkins', priority: 'good-to-have' },
    ]
  },
  {
    role: 'data-science',
    requiredSkills: [
      { skill: 'Python', priority: 'must-have' },
      { skill: 'SQL', priority: 'must-have' },
      { skill: 'Pandas', priority: 'must-have' },
      { skill: 'Data Visualization', priority: 'must-have' },
      { skill: 'Power BI', priority: 'good-to-have' },
      { skill: 'Tableau', priority: 'good-to-have' },
    ]
  },
  {
    role: 'frontend',
    requiredSkills: [
      { skill: 'HTML', priority: 'must-have' },
      { skill: 'CSS', priority: 'must-have' },
      { skill: 'JavaScript', priority: 'must-have' },
      { skill: 'React', priority: 'must-have' },
      { skill: 'TypeScript', priority: 'must-have' },
      { skill: 'Tailwind CSS', priority: 'good-to-have' },
      { skill: 'Next.js', priority: 'good-to-have' },
    ]
  },
  {
    role: 'backend',
    requiredSkills: [
      { skill: 'Node.js', priority: 'must-have' },
      { skill: 'Express.js', priority: 'must-have' },
      { skill: 'MongoDB', priority: 'must-have' },
      { skill: 'SQL', priority: 'must-have' },
      { skill: 'REST API', priority: 'must-have' },
      { skill: 'Docker', priority: 'good-to-have' },
    ]
  },
  {
    role: 'digital-marketing',
    requiredSkills: [
      { skill: 'SEO', priority: 'must-have' },
      { skill: 'Google Ads', priority: 'must-have' },
      { skill: 'Content Marketing', priority: 'must-have' },
      { skill: 'Social Media Marketing', priority: 'must-have' },
      { skill: 'Google Analytics', priority: 'must-have' },
      { skill: 'Email Marketing', priority: 'good-to-have' },
      { skill: 'HubSpot', priority: 'good-to-have' },
    ]
  },
  {
    role: 'sales',
    requiredSkills: [
      { skill: 'Lead Generation', priority: 'must-have' },
      { skill: 'Negotiation', priority: 'must-have' },
      { skill: 'CRM Software', priority: 'must-have' },
      { skill: 'Salesforce', priority: 'good-to-have' },
      { skill: 'Account Management', priority: 'must-have' },
      { skill: 'Closing Deals', priority: 'good-to-have' },
    ]
  },
  {
    role: 'human-resources',
    requiredSkills: [
      { skill: 'Recruitment', priority: 'must-have' },
      { skill: 'Talent Acquisition', priority: 'must-have' },
      { skill: 'Onboarding', priority: 'must-have' },
      { skill: 'Employee Relations', priority: 'must-have' },
      { skill: 'HRIS', priority: 'good-to-have' },
      { skill: 'Payroll Management', priority: 'good-to-have' },
    ]
  },
  {
    role: 'finance-accounting',
    requiredSkills: [
      { skill: 'Financial Analysis', priority: 'must-have' },
      { skill: 'Financial Reporting', priority: 'must-have' },
      { skill: 'Excel', priority: 'must-have' },
      { skill: 'QuickBooks', priority: 'good-to-have' },
      { skill: 'Bookkeeping', priority: 'must-have' },
      { skill: 'Auditing', priority: 'good-to-have' },
    ]
  },
  {
    role: 'graphic-design',
    requiredSkills: [
      { skill: 'Adobe Photoshop', priority: 'must-have' },
      { skill: 'Adobe Illustrator', priority: 'must-have' },
      { skill: 'Figma', priority: 'must-have' },
      { skill: 'Typography', priority: 'must-have' },
      { skill: 'Branding', priority: 'good-to-have' },
      { skill: 'Adobe InDesign', priority: 'good-to-have' },
    ]
  },
  {
    role: 'content-writing',
    requiredSkills: [
      { skill: 'Content Writing', priority: 'must-have' },
      { skill: 'SEO Writing', priority: 'must-have' },
      { skill: 'Editing', priority: 'must-have' },
      { skill: 'Proofreading', priority: 'must-have' },
      { skill: 'Content Strategy', priority: 'good-to-have' },
      { skill: 'WordPress', priority: 'good-to-have' },
    ]
  },
  {
    role: 'customer-support',
    requiredSkills: [
      { skill: 'Customer Service', priority: 'must-have' },
      { skill: 'Zendesk', priority: 'good-to-have' },
      { skill: 'Ticketing Systems', priority: 'must-have' },
      { skill: 'Conflict Resolution', priority: 'must-have' },
      { skill: 'Customer Satisfaction', priority: 'must-have' },
    ]
  },
  {
    role: 'project-management',
    requiredSkills: [
      { skill: 'Agile', priority: 'must-have' },
      { skill: 'Scrum', priority: 'must-have' },
      { skill: 'Jira', priority: 'must-have' },
      { skill: 'Stakeholder Management', priority: 'must-have' },
      { skill: 'Risk Management', priority: 'good-to-have' },
      { skill: 'Budgeting', priority: 'good-to-have' },
    ]
  },
  {
    role: 'teaching-education',
    requiredSkills: [
      { skill: 'Curriculum Development', priority: 'must-have' },
      { skill: 'Lesson Planning', priority: 'must-have' },
      { skill: 'Classroom Management', priority: 'must-have' },
      { skill: 'Student Assessment', priority: 'must-have' },
      { skill: 'E-Learning', priority: 'good-to-have' },
      { skill: 'LMS', priority: 'good-to-have' },
    ]
  }
];

async function seed() {
  await connectDB();

  for (const roleData of rolesData) {
    await RoleRequirement.findOneAndUpdate(
      { role: roleData.role },
      roleData,
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`Seeded: ${roleData.role}`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err: any) => {
  console.error('Seeding error:', err);
  process.exit(1);
});