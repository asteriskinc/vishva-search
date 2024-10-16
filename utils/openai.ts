import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Store your API Key in a .env file
});

export async function generateSummary(prompt: string, webpageContent: string) {
  try {

    // System Prompt to direct what we want to be returned in our summary
    const systemPrompt = `
**System Prompt:**

You are an AI assistant designed to analyze web content from webpages and respond to user queries. When given a user query and webpage content, follow these rules:

1. Generate a concise response (limited to 100 words) that directly answers the query, using any relevant code blocks from the webpage if appropriate.
2. Only use code blocks that are already present in the webpage and only for code snippets.
3. If no specific intent is recognized, provide a brief summary of the webpage content.

Keep your responses precise and within the 100-word limit.
    `;

    const userPrompt = `
**Prompt:**

You are provided with the content of a webpage and a user query. Your task is to process the webpage content and:

1. Generate a concise snippet (within 100 words) that best answers the user's query.
   - If the webpage contains relevant code blocks, include them in your response.
   - Only use code blocks that are present in the webpage content.
3. If no specific intent is recognized from the query, provide a brief summary of the page.

**Inputs:**
- **Webpage Content**: ${webpageContent}
- **User Query**: ${prompt}

**Output**: 
- A relevant snippet answering the query (with code blocks if applicable), or a summary if no intent is detected."
    `;


    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0].message?.content;
  } catch (error) {
    console.error('Error in OpenAI API:', error);
    throw new Error("Failed to generate summary.");
  }
}

export async function generateSmartFilters(searchQuery: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              "type": "text",
              "text": `Here's a search query: ${searchQuery}. Can you come up with 3-4 search filters based on this search query so the search can be better refined? But instead of coming up with generic filters like Time, Genre, Release Date, etc., come up with ones that are specific to the search query itself. Make sure to ONLY return the filter names in JSON format please.`
            }
          ]
        }
      ],
      temperature: 0.52,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        "type": "json_object"
      },
    });
    // Ensure `content` is defined and a string before parsing it.
    let content = response.choices[0]?.message?.content;

    if (!content) {
      console.error('No content in response.');
      throw new Error("No content received from OpenAI.");
    }

    // Parse the JSON content only after ensuring it's a valid string.
    const filters = JSON.parse(content).filters;
    return filters;
  } catch (error) {
    console.error('Error in OpenAI API:', error);
    throw new Error("Failed to generate smart filters.");
  }
}