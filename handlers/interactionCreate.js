import { Events } from 'discord.js';
import { commandsMap } from '../commands/index.js';
import axios from 'axios';

async function searchSteamGames(query) {
  // Busca jogos na Steam Store API (usando endpoint de search)
  try {
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=portuguese&cc=BR`;
    const { data } = await axios.get(url);
    if (!data.items) return [];
    // Retorna até 25 sugestões
    return data.items.slice(0, 25).map(item => ({
      name: item.name,
      value: String(item.id),
    }));
  } catch {
    return [];
  }
}

export async function interactionCreateHandler(client) {
  client.on(Events.InteractionCreate, async interaction => {
    // Handler de autocomplete para o comando game
    if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);
      if (interaction.commandName === 'game' && focusedOption.name === 'nome') {
        const query = focusedOption.value;
        const choices = query.length > 1 ? await searchSteamGames(query) : [];
        await interaction.respond(choices);
        return;
      }
    }

    if (!interaction.isChatInputCommand()) return;
    const command = commandsMap.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply('Ocorreu um erro ao executar o comando.');
      } else {
        await interaction.reply('Ocorreu um erro ao executar o comando.');
      }
      console.error(error);
    }
  });
}
