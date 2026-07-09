import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// require() use kar rahe hain taake dotenv config ke BAAD load ho (import hoisting se bachne ke liye)
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
      { skill: 'Statistics', priority: 'must-have' },
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
      { skill: 'Machine Learning', priority: 'must-have' },
      { skill: 'Statistics', priority: 'must-have' },
      { skill: 'Power BI', priority: 'good-to-have' },
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
      { skill: 'Authentication (JWT)', priority: 'must-have' },
      { skill: 'Docker', priority: 'good-to-have' },
    ]
  }
];

async function seed() {
  await connectDB();

  for (const roleData of rolesData) {
    await RoleRequirement.findOneAndUpdate(
      { role: roleData.role },
      roleData,
      { upsert: true, new: true }
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