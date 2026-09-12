import OpenAI from 'openai';

const apiKey = process.env.OPENROUTER_API_KEY;
const openrouter = apiKey ? new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' }) : null;

export default openrouter;
