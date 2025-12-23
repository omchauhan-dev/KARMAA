"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNudge = generateNudge;
const genkit_1 = require("@/ai/genkit");
const genkit_2 = require("genkit");
const NudgeInputSchema = genkit_2.z.object({
    goalTitle: genkit_2.z.string(),
    incompleteTasksCount: genkit_2.z.number(),
});
const NudgeOutputSchema = genkit_2.z.object({
    message: genkit_2.z.string(),
});
const nudgePrompt = genkit_1.ai.definePrompt({
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
async function generateNudge(input) {
    const { output } = await nudgePrompt(input);
    return output;
}
