'use server';
/**
 * @fileOverview An AI agent that evaluates a user's solution to a practice problem.
 *
 * - evaluateSolution - A function that evaluates the user's submission.
 * - EvaluateSolutionInput - The input type for the evaluateSolution function.
 * - EvaluateSolutionOutput - The return type for the evaluateSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateSolutionInputSchema = z.object({
  exerciseDescription: z.string().describe('The description of the coding exercise.'),
  solution: z.string().describe('The correct solution to the exercise.'),
  userAnswer: z.string().describe("The user's submitted answer or code."),
  technology: z.string().describe('The technology used in the exercise.'),
});
export type EvaluateSolutionInput = z.infer<typeof EvaluateSolutionInputSchema>;

const EvaluateSolutionOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the user answer is correct.'),
  feedback: z
    .string()
    .describe('Constructive feedback on the user\'s answer.'),
  score: z.number().min(0).max(100).describe('A score from 0 to 100 on the user\'s answer.'),
});
export type EvaluateSolutionOutput = z.infer<
  typeof EvaluateSolutionOutputSchema
>;

export async function evaluateSolution(
  input: EvaluateSolutionInput
): Promise<EvaluateSolutionOutput> {
  return evaluateSolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateSolutionPrompt',
  input: {schema: EvaluateSolutionInputSchema},
  output: {schema: EvaluateSolutionOutputSchema},
  prompt: `You are an AI Teaching Assistant for a data analysis learning platform. Your task is to evaluate a user's submitted answer for a practice problem.

  Problem Description:
  {{{exerciseDescription}}}

  Technology:
  {{{technology}}}

  Correct Solution:
  {{{solution}}}

  User's Submitted Answer:
  {{{userAnswer}}}

  ---

  Your task is to:
  1.  Compare the user's answer to the correct solution.
  2.  Determine if the user's answer is correct. For coding questions, correctness means it achieves the same result, even if the syntax is slightly different. For theoretical or numerical questions, it must be accurate.
  3.  Provide a score from 0 to 100. Give 100 for a correct answer. For incorrect answers, award partial credit based on how close they were.
  4.  Write brief, constructive feedback explaining why the answer is correct or incorrect. If incorrect, guide them toward the right answer without just giving it away.
  `,
});

const evaluateSolutionFlow = ai.defineFlow(
  {
    name: 'evaluateSolutionFlow',
    inputSchema: EvaluateSolutionInputSchema,
    outputSchema: EvaluateSolutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
