import { NextResponse } from 'next/server';
import { generateSmartFilters } from '@/utils/openai';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Generate smart filters based on the search query
    const filters = await generateSmartFilters(query);
    
    return NextResponse.json({ filters }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}