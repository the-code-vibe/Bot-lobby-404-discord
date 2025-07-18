import { load } from 'cheerio';

export async function searchAnimesOnlineCC(query) {
  try {
    const url = `https://animesonlinecc.to/search/${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = load(html);
    const results = [];
    $('.item').each((i, el) => {
      const title = $(el).find('.data h3 a').text().trim();
      const link = $(el).find('.data h3 a').attr('href');
      if (title && link) results.push({ name: title, value: title, link });
    });
    return results.slice(0, 10);
  } catch {
    return [];
  }
} 