/**
 * @fileOverview Zod schemas and types for the task generation AI flow.
 */

import { z } from 'genkit';

// Recursive schema for tasks with sub-tasks
const TaskSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    title: z.string().describe('The title of the task.'),
    instructions: z
      .string()
      .describe('Detailed, step-by-step instructions for the task.'),
    subTasks: z.array(TaskSchema).describe('A list of sub-tasks, if any.'),
    sources: z
      .array(z.string().url())
      .describe('A list of relevant internet URLs as sources for this task.')
      .optional(),
  })
);

export const GenerateTasksInputSchema = z.object({
  title: z.string().describe('The title of the goal.'),
  description: z.string().describe('The description of the goal.'),
  type: z.enum(['learn', 'build']).describe('The type of goal: learn or build.'),
});
export type GenerateTasksInput = z.infer<typeof GenerateTasksInputSchema>;

export const GenerateTasksOutputSchema = z.object({
  tasks: z.array(TaskSchema).describe('The list of generated tasks.'),
  suggestedDeadline: z
    .string()
    .date()
    .describe(
      'A suggested deadline for the goal in YYYY-MM-DD format based on the goal complexity.'
    ),
});
export type GenerateTasksOutput = z.infer<typeof GenerateTasksOutputSchema>;
