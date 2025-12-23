


import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NudgeInputSchema = z.object({
  goalTitle: z.string(),
  incompleteTasksCount: z.number(),
});

const NudgeOutputSchema = z.object({
  message: z.string(),
});

const nudgePrompt = ai.definePrompt({
  name: 'nudgePrompt',
  input: { schema: NudgeInputSchema },
  output: { schema: NudgeOutputSchema },
  prompt: `You are a friendly and encouraging productivity coach. The user has {{incompleteTasksCount}} incomplete tasks for their goal "{{goalTitle}}".
  
  Generate a short, motivating, and slightly varied message to ask them if they are stuck or need help. Do not be annoying. Just a gentle nudge.
  Examples:
  - "Hey, noticed you have a few tasks left for {{goalTitle}}. Need a hand?"
  - "Making progress on {{goalTitle}}? Let me know if you're stuck!"
  - "Don't forget about {{goalTitle}}! You're doing great."
  
  Generate one message.`,
});

export async function generateNudge(input: z.infer<typeof NudgeInputSchema>) {
  const { output } = await nudgePrompt(input);
  return output;
}
