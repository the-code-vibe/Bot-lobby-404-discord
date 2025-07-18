import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fetch from 'node-fetch';
import { load } from 'cheerio';

function parseSeasonsAndEpisodes($) {
  const seasons = [];
  $('#seasons > .se-c').each((i, el) => {
    const seasonNumber = $(el).find('.se-t').text().trim();
    const seasonTitle = $(el).find('.title').text().trim();
    const episodes = [];
    $(el).find('ul.episodios li').each((j, epEl) => {
      const a = $(epEl).find('.episodiotitle a');
      episodes.push({
        title: a.text().trim(),
        link: a.attr('href'),
      });
    });
    seasons.push({
      seasonNumber,
      seasonTitle,
      episodes,
    });
  });
  return seasons;
}

export default {
  data: new SlashCommandBuilder()
    .setName('anime')
    .setDescription('Busca um anime no animesonlinecc.to e lista os episódios')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Nome do anime')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    await interaction.deferReply();

    try {
      const animeSlug = query
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 ]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const animeLink = `https://animesonlinecc.to/anime/${animeSlug}/`;
      const animeRes = await fetch(animeLink);
      const animeHtml = await animeRes.text();
      const $ = load(animeHtml);

      const poster = $('.sheader .poster img').attr('src');
      const title = $('.sheader .data h1').text().trim();
      const year = $('.sheader .data .extra .date').text().trim();
      const genres = [];
      $('.sheader .data .sgeneros a').each((i, el) => {
        genres.push($(el).text().trim());
      });

      const seasons = parseSeasonsAndEpisodes($);

      if (!seasons.length) {
        return interaction.editReply('❌ Nenhuma temporada ou episódio encontrada!');
      }

      // Cria botões para cada temporada
      const row = new ActionRowBuilder();
      seasons.forEach((season, idx) => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`anime_season_${idx}_${interaction.id}`)
            .setLabel(season.seasonTitle || `Temporada ${season.seasonNumber}`)
            .setStyle(ButtonStyle.Primary)
        );
      });

      const embed = new EmbedBuilder()
        .setTitle(`Temporadas de ${title}`)
        .setURL(animeLink)
        .setDescription('Selecione uma temporada para ver os episódios.')
        .setColor(0x0099ff)
        .setFooter({ text: 'Fonte: animesonlinecc.to' });

      if (poster) embed.setThumbnail(poster);
      if (year || genres.length) {
        embed.addFields(
          { name: 'Ano', value: year || 'Desconhecido', inline: true },
          { name: 'Gêneros', value: genres.join(', ') || 'Desconhecido', inline: true }
        );
      }

      // Salva os dados das temporadas em cache na interação
      if (!interaction.client.animeCache) interaction.client.animeCache = {};
      interaction.client.animeCache[interaction.id] = { seasons, title, animeLink };

      await interaction.editReply({ embeds: [embed], components: [row] });
      return;
    } catch (err) {
      await interaction.editReply('❌ Erro ao buscar o anime. Tente novamente!');
    }
  },
};

// Handler para os botões de temporada
export async function handleAnimeSeasonButton(interaction) {
  console.log('Botão clicado:', interaction.customId);
  // Recupera o cache
  const match = interaction.customId.match(/^anime_season_(\d+)_(.+)$/);
  if (!match) return interaction.reply({ content: '❌ Botão inválido.', ephemeral: true });
  const idx = parseInt(match[1], 10);
  const interactionId = match[2];
  console.log('animeCache:', interaction.client.animeCache);
  console.log('Procurando pelo interactionId:', interactionId);
  const cache = interaction.client.animeCache?.[interactionId];
  if (!cache) {
    console.log('Cache não encontrado para o interactionId:', interactionId);
    return interaction.reply({ content: '❌ Não foi possível recuperar os dados do anime.', ephemeral: true });
  }
  console.log('Cache:', cache);
  const { seasons, title, animeLink } = cache;
  const season = seasons[idx];
  if (!season) {
    return interaction.reply({ content: '❌ Temporada não encontrada.', ephemeral: true });
  }
  let desc = season.episodes.map(ep => `[${ep.title}](${ep.link})`).join('\n');
  if (desc.length > 4000) desc = desc.slice(0, 3997) + '...';
  const embed = new EmbedBuilder()
    .setTitle(`${season.seasonTitle || `Temporada ${season.seasonNumber}`} de ${title}`)
    .setURL(animeLink)
    .setDescription(desc)
    .setColor(0x0099ff)
    .setFooter({ text: 'Fonte: animesonlinecc.to' });
  await interaction.update({ embeds: [embed], components: [] });
}
