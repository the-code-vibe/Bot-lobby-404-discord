import { SlashCommandBuilder } from 'discord.js';
import { getGameDetails } from '../../services/steam.js';
import { buildGameEmbed } from '../../utils/embedBuilder.js';

export default {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('Busca dados de um jogo da Steam')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do jogo')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction) {
    const appId = interaction.options.getString('nome');
    try {
      const game = await getGameDetails(appId);
      if (!game) {
        return interaction.reply('Jogo não foi encontrado!');
      }
      const embed = buildGameEmbed(game);
      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply('Erro ao buscar o jogo.');
    }
  },
}; 