import { REST, Routes } from 'discord.js';
import { client } from './client.js';
import { commands } from './commands/commands.js';
import { interactionCreateHandler } from './handlers/interactionCreate.js';
import { logger } from './utils/logger.js';
import 'dotenv/config';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function main() {
  try {
    logger.info('Iniciando registro dos comandos...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    logger.success('Comandos registrados com sucesso!');

    interactionCreateHandler(client);

    client.once('ready', () => {
      logger.init(client, process.env.CHANNEL_ID_LOGS);
      logger.success('O bot está online!');
    });

    await client.login(process.env.TOKEN);
  } catch (error) {
    logger.error(error);
  }
}


main();