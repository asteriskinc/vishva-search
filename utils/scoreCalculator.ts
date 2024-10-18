import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Score {
  score: number;
  explanation: string;
}

export async function calculateRelevance(query: string, title: string, snippet: string): Promise<Score> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI designed to assess the relevance of search results. Given a search query and a search result (title and snippet), you will provide a relevance score from 0 to 100 and a brief explanation for the score.`
        },
        {
          role: "user",
          content: `Search Query: "${query}"
Search Result Title: "${title}"
Search Result Snippet: "${snippet}"

Please provide a relevance score from 0 to 100 and a brief explanation for the score. Return the result as a JSON object with 'score' and 'explanation' fields.`
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI.");
    }

    return JSON.parse(content) as Score;
  } catch (error) {
    console.error('Error in OpenAI API:', error);
    throw new Error("Failed to calculate relevance score.");
  }
}

export async function calculateTrustworthiness(url: string, websiteName: string): Promise<Score> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI designed to assess the trustworthiness of websites. Given a URL and website name, you will provide a trustworthiness score from 0 to 100 and a brief explanation for the score.`
        },
        {
          role: "user",
          content: `URL: "${url}"
Website Name: "${websiteName}"

Please provide a trustworthiness score from 0 to 100 and a brief explanation for the score. Consider factors such as domain authority, known reputation, and any red flags in the URL structure. Return the result as a JSON object with 'score' and 'explanation' fields.`
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI.");
    }

    return JSON.parse(content) as Score;
  } catch (error) {
    console.error('Error in OpenAI API:', error);
    throw new Error("Failed to calculate trustworthiness score.");
  }
}