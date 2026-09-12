import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const gemini = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default gemini;
