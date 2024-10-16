// src/app/api/fetch-images/route.ts
import { NextResponse } from 'next/server';
import { load } from 'cheerio';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch the webpage HTML content
    const response = await axios.get(url);
    const html = response.data;

    // Use Cheerio to parse the HTML and extract image URLs
    const $ = load(html);

    // Extract image sources from <img> elements
    const images = $('img')
      .map((_, el) => $(el).attr('src'))
      .get()
      .filter(src => src && src.startsWith('http')) // Filter out invalid or relative URLs

    // Return the extracted images (limit to first 6 images)
    return NextResponse.json({ images: images.slice(0, 6) }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
