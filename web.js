import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.get('/anime/watch/:slug', (req, res) => {
  const { slug } = req.params;
  const folder = path.join(process.cwd(), slug.replace(/[^a-zA-Z0-9_-]/g, '_'));
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
  `);
});

app.get('/anime/video/:slug/:filename', (req, res) => {
  const { slug, filename } = req.params;
  const filePath = path.join(process.cwd(), slug.replace(/[^a-zA-Z0-9_-]/g, '_'), filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Arquivo não encontrado');
  }
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Servidor web rodando em http://localhost:${PORT}`);
}); 