import { config } from 'dotenv';
config();

import '@/ai/flows/ai-code-assistant.ts';
import '@/ai/flows/practice-question-generator.ts';
import '@/ai/flows/evaluate-solution.ts';
import '@/ai/flows/generate-tutorial.ts';
import '@/ai/flows/generate-interview-questions.ts';
