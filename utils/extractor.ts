import axios from 'axios';
import { load } from 'cheerio'; // Use named import for 'load' from 'cheerio'

export async function fetchWebpageContent(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',  // Simulate browser language preference
        'Accept-Encoding': 'gzip, deflate, br',  // Accept compressed responses
        'Connection': 'keep-alive',  // Keep connection alive like a browser
        'Referer': 'https://www.google.com/',  // Set a referer to appear like traffic coming from Google
        'DNT': '1',  // Do Not Track header
      },
    });
    const html = response.data;
    const $ = load(html); // Use the 'load' method correctly here

    // Extract meaningful content from the webpage, e.g., paragraphs or main sections
    const content = $('p').map((_, el) => $(el).text()).get().join('\n');
    
    // Limit content length to avoid passing large inputs to the API
    return content.length > 2000 ? content.slice(0, 2000) : content;
  } catch (error) {
    console.error('Error fetching webpage content:', error);
    throw new Error('Failed to fetch content.');
  }
}