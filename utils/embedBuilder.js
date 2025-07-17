import { EmbedBuilder } from 'discord.js';
import { htmlToText } from 'html-to-text';

export function buildGameEmbed(game) {
    const embed = new EmbedBuilder()
        .setTitle(game.name)
        .setURL(`https://store.steampowered.com/app/${game.steam_appid}/`)
        .setDescription(htmlToText(game.short_description || game.detailed_description || 'Sem descrição'))
        .setThumbnail(game.header_image)
        .addFields(
            { name: 'Preço', value: game.is_free ? 'Gratuito' : (game.price_overview?.final_formatted || 'Não disponível'), inline: true },
            { name: 'Lançamento', value: game.release_date?.date || 'Desconhecido', inline: true },
            { name: 'Desenvolvedores', value: game.developers?.join(', ') || 'Desconhecido', inline: true },
            { name: 'Publicadoras', value: game.publishers?.join(', ') || 'Desconhecido', inline: true },
            {
                name: 'Plataformas', value: Object.entries(game.platforms)
                    .filter(([, v]) => v)
                    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                    .join(', ') || 'Desconhecido', inline: true
            },
            { name: 'Categorias', value: game.categories?.map(c => c.description).join(', ') || 'Desconhecido', inline: true },
            { name: 'Gêneros', value: game.genres?.map(g => g.description).join(', ') || 'Desconhecido', inline: true }
        )
        .setImage(game.background_raw || game.header_image)
        .setFooter({ text: 'Dados fornecidos pela Steam Store' });

    const screenshots = game.screenshots?.slice(0, 3) || [];
    if (screenshots.length > 0) {
        embed.addFields({ name: 'Screenshots', value: screenshots.map(s => `[Link](${s.path_full})`).join(' | ') });
    }

    const trailer = game.movies?.find(m => m.highlight) || game.movies?.[0];
    if (trailer) {
        embed.addFields({ name: 'Trailer', value: `[${trailer.name}](${trailer.webm?.max || trailer.mp4?.max || trailer.thumbnail})` });
    }

    return embed;
}