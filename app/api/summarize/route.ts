// src/app/api/summarize/route.ts
import { NextResponse } from 'next/server';
import { generateSummary } from '@/utils/openai';
import { fetchWebpageContent } from '@/utils/extractor';

export async function POST(request: Request) {
  try {
    const { url, query } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch webpage content (without fetching images)
    const content = await fetchWebpageContent(url);

    // Generate summary using OpenAI API
    const summary = await generateSummary(query, content);

    // Return the summary (images are fetched separately now)
    return NextResponse.json({ summary }, { status: 200 });
  } catch (error: any) {
    console.error('Error in API route api/summarize:', error);  // Log the full error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}