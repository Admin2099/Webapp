'use server';

/**
 * @fileOverview An AI agent that generates interactive, chapter-based tutorials on data analysis topics.
 *
 * - generateTutorial - A function that creates a tutorial with chapters and assessments.
 * - GenerateTutorialInput - The input type for the generateTutorial function.
 * - GenerateTutorialOutput - The return type for the generateTutorial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTutorialInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic for the tutorial (e.g., SQL, Python, Tableau).'),
  skillLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The target skill level for the tutorial.'),
});
export type GenerateTutorialInput = z.infer<typeof GenerateTutorialInputSchema>;

const MCQSchema = z.object({
  question: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).describe('An array of possible answers.'),
  answer: z
    .string()
    .describe(
      'The correct answer from the options array. Must be an exact match to one of the options.'
    ),
});

const OpenEndedQuestionSchema = z.object({
  question: z
    .string()
    .describe('The theoretical or coding-based question.'),
  solution: z
    .string()
    .describe('The correct solution or answer to the question.'),
});

const AssessmentSchema = z.object({
  mcqs: z
    .array(MCQSchema)
    .min(2)
    .max(2)
    .describe('An array of exactly two multiple-choice questions.'),
  openEndedQuestions: z
    .array(OpenEndedQuestionSchema)
    .min(3)
    .max(3)
    .describe(
      'An array of exactly three theoretical or coding-based questions.'
    ),
});

const ChapterSchema = z.object({
  title: z.string().describe('The title for this chapter.'),
  content: z
    .string()
    .describe(
      'The full content of this chapter, formatted in Markdown. It can include paragraphs, lists, and code blocks.'
    ),
  assessment: AssessmentSchema.describe(
    'The assessment quiz for this chapter.'
  ),
});

const GenerateTutorialOutputSchema = z.object({
  title: z.string().describe('The main title of the generated tutorial.'),
  introduction: z
    .string()
    .describe('A brief introduction to the tutorial topic.'),
  chapters: z
    .array(ChapterSchema)
    .min(5)
    .describe(
      'An array of at least 5 tutorial chapters, each with a title, content, and an assessment.'
    ),
  conclusion: z.string().describe('A concluding summary of the tutorial.'),
});
export type GenerateTutorialOutput = z.infer<
  typeof GenerateTutorialOutputSchema
>;

export async function generateTutorial(
  input: GenerateTutorialInput
): Promise<GenerateTutorialOutput> {
  return generateTutorialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInteractiveTutorialPrompt',
  input: {schema: GenerateTutorialInputSchema},
  output: {schema: GenerateTutorialOutputSchema},
  prompt: `You are an expert data science tutor. Your task is to generate a high-quality, comprehensive, interactive tutorial.

  Topic: {{{topic}}}
  Skill Level: {{{skillLevel}}}

  Please create a tutorial on the specified topic for a user with the given skill level.
  The tutorial must be well-structured and broken down into clear chapters. For a beginner-level topic, you MUST generate at least five (5) and up to nine (9) chapters to cover the fundamental concepts thoroughly.
  
  For EACH chapter, you must also create an assessment to test the user's knowledge of that chapter's content.
  Each assessment MUST contain:
  1. Exactly two (2) multiple-choice questions (MCQs). Each MCQ should have a question, a few options, and the correct answer. The correct answer must be one of the provided options.
  2. Exactly three (3) open-ended questions. These can be theoretical (e.g., "Explain X") or practical (e.g., "Write a SQL query to do Y"). Each must have a correct solution.

  Formatting Instructions:
  - For the chapter 'content', you MUST use Markdown to structure the text for readability.
  - Use Markdown headings (e.g., '### What is SQL?') for all section titles.
  - Use bolding for key terms, especially when defining them (e.g., '**A database** is an organized...').
  - Use bulleted or numbered lists for steps or itemizations.
  - Include code blocks for any code examples.
  - Crucially, ensure there are empty newlines between paragraphs, headings, and lists to create clear visual separation and spacing, making the content easy to scan.
  - For the assessment questions, ensure each question is a clear and concise string.

  Structure the entire output as a single JSON object with the following format:
  - 'title': The main title of the tutorial.
  - 'introduction': A brief introduction to the topic.
  - 'chapters': An array of chapter objects. Each chapter object must have:
    - 'title': The title of the chapter.
    - 'content': The educational content for the chapter in Markdown format.
    - 'assessment': An object containing the quiz for the chapter, with two keys:
      - 'mcqs': An array of 2 MCQ objects.
      - 'openEndedQuestions': An array of 3 open-ended question objects.
  - 'conclusion': A concluding summary for the entire tutorial.

  The content should be clear, concise, and highly educational. Start from the basics if it's a beginner tutorial, and cover more advanced concepts for intermediate/advanced levels. Ensure the assessments directly relate to the content of their respective chapters.
  `,
});

const generateTutorialFlow = ai.defineFlow(
  {
    name: 'generateTutorialFlow',
    inputSchema: GenerateTutorialInputSchema,
    outputSchema: GenerateTutorialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
