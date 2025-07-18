import { Events } from 'discord.js';
import { commandsMap } from '../commands/index.js';
import axios from 'axios';
import { searchAnimesOnlineCC } from '../commands/anime/searchAnimesOnlineCC.js';
import animeCommand from '../commands/anime/anime.js';
import { exec } from 'child_process';

function getSlugFromAnimeLink(link) {
  // Exemplo: https://animesonlinecc.to/anime/solo-leveling/ => solo-leveling
  const match = link.match(/\/anime\/([^/]+)\/?/);
  return match ? match[1] : '';
}

async function searchSteamGames(query) {
  try {
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=portuguese&cc=BR`;
    const { data } = await axios.get(url);
    if (!data.items) return [];
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
    console.log('Tipo de interação recebida:', interaction.type);
    if (interaction.isButton()) {
      console.log('Botão customId:', interaction.customId);
      if (interaction.customId.startsWith('anime_download|')) {
        const animeLink = decodeURIComponent(interaction.customId.split('|')[1]);
        const slug = getSlugFromAnimeLink(animeLink);
        await interaction.deferReply({ ephemeral: true });
        // Chama o script Node.js para baixar episódios
        exec(`node services/scripts/node/service-download-eps-animeonlinecc.js "${animeLink}" "${slug}" "01"`, (error, stdout, stderr) => {
          if (error) console.error(error);
          if (stderr) console.error(stderr);
          if (stdout) console.log(stdout);
        });
        await interaction.editReply(`Download iniciado! Quando estiver pronto, assista aqui: https://bot.vitorgabrieldev.io/anime/watch/${slug}`);
        return;
      }
    }

    if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);
      if (interaction.commandName === 'game' && focusedOption.name === 'nome') {
        const query = focusedOption.value;
        const choices = query.length > 1 ? await searchSteamGames(query) : [];
        await interaction.respond(choices);
        return;
      }
      if (interaction.commandName === 'anime' && focusedOption.name === 'query') {
        const query = focusedOption.value;
        const choices = query.length > 1 ? await searchAnimesOnlineCC(query) : [];
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
