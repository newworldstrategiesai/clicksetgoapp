import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;

    // Use cheerio to load the HTML and scrape the data
    const $ = cheerio.load(html);

    // Explicitly type the data array as string[]
    const data: string[] = [];

    $('h1').each((index, element) => {
      data.push($(element).text());
    });

    res.status(200).json({ message: 'Scraping successful', data });
  } catch (error) {
    res.status(500).json({ message: 'Error during scraping', error: (error as Error).message });
  }
}
