import { EmbedBuilder } from 'discord.js';
import { htmlToText } from 'html-to-text';

export function buildGameEmbed(game) {
    // Processa a descrição
    const description = game.short_description || game.detailed_description || 'Sem descrição disponível';
    const cleanDescription = htmlToText(description, { 
        wordwrap: 100,
        preserveNewlines: true 
    });
    const finalDescription = cleanDescription.substring(0, 200) + (cleanDescription.length > 200 ? '...' : '');

    // Processa o preço
    let priceText = 'Não disponível';
    if (game.is_free) {
        priceText = '🆓 Gratuito';
    } else if (game.price_overview) {
        const price = game.price_overview;
        if (price.discount_percent > 0) {
            priceText = `${price.final_formatted} (${price.discount_percent}% OFF)`;
        } else {
            priceText = `${price.final_formatted}`;
        }
    }

    // Processa categorias (máximo 5, formato tag)
    const categories = game.categories?.slice(0, 5).map(c => `\`${c.description}\``).join(' ') || 'Nenhuma categoria';

    // Processa gêneros (máximo 3, formato tag)
    const genres = game.genres?.slice(0, 3).map(g => `\`${g.description}\``).join(' ') || 'Nenhum gênero';

    // Processa plataformas
    const platforms = Object.entries(game.platforms || {})
        .filter(([, v]) => v)
        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
        .join(', ') || 'Desconhecido';

    const embed = new EmbedBuilder()
        .setTitle(game.name)
        .setURL(`https://store.steampowered.com/app/${game.steam_appid}/`)
        .setDescription(finalDescription)
        .setThumbnail(game.header_image)
        .addFields(
            { name: '💰 Preço', value: priceText, inline: true },
            { name: '📅 Lançamento', value: game.release_date?.date || 'Desconhecido', inline: true },
            { name: '👨‍💻 Desenvolvedores', value: game.developers?.join(', ') || 'Desconhecido', inline: true },
            { name: '🏢 Publicadoras', value: game.publishers?.join(', ') || 'Desconhecido', inline: true },
            { name: '🖥️ Plataformas', value: platforms, inline: true },
            { name: '🎮 Gêneros', value: genres, inline: true },
            { name: '🏷️ Categorias', value: categories, inline: false }
        );

    // Adiciona screenshot (máximo 1)
    const screenshots = game.screenshots?.slice(0, 1) || [];
    if (screenshots.length > 0) {
        embed.addFields({ name: '📸 Screenshot', value: `[Ver Screenshot](${screenshots[0].path_full})` });
    }

    // Adiciona trailer se disponível
    const trailer = game.movies?.find(m => m.highlight) || game.movies?.[0];
    if (trailer) {
        embed.addFields({ name: '🎬 Trailer', value: `[${trailer.name}](${trailer.webm?.max || trailer.mp4?.max || trailer.thumbnail})` });
    }

    return embed;
}