import axios from 'axios';
import { load } from 'cheerio';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Agent } from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agent = new Agent({ family: 4 });

const BASE_ANIME_PATH = path.resolve(__dirname, '../../../public/animes');

async function getEpisodeLinks(animeUrl) {
  const res = await axios.get(animeUrl, { httpsAgent: agent, timeout: 15000 });
  const html = res.data;
  const $ = load(html);
  const episodes = [];
  $('ul.episodios a').each((i, el) => {
    episodes.push($(el).attr('href'));
  });
  return episodes;
}

function sanitize(text) {
  return text.replace(/ /g, '_').replace(/:/g, '').replace(/\//g, '_');
}

function downloadEpisode(url, folder, filename) {
  fs.mkdirSync(folder, { recursive: true });
  const output = path.join(folder, filename + '.%(ext)s');
  const ytdlpPath = path.resolve(__dirname, 'yt-dlp'); // usa o yt-dlp local
  const args = [
    '-f', 'best[ext=mp4]',
    '-o', output,
    '--external-downloader', 'aria2c',
    '--external-downloader-args', '-x 16 -s 16 -k 1M',
    url
  ];
  const ytdlp = spawn(ytdlpPath, args, { stdio: 'inherit' });
  return new Promise((resolve, reject) => {
    ytdlp.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp exited with code ${code}`));
    });
  });
}

// Baixa episódios em sequência
(async () => {
  const animeUrl = process.argv[2] || 'https://animesonlinecc.to/anime/solo-leveling/';
  const animeName = sanitize(process.argv[3] || 'Solo_Leveling');
  const season = process.argv[4] || '01';
  const links = await getEpisodeLinks(animeUrl);
  for (let index = 0; index < links.length; index++) {
    const link = links[index];
    const folder = path.join(BASE_ANIME_PATH, animeName);
    const filename = `${animeName}_S${season}_EP${String(index + 1).padStart(2, '0')}`;
    console.log(`Baixando episódio ${index + 1}: ${link}`);
    try {
      await downloadEpisode(link, folder, filename);
      console.log(`Episódio ${index + 1} baixado com sucesso!`);
    } catch (err) {
      console.error(`Erro ao baixar episódio ${index + 1}:`, err);
    }
  }
})();