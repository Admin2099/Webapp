'use server';

/**
 * @fileOverview An AI-powered code assistant for data analyst students.
 *
 * - getCodeHint - A function that provides hints and solutions for coding exercises.
 * - GetCodeHintInput - The input type for the getCodeHint function.
 * - GetCodeHintOutput - The return type for the getCodeHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCodeHintInputSchema = z.object({
  exerciseDescription: z
    .string()
    .describe('The description of the coding exercise.'),
  userCode: z.string().describe('The user-provided code for the exercise.'),
  programmingLanguage: z
    .string()
    .describe('The programming language of the exercise.'),
});
export type GetCodeHintInput = z.infer<typeof GetCodeHintInputSchema>;

const GetCodeHintOutputSchema = z.object({
  hint: z.string().describe('A hint to help the user solve the exercise.'),
  solution: z
    .string()
    .describe('A complete solution to the exercise, if needed.'),
  explanation: z
    .string()
    .describe('An explanation of the solution and common mistakes.'),
});
export type GetCodeHintOutput = z.infer<typeof GetCodeHintOutputSchema>;

export async function getCodeHint(input: GetCodeHintInput): Promise<GetCodeHintOutput> {
  return getCodeHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCodeHintPrompt',
  input: {schema: GetCodeHintInputSchema},
  output: {schema: GetCodeHintOutputSchema},
  prompt: `You are an AI-powered code assistant for data analyst students. Your task is to provide helpful hints, solutions, and explanations for coding exercises.

  Exercise Description: {{{exerciseDescription}}}
  Programming Language: {{{programmingLanguage}}}
  User Code: {{{userCode}}}

  Provide a hint to guide the user towards the correct solution. If the user's code is incorrect or incomplete, provide a complete solution and explain the common mistakes that users make with these types of problems.

  Format your response as a JSON object with the following keys:
  - hint: A string containing a hint for the user.
  - solution: A string containing a complete solution to the exercise, if needed. Otherwise, leave blank.
  - explanation: A string containing an explanation of the solution and common mistakes.
  `,
});

const getCodeHintFlow = ai.defineFlow(
  {
    name: 'getCodeHintFlow',
    inputSchema: GetCodeHintInputSchema,
    outputSchema: GetCodeHintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
