import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

const ANIMES_BASE = path.join(process.cwd(), 'public', 'animes');

app.get('/anime', (req, res) => {
  if (!fs.existsSync(ANIMES_BASE)) {
    return res.send('<h1>Nenhum anime disponível.</h1>');
  }
  const animes = fs.readdirSync(ANIMES_BASE, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  if (animes.length === 0) {
    return res.send('<h1>Nenhum anime disponível.</h1>');
  }
  const links = animes.map(slug => `<li><a href="/anime/watch/${slug}">${slug}</a></li>`).join('');
  res.send(`
    <h1>Animes disponíveis</h1>
    <ul>${links}</ul>
  `);
});

app.get('/anime/watch/:slug', (req, res) => {
  const { slug } = req.params;
  const folder = path.join(ANIMES_BASE, slug);
  if (!fs.existsSync(folder)) {
    return res.send(`<h1>Nenhum episódio disponível ainda para ${slug}.</h1>`);
  }
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.mp4'));
  if (files.length === 0) {
    return res.send(`<h1>Nenhum episódio disponível ainda para ${slug}.</h1>`);
  }
  const links = files.map(f => `<li><a href="/anime/video/${slug}/${encodeURIComponent(f)}">${f}</a></li>`).join('');
  res.send(`
    <h1>Episódios de ${slug}</h1>
    <ul>${links}</ul>
    <a href="/anime">&larr; Voltar para lista de animes</a>
  `);
});

app.get('/anime/video/:slug/:filename', (req, res) => {
  const { slug, filename } = req.params;
  const filePath = path.join(ANIMES_BASE, slug, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Arquivo não encontrado');
  }
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Servidor web rodando em http://localhost:${PORT}`);
}); 