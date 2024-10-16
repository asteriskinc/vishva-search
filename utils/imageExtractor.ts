import axios from 'axios';
import { load } from 'cheerio';

export async function fetchWebpageImages(url: string) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = load(html);

    // Extract the src attributes of all <img> elements
    const images = $('img')
      .map((_, el) => $(el).attr('src'))
      .get();

    // Return the first 3 images (or as many as available) for the card
    return images.slice(0, 3);
  } catch (error) {
    console.error('Error fetching webpage images:', error);
    throw new Error('Failed to fetch images.');
  }
}
