import { Events } from 'discord.js';
import { getGameDetails, getPlayerSummaries, getFriends } from '../services/steam.js';
import { buildGameEmbed } from '../utils/embedBuilder.js';
import { EmbedBuilder } from 'discord.js';

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

            const friends = await getFriends();

            if (!friends.length) {
                return interaction.editReply("Nenhum amigo encontrado!");
            };

            const steamIds = friends.map(f => f.steamid)
            const summaries = await getPlayerSummaries(steamIds);

            const statusMap = {
                0: 'Offline',
                1: 'Online',
                2: 'Ocupado',
                3: 'Ausente',
                4: 'Soneca',
                5: 'Procurando Trade',
                6: 'Procurando Jogo',
            };

            const embeds = summaries.map(p => {
                const status = statusMap[p.personastate] || 'Desconhecido';
                const game = p.gameextrainfo ?? null;

                return new EmbedBuilder()
                    .setTitle(p.personaname)
                    .setURL(p.profileurl)
                    .setThumbnail(p.avatarfull)
                    .addFields(
                        { name: 'Status', value: status, inline: true },
                        { name: 'País', value: p.loccountrycode || 'Desconhecido', inline: true },
                        { name: 'Jogo Atual', value: game ?? 'Nenhum jogo ativo', inline: false }
                    );
            });

            if (embeds.length === 0) {
                await interaction.editReply('Nenhum amigo online ou jogando.');
            } else {
                await interaction.editReply({ embeds });
            }
        }
    });
}
