'use server';

/**
 * @fileOverview Generates daily interview questions for data analysts.
 *
 * - generateInterviewQuestions - A function that returns 5 interview questions.
 * - GenerateInterviewQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionAnswerSchema = z.object({
  question: z.string().describe('A potential data analyst interview question.'),
  answer: z.string().describe('A detailed, correct answer to the question.'),
});

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(QuestionAnswerSchema)
    .min(5)
    .max(5)
    .describe('An array of exactly 5 interview questions and their answers.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<
  typeof GenerateInterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow();
}

const prompt = ai.definePrompt({
  name: 'interviewQuestionPrompt',
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert career coach for data analysts.

  Generate exactly five (5) common interview questions for a data analyst position. The questions should cover a range of topics, including SQL, Python, statistics, business case studies, and behavioral questions.

  For each question, provide a detailed, well-explained answer that a candidate could use as a guide for their own preparation. The answer should be formatted in Markdown for readability.
  `,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
