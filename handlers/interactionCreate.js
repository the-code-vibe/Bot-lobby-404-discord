import { Events } from 'discord.js';
import { getGameDetails } from '../services/steam.js';
import { getFriend  }
import { buildGameEmbed } from '../utils/embedBuilder.js';

export async function interactionCreateHandler(client) {
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'ping') {
            await interaction.reply('Pong!');
        }

        if (interaction.commandName === 'jogo') {
            const appId = interaction.options.getString('appid');

            try {
                const game = await getGameDetails(appId);
                if (!game) {
                    return interaction.reply('Joguinho não foi encontrado!');
                }

                const embed = buildGameEmbed(game);
                await interaction.reply({ embeds: [embed] });

            } catch {
                await interaction.reply('Erro ao buscar o jogo.');
            }
        }

        if (interaction.commandName === 'friends') {
            await interaction.deferReply();
        }
    });
}
