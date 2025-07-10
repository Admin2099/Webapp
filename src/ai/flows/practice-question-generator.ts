'use server';

/**
 * @fileOverview Generates practice questions tailored to a user's skill level and preferred technology.
 *
 * - generatePracticeQuestion - A function that generates a practice question.
 * - PracticeQuestionInput - The input type for the generatePracticeQuestion function.
 * - PracticeQuestionOutput - The return type for the generatePracticeQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PracticeQuestionInputSchema = z.object({
  skillLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The skill level of the user.'),
  technology: z
    .enum(['SQL', 'Python', 'Power BI', 'Excel', 'Statistics', 'Tableau'])
    .describe('The preferred technology for the practice question.'),
});
export type PracticeQuestionInput = z.infer<typeof PracticeQuestionInputSchema>;

const PracticeQuestionTableSchema = z.object({
  tableName: z.string().describe('The name of the table.'),
  headers: z.array(z.string()).describe('The column headers of the table.'),
  rows: z.array(z.array(z.string())).describe('The rows of data in the table.'),
});

const PracticeQuestionOutputSchema = z.object({
  questionType: z
    .enum(['coding', 'theoretical', 'numerical'])
    .describe('The type of question generated.'),
  description: z
    .string()
    .describe("The text part of the question, describing the user's task."),
  table: PracticeQuestionTableSchema.optional().describe(
    'An optional table of data relevant to the question.'
  ),
  solution: z
    .string()
    .describe('The solution to the generated practice question.'),
});
export type PracticeQuestionOutput = z.infer<
  typeof PracticeQuestionOutputSchema
>;

export async function generatePracticeQuestion(
  input: PracticeQuestionInput
): Promise<PracticeQuestionOutput> {
  return generatePracticeQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'practiceQuestionPrompt',
  input: {schema: PracticeQuestionInputSchema},
  output: {schema: PracticeQuestionOutputSchema},
  prompt: `You are an expert data science and data analysis tutor who gives daily practice questions.

  Generate a practice question for a user with the skill level: {{{skillLevel}}} in the technology: {{{technology}}}.

  The question should be one of three types: 'coding', 'theoretical', or 'numerical'. Randomly choose one.
  - 'coding' questions require writing code (e.g., SQL, Python).
  - 'theoretical' questions test concepts and knowledge (e.g., "Explain the difference between UNION and UNION ALL in SQL.").
  - 'numerical' questions require a calculation or a single number/text answer (e.g., "What is the p-value for...").

  The question should be broken down into a description and optional sample data.
  If the question requires sample data (like for SQL or some Python questions), provide it in the 'table' object with a table name, headers, and rows.
  The main task for the user should be in the 'description' field.
  Provide a correct 'solution' for the question. The solution should be just the code or answer, without any extra markdown or explanation.
  Set the 'questionType' field appropriately.

  For example, for a SQL question, the 'description' would explain the task (e.g., "Write a SQL query to..."), and the 'table' object would contain the sample 'Employees' data.
  If the technology is 'Excel', 'Power BI', 'Statistics' or 'Tableau', the question might be a scenario, a theoretical question, or a numerical problem.
  `,
});

const generatePracticeQuestionFlow = ai.defineFlow(
  {
    name: 'generatePracticeQuestionFlow',
    inputSchema: PracticeQuestionInputSchema,
    outputSchema: PracticeQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
