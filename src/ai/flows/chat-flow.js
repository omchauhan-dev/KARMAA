"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithGoal = chatWithGoal;
const genkit_1 = require("@/ai/genkit");
const genkit_2 = require("genkit");
const ChatInputSchema = genkit_2.z.object({
    message: genkit_2.z.string(),
    goalContext: genkit_2.z.object({
        title: genkit_2.z.string(),
        description: genkit_2.z.string(),
        tasks: genkit_2.z.array(genkit_2.z.any()), // Simplified for context
    }),
});
const ChatOutputSchema = genkit_2.z.object({
    reply: genkit_2.z.string(),
});
const chatPrompt = genkit_1.ai.definePrompt({
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
async function chatWithGoal(input) {
    const { output } = await chatPrompt(input);
    return output;
}
