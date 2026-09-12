import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

function getUserId(req: NextRequest): string | null {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(auth.slice(7), getJwtSecret()) as unknown as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// Strip HTML tags from text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Fetch jobs from Remotive API (free, remote jobs)
async function fetchRemotiveJobs(category?: string) {
  try {
    const url = category
      ? `https://remotive.com/api/remote-jobs?category=${category}`
      : 'https://remotive.com/api/remote-jobs';
    const response = await fetch(url);
    const data = await response.json();

    return data.jobs?.map((job: any) => {
      // Map Remotive category back to project role
      const remotiveCategory = job.category_slug || category;
      const projectRole = remotiveCategoryToRole[remotiveCategory] || 'general';

      return {
        _id: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        description: stripHtml(job.description),
        requirements: job.tags?.slice(0, 5) || [],
        role: projectRole,
        remotiveCategory: remotiveCategory,
        url: job.url,
        postedAt: job.publication_date,
        source: 'Remotive'
      };
    }) || [];
  } catch (error) {
    console.error('Remotive API error:', error);
    return [];
  }
}

// Map project roles to Remotive categories
const roleToRemotiveCategory: Record<string, string> = {
  'software-development': 'software-dev',
  'ai-ml': 'data-science',
  'devops': 'devops-engineering',
  'data-science': 'data-science',
  'frontend': 'software-dev',
  'backend': 'software-dev',
  'digital-marketing': 'marketing',
  'sales': 'sales',
  'human-resources': 'human-resources',
  'finance-accounting': 'finance',
  'graphic-design': 'design',
  'content-writing': 'writing',
  'customer-support': 'customer-service',
  'project-management': 'product'
};

// Map Remotive categories back to project roles
const remotiveCategoryToRole: Record<string, string> = {
  'software-dev': 'software-development',
  'data-science': 'data-science',
  'devops-engineering': 'devops',
  'marketing': 'digital-marketing',
  'sales': 'sales',
  'human-resources': 'human-resources',
  'finance': 'finance-accounting',
  'design': 'graphic-design',
  'writing': 'content-writing',
  'customer-service': 'customer-support',
  'product': 'project-management'
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch jobs from database (all jobs)
    const dbJobs = await Job.find().sort({ postedAt: -1 }).limit(50);

    // Fetch jobs from external API (all jobs)
    const externalJobs = await fetchRemotiveJobs();

    // Combine jobs, prioritize database jobs
    const allJobs = [...dbJobs, ...externalJobs];

    return NextResponse.json({ jobs: allJobs });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Require authentication for posting jobs
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { title, company, location, description, requirements, role, url } = body;
    
    if (!title || !company || !description) {
      return NextResponse.json({ error: 'Title, company, and description are required.' }, { status: 400 });
    }
    
    const job = await Job.create({
      title, company, location, description,
      requirements: requirements || [],
      role: role || 'general',
      url: url || '',
      postedBy: userId,
    });
    return NextResponse.json({ message: 'Job posted', job });
  } catch (error) {
    console.error('Job create error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
