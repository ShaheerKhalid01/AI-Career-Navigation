export interface ExternalCommunity {
  name: string;
  platform: string;
  url: string;
}

export const EXTERNAL_COMMUNITIES: Record<string, ExternalCommunity[]> = {
  'software-development': [
    { name: 'r/cscareerquestions', platform: 'Reddit', url: 'https://www.reddit.com/r/cscareerquestions/' },
    { name: 'r/learnprogramming', platform: 'Reddit', url: 'https://www.reddit.com/r/learnprogramming/' },
    { name: 'freeCodeCamp Forum', platform: 'Forum', url: 'https://forum.freecodecamp.org/' },
    { name: 'Dev.to Community', platform: 'Community', url: 'https://dev.to/' },
  ],
  'frontend': [
    { name: 'r/Frontend', platform: 'Reddit', url: 'https://www.reddit.com/r/Frontend/' },
    { name: 'r/webdev', platform: 'Reddit', url: 'https://www.reddit.com/r/webdev/' },
    { name: 'Frontend Mentor Community', platform: 'Community', url: 'https://www.frontendmentor.io/community' },
  ],
  'backend': [
    { name: 'r/backend', platform: 'Reddit', url: 'https://www.reddit.com/r/backend/' },
    { name: 'r/node', platform: 'Reddit', url: 'https://www.reddit.com/r/node/' },
    { name: 'DEV Backend Tag', platform: 'Community', url: 'https://dev.to/t/backend' },
  ],
  'ai-ml': [
    { name: 'r/MachineLearning', platform: 'Reddit', url: 'https://www.reddit.com/r/MachineLearning/' },
    { name: 'r/learnmachinelearning', platform: 'Reddit', url: 'https://www.reddit.com/r/learnmachinelearning/' },
    { name: 'Kaggle Community', platform: 'Forum', url: 'https://www.kaggle.com/discussions' },
    { name: 'Hugging Face Forums', platform: 'Forum', url: 'https://discuss.huggingface.co/' },
  ],
  'devops': [
    { name: 'r/devops', platform: 'Reddit', url: 'https://www.reddit.com/r/devops/' },
    { name: 'r/kubernetes', platform: 'Reddit', url: 'https://www.reddit.com/r/kubernetes/' },
    { name: 'DevOps.com Community', platform: 'Community', url: 'https://devops.com/' },
  ],
  'data-science': [
    { name: 'r/datascience', platform: 'Reddit', url: 'https://www.reddit.com/r/datascience/' },
    { name: 'Kaggle Community', platform: 'Forum', url: 'https://www.kaggle.com/discussions' },
    { name: 'DataTalks.Club', platform: 'Community', url: 'https://datatalks.club/' },
  ],
  'digital-marketing': [
    { name: 'r/marketing', platform: 'Reddit', url: 'https://www.reddit.com/r/marketing/' },
    { name: 'r/digital_marketing', platform: 'Reddit', url: 'https://www.reddit.com/r/digital_marketing/' },
    { name: 'GrowthHackers Community', platform: 'Community', url: 'https://growthhackers.com/' },
    { name: 'Moz SEO Community', platform: 'Forum', url: 'https://moz.com/community' },
  ],
  'sales': [
    { name: 'r/sales', platform: 'Reddit', url: 'https://www.reddit.com/r/sales/' },
    { name: 'r/salestechniques', platform: 'Reddit', url: 'https://www.reddit.com/r/salestechniques/' },
    { name: 'RevGenius Community', platform: 'Community', url: 'https://www.revgenius.com/' },
  ],
  'human-resources': [
    { name: 'r/humanresources', platform: 'Reddit', url: 'https://www.reddit.com/r/humanresources/' },
    { name: 'SHRM Community', platform: 'Community', url: 'https://www.shrm.org/community' },
    { name: 'AIHR Community', platform: 'Community', url: 'https://www.aihr.com/' },
  ],
  'finance-accounting': [
    { name: 'r/Accounting', platform: 'Reddit', url: 'https://www.reddit.com/r/Accounting/' },
    { name: 'r/FinancialCareers', platform: 'Reddit', url: 'https://www.reddit.com/r/FinancialCareers/' },
    { name: 'AccountingWEB Community', platform: 'Community', url: 'https://www.accountingweb.com/' },
  ],
  'graphic-design': [
    { name: 'r/graphic_design', platform: 'Reddit', url: 'https://www.reddit.com/r/graphic_design/' },
    { name: 'Dribbble Community', platform: 'Community', url: 'https://dribbble.com/' },
    { name: 'Behance Community', platform: 'Community', url: 'https://www.behance.net/' },
  ],
  'content-writing': [
    { name: 'r/freelanceWriters', platform: 'Reddit', url: 'https://www.reddit.com/r/freelanceWriters/' },
    { name: 'r/copywriting', platform: 'Reddit', url: 'https://www.reddit.com/r/copywriting/' },
    { name: '写ers Community (ProBlogger)', platform: 'Forum', url: 'https://problogger.com/community/' },
  ],
  'customer-support': [
    { name: 'r/CustomerService', platform: 'Reddit', url: 'https://www.reddit.com/r/CustomerService/' },
    { name: 'Support Driven Community', platform: 'Community', url: 'https://supportdriven.com/' },
  ],
  'project-management': [
    { name: 'r/projectmanagement', platform: 'Reddit', url: 'https://www.reddit.com/r/projectmanagement/' },
    { name: 'PMI Community', platform: 'Community', url: 'https://www.pmi.org/connect' },
    { name: 'Scrum.org Community', platform: 'Forum', url: 'https://www.scrum.org/forum' },
  ],
  'teaching-education': [
    { name: 'r/Teachers', platform: 'Reddit', url: 'https://www.reddit.com/r/Teachers/' },
    { name: 'r/education', platform: 'Reddit', url: 'https://www.reddit.com/r/education/' },
    { name: 'ASCD Community', platform: 'Community', url: 'https://www.ascd.org/community' },
  ],

  /* ── Community tab slugs ─────────────────────────────── */
  'resume-review': [
    { name: 'r/resumes', platform: 'Reddit', url: 'https://www.reddit.com/r/resumes/' },
    { name: 'r/EngineeringResumes', platform: 'Reddit', url: 'https://www.reddit.com/r/EngineeringResumes/' },
    { name: 'Resume Worded', platform: 'Tool', url: 'https://resumeworded.com/' },
  ],
  'interview-prep': [
    { name: 'r/interviews', platform: 'Reddit', url: 'https://www.reddit.com/r/interviews/' },
    { name: 'r/cscareerquestions', platform: 'Reddit', url: 'https://www.reddit.com/r/cscareerquestions/' },
    { name: 'Pramp', platform: 'Practice', url: 'https://www.pramp.com/' },
  ],
  'career-switch': [
    { name: 'r/careerchange', platform: 'Reddit', url: 'https://www.reddit.com/r/careerchange/' },
    { name: 'r/careerguidance', platform: 'Reddit', url: 'https://www.reddit.com/r/careerguidance/' },
    { name: 'r/findapath', platform: 'Reddit', url: 'https://www.reddit.com/r/findapath/' },
  ],
  'portfolio-review': [
    { name: 'r/design_critiques', platform: 'Reddit', url: 'https://www.reddit.com/r/design_critiques/' },
    { name: 'r/webdev', platform: 'Reddit', url: 'https://www.reddit.com/r/webdev/' },
    { name: 'Dribbble', platform: 'Portfolio', url: 'https://dribbble.com/' },
  ],
  'networking': [
    { name: 'r/networking', platform: 'Reddit', url: 'https://www.reddit.com/r/networking/' },
    { name: 'LinkedIn Groups', platform: 'LinkedIn', url: 'https://www.linkedin.com/groups/' },
    { name: 'Meetup', platform: 'Events', url: 'https://www.meetup.com/' },
  ],
  'job-search': [
    { name: 'r/jobsearchhacks', platform: 'Reddit', url: 'https://www.reddit.com/r/jobsearchhacks/' },
    { name: 'r/jobs', platform: 'Reddit', url: 'https://www.reddit.com/r/jobs/' },
    { name: 'LinkedIn Jobs', platform: 'Jobs', url: 'https://www.linkedin.com/jobs/' },
  ],
  'skill-development': [
    { name: 'r/learnprogramming', platform: 'Reddit', url: 'https://www.reddit.com/r/learnprogramming/' },
    { name: 'r/Udemy', platform: 'Reddit', url: 'https://www.reddit.com/r/Udemy/' },
    { name: 'freeCodeCamp', platform: 'Learning', url: 'https://www.freecodecamp.org/' },
  ],
  'general-discussion': [
    { name: 'r/careerguidance', platform: 'Reddit', url: 'https://www.reddit.com/r/careerguidance/' },
    { name: 'r/casualconversation', platform: 'Reddit', url: 'https://www.reddit.com/r/casualconversation/' },
  ],
};

export function getExternalCommunities(role: string): ExternalCommunity[] {
  return EXTERNAL_COMMUNITIES[role] || [];
}