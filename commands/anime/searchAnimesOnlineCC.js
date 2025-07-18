import fetch from 'node-fetch';
import { load } from 'cheerio';

export async function searchAnimesOnlineCC(query) {
  console.log('[autocomplete] Buscando:', query);
  try {
    const url = `https://animesonlinecc.to/search/${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = load(html);
    const results = [];
    $('.item').each((i, el) => {
      const title = $(el).find('.data h3 a').text().trim();
      if (title) results.push({ name: title, value: title });
    });
    console.log('[autocomplete] Resultados:', results.map(r => r.name));
    return results.slice(0, 10);
  } catch {
    return [];
  }
} 