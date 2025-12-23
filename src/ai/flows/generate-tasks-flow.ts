
'use server';
/**
 * @fileOverview An AI flow to generate tasks for a given goal.
 *
 * - generateTasksForGoal - A function that generates tasks for a goal.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateTasksInputSchema,
  GenerateTasksOutputSchema,
  type GenerateTasksInput,
  type GenerateTasksOutput,
} from '@/ai/schemas/generate-tasks-schema';

export async function generateTasksForGoal(
  input: GenerateTasksInput
): Promise<GenerateTasksOutput> {
  return generateTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTasksPrompt',
  input: { schema: GenerateTasksInputSchema },
  output: { schema: GenerateTasksOutputSchema },
  prompt: `You are an expert project manager. A user has provided a goal. Your job is to create a detailed mind map style breakdown of this goal into actionable tasks and suggest a realistic deadline.

Break the goal down into a deep hierarchy of tasks and sub-tasks to form a comprehensive mind map structure. For each task, provide:
1. A clear title.
2. Detailed, step-by-step instructions on how to complete it.
3. A curated list of 3-5 high-quality sources. **Crucially, include a mix of YouTube video links (tutorials, guides) and authoritative articles.**

The instructions should be comprehensive enough for someone with little context to understand what needs to be done.

Critically, you must estimate a realistic deadline appropriate for a human. Do not assume this is the person's only focus. A person has a life, a job, and other commitments. For a simple goal, a deadline of a week might be appropriate. For a moderately complex goal (like 'Learn a new hobby'), suggest a deadline of 1-3 months. For a very complex goal (like 'Build a web application'), suggest a deadline of 6 months or more. Your suggested deadline should be achievable by a human, not an AI.

Goal Title: {{{title}}}
Goal Description: {{{description}}}

Generate the detailed task hierarchy and a suggested deadline in YYYY-MM-DD format based on this goal.`,
});

// Helper function to check if a URL is valid
async function validateUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(url, { 
      method: 'HEAD', 
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.status !== 404;
  } catch (error) {
    // Network errors, timeouts, etc. - consider these invalid
    return false;
  }
}

// Recursively filter sources in tasks and subtasks
async function filterTaskSources(tasks: any[]): Promise<any[]> {
  for (const task of tasks) {
    if (task.sources && task.sources.length > 0) {
      const validatedSources = [];
      const validationPromises = task.sources.map(validateUrl);
      const results = await Promise.all(validationPromises);
      for (let i = 0; i < task.sources.length; i++) {
        if (results[i]) {
          validatedSources.push(task.sources[i]);
        }
      }
      task.sources = validatedSources;
    }
    if (task.subTasks && task.subTasks.length > 0) {
      task.subTasks = await filterTaskSources(task.subTasks);
    }
  }
  return tasks;
}


const generateTasksFlow = ai.defineFlow(
  {
    name: 'generateTasksFlow',
    inputSchema: GenerateTasksInputSchema,
    outputSchema: GenerateTasksOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (output && output.tasks) {
      output.tasks = await filterTaskSources(output.tasks);
    }
    
    return output!;
  }
);
