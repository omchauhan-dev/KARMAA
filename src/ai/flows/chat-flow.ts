
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatInputSchema = z.object({
  message: z.string(),
  goalContext: z.object({
    title: z.string(),
    description: z.string(),
    tasks: z.array(z.any()), // Simplified for context
  }),
});

const ChatOutputSchema = z.object({
  reply: z.string(),
});

const chatPrompt = ai.definePrompt({
  name: 'goalChatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are a helpful AI assistant for a project management tool. The user is asking a question about their goal.
  
  Goal Title: {{goalContext.title}}
  Goal Description: {{goalContext.description}}
  Current Tasks: {{goalContext.tasks}}
  
  User Question: {{message}}
  
  Provide a helpful, concise, and encouraging answer based on the goal context.`,
});

export async function chatWithGoal(input: z.infer<typeof ChatInputSchema>) {
  const { output } = await chatPrompt(input);
  return output;
}
