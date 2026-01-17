'use server';

/**
 * @fileOverview An AI agent for suggesting targeted messages to users based on their type or requested service.
 *
 * - suggestTargetedMessage - A function that suggests a targeted message.
 * - SuggestTargetedMessageInput - The input type for the suggestTargetedMessage function.
 * - SuggestTargetedMessageOutput - The return type for the suggestTargetedMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTargetedMessageInputSchema = z.object({
  userType: z
    .string()
    .describe("The type of user (e.g., 'new customer', 'returning customer')."),
  serviceRequested: z
    .string()
    .describe('The service the user has requested (e.g., photographer, caterer).'),
  pastMessages: z.array(z.string()).optional().describe('A list of messages that have already been shown to the user')
});
export type SuggestTargetedMessageInput = z.infer<
  typeof SuggestTargetedMessageInputSchema
>;

const SuggestTargetedMessageOutputSchema = z.object({
  message: z.string().describe('The suggested targeted message.'),
  reason: z.string().describe('The reason why this message is suggested.'),
  isAppropriate: z
    .boolean()
    .describe(
      'Whether the message is appropriate for the user based on their type and service requested.'
    ),
});
export type SuggestTargetedMessageOutput = z.infer<
  typeof SuggestTargetedMessageOutputSchema
>;

export async function suggestTargetedMessage(
  input: SuggestTargetedMessageInput
): Promise<SuggestTargetedMessageOutput> {
  return suggestTargetedMessageFlow(input);
}

const suggestTargetedMessagePrompt = ai.definePrompt({
  name: 'suggestTargetedMessagePrompt',
  input: {schema: SuggestTargetedMessageInputSchema},
  output: {schema: SuggestTargetedMessageOutputSchema},
  prompt: `You are an expert marketing assistant that suggests personalized messages to users of an event planning application based on their user type and requested service.

  Given the user's type and requested service, suggest a targeted message that is relevant and helpful.
  Also explain why the message is appropriate for the user.

  User Type: {{{userType}}}
  Service Requested: {{{serviceRequested}}}
  Past Messages: {{#if pastMessages}}{{#each pastMessages}}- {{{this}}}{{/each}}{{else}}None{{/if}}

  Consider the past messages to avoid repetition. Don't show the same message twice.
  Make sure that the message is concise, helpful, and relevant to the user's needs and booking process.
  The message should be encouraging, welcoming, and inviting.
  The response should be in the following JSON format:
  {
    "message": "The suggested targeted message.",
    "reason": "The reason why this message is suggested.",
    "isAppropriate": true or false,
  }`,
});

const suggestTargetedMessageFlow = ai.defineFlow(
  {
    name: 'suggestTargetedMessageFlow',
    inputSchema: SuggestTargetedMessageInputSchema,
    outputSchema: SuggestTargetedMessageOutputSchema,
  },
  async input => {
    const {output} = await suggestTargetedMessagePrompt(input);
    return output!;
  }
);
