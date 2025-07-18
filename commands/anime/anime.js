import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { searchAnimesOnlineCC } from './searchAnimesOnlineCC.js';

export default {
  data: new SlashCommandBuilder()
    .setName('anime')
    .setDescription('Busca animes no animesonlinecc.to e retorna uma lista de links')
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
      const results = await searchAnimesOnlineCC(query);
      if (!results.length) {
        return interaction.editReply('Nenhum anime encontrado.');
      }
      const anime = results[0];
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Visualizar')
          .setStyle(ButtonStyle.Link)
          .setURL(anime.link),
        new ButtonBuilder()
          .setLabel('Download')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`anime_download|${encodeURIComponent(anime.link)}`)
      );
      return interaction.editReply({
        content: `**${anime.name}**\n${anime.link}`,
        components: [row],
      });
    } catch (err) {
      await interaction.editReply('❌ Erro ao buscar animes. Tente novamente!');
    }
  },
};

export async function handleAnimeAutocomplete(interaction) {
  try {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name !== 'query') return;
    const query = focusedOption.value;
    if (!query || query.length < 2) {
      return interaction.respond([]);
    }
    let results = [];
    try {
      results = await searchAnimesOnlineCC(query);
    } catch (err) {
      console.error('Erro ao buscar animes:', err);
    }
    const choices = results.slice(0, 25).map(r => ({
      name: r.name,
      value: r.name
    }));
    await interaction.respond(choices);
  } catch (err) {
    // Garante que sempre responde, mesmo se der erro acima
    try { await interaction.respond([]); } catch {}
    console.error('Erro no autocomplete:', err);
  }
}
