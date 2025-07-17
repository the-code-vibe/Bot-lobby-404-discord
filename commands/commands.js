import { SlashCommandBuilder } from 'discord.js';

export const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde pong'),

    new SlashCommandBuilder()
        .setName('jogo')
        .setDescription('Busca dados de um jogo da Steam')
        .addStringOption(option =>
            option.setName('appid')
                .setDescription('ID do jogo da Steam')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('friends')
        .setDescription('Buscando lista de Amigos e Status Atual'),
].map(c => c.toJSON());