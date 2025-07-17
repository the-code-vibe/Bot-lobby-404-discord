import { REST, Routes } from 'discord.js';
import { client } from './client.js';
import { commands } from './commands/commands.js';
import { interactionCreateHandler } from './handlers/interactionCreate.js';
import { logger } from './utils/logger.js';
import 'dotenv/config';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function registerCommands() {
  if (!process.env.CLIENT_ID || !process.env.GUILD_ID) throw new Error('CLIENT_ID ou GUILD_ID não configurados.');
  logger.info('Registrando comandos...');
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  logger.success('Comandos registrados.');
}

async function main() {
  try {
    if (!process.env.TOKEN) throw new Error('TOKEN não configurado.');

    await registerCommands();

    interactionCreateHandler(client);

    client.once('ready', async () => {
      logger.init(client, process.env.CHANNEL_ID_LOGS);
      logger.success('Bot online!');
      await logger.logStartupInfo();
    });

    await client.login(process.env.TOKEN);

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

main();