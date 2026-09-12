import OpenAI from 'openai';

const apiKey = process.env.GROK_API_KEY;
const grok = apiKey ? new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' }) : null;

export default grok;
