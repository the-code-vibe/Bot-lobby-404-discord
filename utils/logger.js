import chalk from 'chalk';
import { EmbedBuilder } from 'discord.js';

let discordClient = null;
let logChannelId = null;
let currentContext = null;

function timestamp() {
  return new Date().toISOString();
}

function setContext(context) {
  currentContext = context;
}

async function sendToDiscord(level, emoji, color, msg) {
  if (!discordClient || !logChannelId) return;
  try {
    const channel = await discordClient.channels.fetch(logChannelId);
    if (channel && channel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${emoji} ${level}`)
        .setDescription(msg)
        .setFooter({ text: timestamp() });

      if (currentContext) {
        embed.addFields(
          { name: 'Servidor', value: `${currentContext.serverName} (${currentContext.serverId})`, inline: false },
          { name: 'Canal', value: `${currentContext.channelName} (${currentContext.channelId})`, inline: false },
          { name: 'Usuário', value: `${currentContext.userTag} (${currentContext.userId})`, inline: false },
          { name: 'Evento', value: currentContext.eventType, inline: false }
        );
      }

      await channel.send({ embeds: [embed] });
    }
  } catch {
    // falha silenciosa
  }
}

function formatMessage(level, msg) {
  return `[${level}] [${timestamp()}] ${msg}`;
}

export const logger = {
  init: (client, channelId) => {
    discordClient = client;
    logChannelId = channelId;
  },
  setContext: (context) => {
    setContext(context);
  },
  info: async (msg) => {
    console.log(chalk.blue(formatMessage('INFO', msg)));
    await sendToDiscord('INFO', '🛈', 0x3498db, msg);
  },
  success: async (msg) => {
    console.log(chalk.green(formatMessage('SUCCESS', msg)));
    await sendToDiscord('SUCCESS', '✅', 0x2ecc71, msg);
  },
  warn: async (msg) => {
    console.log(chalk.yellow(formatMessage('WARN', msg)));
    await sendToDiscord('WARNING', '⚠️', 0xf1c40f, msg);
  },
  error: async (msg) => {
    console.error(chalk.red(formatMessage('ERROR', msg)));
    await sendToDiscord('ERROR', '❌', 0xe74c3c, msg);
  },
  logStartupInfo: async () => {
    if (!discordClient || !logChannelId) return;
    try {
      const channel = await discordClient.channels.fetch(logChannelId);
      if (channel && channel.isTextBased()) {
        const now = new Date();
        const formattedDate = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  
        const guilds = discordClient.guilds.cache.map(g => `${g.name} (ID: ${g.id})`).join('\n') || 'Nenhum servidor';
  
        const embed = new EmbedBuilder()
          .setColor(0x00ff99)
          .setTitle('🟢 Bot Iniciado')
          .setDescription('O bot foi iniciado com sucesso.')
          .addFields(
            { name: 'Data e Hora', value: formattedDate, inline: false },
            { name: 'Servidores Conectados', value: guilds, inline: false }
          )
          .setFooter({ text: timestamp() });
  
        await channel.send({ embeds: [embed] });
      }
    } catch {}
  }
};