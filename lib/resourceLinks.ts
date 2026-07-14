// Curated, verified resource links — sirf stable homepage/docs-root URLs use kiye hain taake kabhi broken na hon
export const CURATED_RESOURCES: Record<string, { title: string; url: string }> = {
  'javascript': { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  'typescript': { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/' },
  'react': { title: 'React Official Docs', url: 'https://react.dev/' },
  'next.js': { title: 'Next.js Documentation', url: 'https://nextjs.org/docs' },
  'node.js': { title: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs' },
  'express.js': { title: 'Express.js Guide', url: 'https://expressjs.com/' },
  'mongodb': { title: 'MongoDB Official Manual', url: 'https://www.mongodb.com/docs/' },
  'sql': { title: 'W3Schools SQL Tutorial', url: 'https://www.w3schools.com/sql/' },
  'docker': { title: 'Docker Get Started Guide', url: 'https://docs.docker.com/get-started/' },
  'kubernetes': { title: 'Kubernetes Official Docs', url: 'https://kubernetes.io/docs/home/' },
  'aws': { title: 'AWS Getting Started', url: 'https://aws.amazon.com/getting-started/' },
  'system design': { title: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' },
  'python': { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' },
  'pandas': { title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/' },
  'tensorflow': { title: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials' },
  'pytorch': { title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/' },
  'git': { title: 'Git Official Documentation', url: 'https://git-scm.com/doc' },
  'ci/cd': { title: 'GitLab CI/CD Docs', url: 'https://docs.gitlab.com/ee/ci/' },
  'seo': { title: 'Google Search Central', url: 'https://developers.google.com/search' },
  'google ads': { title: 'Google Ads Help Center', url: 'https://support.google.com/google-ads' },
  'google analytics': { title: 'Google Analytics Help Center', url: 'https://support.google.com/analytics' },
  'content marketing': { title: 'HubSpot Marketing Blog', url: 'https://blog.hubspot.com/marketing' },
  'social media marketing': { title: 'Meta for Business', url: 'https://www.facebook.com/business' },
  'email marketing': { title: 'Mailchimp Resources', url: 'https://mailchimp.com/resources/' },
  'hubspot': { title: 'HubSpot Academy', url: 'https://academy.hubspot.com/' },
  'salesforce': { title: 'Salesforce Trailhead', url: 'https://trailhead.salesforce.com/' },
  'lead generation': { title: 'HubSpot Marketing Blog', url: 'https://blog.hubspot.com/marketing' },
  'recruitment': { title: 'SHRM Resources', url: 'https://www.shrm.org/' },
  'hris': { title: 'AIHR Resources', url: 'https://www.aihr.com/' },
  'excel': { title: 'Microsoft Excel Support', url: 'https://support.microsoft.com/en-us/excel' },
  'quickbooks': { title: 'QuickBooks Support', url: 'https://quickbooks.intuit.com/learn-support/' },
  'financial analysis': { title: 'Corporate Finance Institute', url: 'https://corporatefinanceinstitute.com/' },
  'figma': { title: 'Figma Learn', url: 'https://help.figma.com/hc/en-us' },
  'adobe photoshop': { title: 'Adobe Photoshop Support', url: 'https://helpx.adobe.com/photoshop/' },
  'adobe illustrator': { title: 'Adobe Illustrator Support', url: 'https://helpx.adobe.com/illustrator/' },
  'content writing': { title: 'Copyblogger', url: 'https://copyblogger.com/' },
  'wordpress': { title: 'WordPress.org Documentation', url: 'https://wordpress.org/documentation/' },
  'zendesk': { title: 'Zendesk Help Center', url: 'https://support.zendesk.com/hc/en-us' },
  'agile': { title: 'Atlassian Agile Coach', url: 'https://www.atlassian.com/agile' },
  'scrum': { title: 'Scrum.org', url: 'https://www.scrum.org/' },
  'jira': { title: 'Atlassian Jira Support', url: 'https://support.atlassian.com/jira-software-cloud/' },
  'curriculum development': { title: 'ASCD', url: 'https://www.ascd.org/' },
  'e-learning': { title: 'edX Free Courses', url: 'https://www.edx.org/' },
};

export function findCuratedResource(topic: string): { title: string; url: string } | null {
  const key = topic.toLowerCase().trim();

  if (CURATED_RESOURCES[key]) return CURATED_RESOURCES[key];

  for (const [k, v] of Object.entries(CURATED_RESOURCES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }

  return null;
}

// Fallback: Google search — ye link kabhi dead/broken nahi hoti
export function getFallbackResource(topic: string): { title: string; url: string } {
  return {
    title: `Search: ${topic}`,
    url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' tutorial')}`,
  };
}