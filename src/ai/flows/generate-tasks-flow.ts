
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
  prompt: `You are an expert project manager. A user has provided a goal and an intent (Learn or Build). Your job is to create a detailed, structured breakdown of this goal into actionable tasks and suggest a realistic deadline.

Goal Type: {{{type}}}
Goal Title: {{{title}}}
Goal Description: {{{description}}}

If the Goal Type is 'learn':
Structure the tasks into a curriculum: "Beginner", "Intermediate", and "Pro" milestones.
- Beginner: Foundation concepts.
- Intermediate: Advanced topics and integration.
- Pro: Mastery and complex usage.

If the Goal Type is 'build':
Structure the tasks into a development lifecycle: "Setup", "Core Implementation", "Refinement", "Deployment".
- Setup: Environment configuration.
- Core Implementation: Building main features.
- Refinement: Polish, UI/UX, Testing.
- Deployment: Launching.

For EACH task and sub-task:
1. A clear title.
2. Detailed, step-by-step instructions.
3. A curated list of 3-5 high-quality sources (YouTube videos, articles).
4. **Crucially**, estimate a granular deadline (e.g., "Day 1-2", "Week 1") relative to the start date in the instructions.

Critically, you must estimate a realistic *overall* deadline appropriate for a human in YYYY-MM-DD format.

Generate the detailed task hierarchy.`,
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
