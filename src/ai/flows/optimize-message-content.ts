'use server';

/**
 * @fileOverview A message content optimization AI agent.
 *
 * - optimizeMessageContent - A function that handles the message content optimization process.
 * - OptimizeMessageContentInput - The input type for the optimizeMessageContent function.
 * - OptimizeMessageContentOutput - The return type for the optimizeMessageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeMessageContentInputSchema = z.object({
  message: z.string().describe('The message content to be optimized.'),
});

export type OptimizeMessageContentInput = z.infer<typeof OptimizeMessageContentInputSchema>;

const OptimizeMessageContentOutputSchema = z.object({
  optimizedMessage: z
    .string()
    .describe('The optimized message content with suggestions incorporated.'),
  suggestions: z
    .array(z.string())
    .describe('A list of specific suggestions for improving the message.'),
  reasoning: z
    .string()
    .describe(
      'The AI’s reasoning for the suggested improvements, focusing on impact and deliverability.'
    ),
});

export type OptimizeMessageContentOutput = z.infer<typeof OptimizeMessageContentOutputSchema>;

export async function optimizeMessageContent(
  input: OptimizeMessageContentInput
): Promise<OptimizeMessageContentOutput> {
  return optimizeMessageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeMessageContentPrompt',
  input: {schema: OptimizeMessageContentInputSchema},
  output: {schema: OptimizeMessageContentOutputSchema},
  prompt: `You are an AI assistant designed to help users optimize their WhatsApp message content for maximum impact and deliverability.

  Analyze the following message and provide specific suggestions for improvement. Explain your reasoning, focusing on how the changes will increase impact and deliverability.

  Message: {{{message}}}

  Your goal is to suggest improvements to the message content to maximize impact and deliverability.
  Consider things such as clarity, conciseness, personalization, call to action, and avoiding spam triggers.
  Return the original message, the optimized message, a list of specific suggestions, and your reasoning.
  The suggestions should be specific and actionable.
  The reasoning should be clear and concise.

  Here's an example of what this could look like, use it as a guideline:
  Original message: "Hey, check out our new product!"
  Optimized message: "Hi [Name], discover the benefits of our new product and how it can solve your problems!"
  Suggestions: Add personalization, highlight benefits, create urgency.
  Reasoning: By adding personalization, highlighting benefits, and creating urgency, we can increase the likelihood that the recipient will take action.
  `,
});

const optimizeMessageContentFlow = ai.defineFlow(
  {
    name: 'optimizeMessageContentFlow',
    inputSchema: OptimizeMessageContentInputSchema,
    outputSchema: OptimizeMessageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
