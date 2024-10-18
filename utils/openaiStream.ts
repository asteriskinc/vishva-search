// openaiStream.ts
'use server';

import { streamText, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { fetchWebpageContent } from '@/utils/extractor';

export async function generate(query: string, url: string) {
  const webpageContent = await fetchWebpageContent(url);

  const systemPrompt = `
You are an AI assistant designed to analyze web content from webpages and respond to user queries. When given a user query and webpage content, follow these rules:
1. Generate a concise response (limited to 100 words) that directly answers the query, using any relevant code blocks from the webpage if appropriate.
2. The summary should be presented as short bullet points. 
3. Only use code blocks that are already present in the webpage and only for code snippets.
4. If no specific intent is recognized, provide a brief summary of the webpage content.
Keep your responses precise and within the 200-word limit.
  `;

  const userPrompt = `
Webpage Content: ${webpageContent}
User Query: ${query}

Generate a concise snippet (within 100 words) that best answers the user's query. 
The snippet MUST be in short bullet points
If the webpage contains relevant code blocks, include them in your response. 
Only use code blocks that are present in the webpage content. 
If no specific intent is recognized from the query, provide a brief summary of the page.
  `;

  const stream = createStreamableValue('');

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4o-mini'), // or 'gpt-3.5-turbo' depending on your preference
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  })();

  return { output: stream.value };
}

export async function generateChatWindow(messages: CoreMessage[],  url: string) {
  const webpageContent = await fetchWebpageContent(url);

  const systemPrompt = `
You are an AI assistant designed to engage in a conversation about web content from a specific webpage. 
Use the following webpage content as context for the conversation:

${webpageContent}

When responding to user messages:
1. Provide informative and relevant answers based on the webpage content and the conversation history.
2. If appropriate, include code snippets from the webpage, but only if they are present in the original content.
3. Keep your responses concise and to the point, ideally within 150 words unless a longer response is necessary.
4. If asked about something not related to the webpage content, politely redirect the conversation back to the topic at hand.
`;

  const stream = createStreamableValue('');

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4o'), // Using the latest model for best performance
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages // Include the entire conversation history
      ],
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  })();

  return { output: stream.value };
}