import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getFriends, getPlayerSummaries } from '../../services/steam.js';

// Configuração dos amigos disponíveis
const FRIENDS = {
  caio: { name: 'Caio', steamid: process.env.STEAM_API_ID_CAIO },
  joao: { name: 'João', steamid: process.env.STEAM_API_ID_JOAO },
  nathan: { name: 'Nathan', steamid: process.env.STEAM_API_ID_NATHAN },
  vitor: { name: 'Vitor', steamid: process.env.STEAM_API_ID_VITOR },
};

// Mapeamento de status da Steam
const STATUS_MAP = {
  0: 'Offline',
  1: 'Online',
  2: 'Ocupado',
  3: 'Ausente',
  4: 'Soneca',
  5: 'Trade',
  6: 'Jogo',
};

// Filtros disponíveis para status
const STATUS_FILTERS = {
  todos: () => true,
  online: (player) => player.personastate > 0,
  offline: (player) => player.personastate === 0,
  jogando: (player) => player.gameextrainfo,
};

/**
 * Filtra a lista de jogadores baseado no status selecionado
 */
function filterPlayersByStatus(players, statusFilter) {
  const filterFunction = STATUS_FILTERS[statusFilter];
  return filterFunction ? players.filter(filterFunction) : players;
}

/**
 * Formata um jogador para exibição no embed
 */
function formatPlayerLine(player) {
  const status = STATUS_MAP[player.personastate] || 'Desconhecido';
  const game = player.gameextrainfo ?? 'Nenhum jogo';
  return `• [${player.personaname}](${player.profileurl}) — ${status} — ${game}`;
}

/**
 * Cria o embed com a lista de amigos
 */
function createFriendsEmbed(amigoName, statusFilter, players) {
  const lines = players.map(formatPlayerLine);
  return new EmbedBuilder()
    .setTitle(`Amigos de ${amigoName} (${statusFilter})`)
    .setDescription(lines.join('\n'));
}

export default {
  data: new SlashCommandBuilder()
    .setName('friends')
    .setDescription('Mostra a lista de amigos de um usuário da Steam')
    .addStringOption(option =>
      option
        .setName('amigo')
        .setDescription('Selecione o usuário')
        .setRequired(true)
        .addChoices(
          { name: 'Caio', value: 'caio' },
          { name: 'João', value: 'joao' },
          { name: 'Nathan', value: 'nathan' },
          { name: 'Vitor', value: 'vitor' }
        )
    )
    .addStringOption(option =>
      option
        .setName('status')
        .setDescription('Filtrar por status')
        .setRequired(true)
        .addChoices(
          { name: 'Todos', value: 'todos' },
          { name: 'Online', value: 'online' },
          { name: 'Offline', value: 'offline' },
          { name: 'Jogando', value: 'jogando' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    // Obtém as opções do comando
    const amigoKey = interaction.options.getString('amigo');
    const statusFilter = interaction.options.getString('status');

    // Valida se o amigo existe
    const amigo = FRIENDS[amigoKey];
    if (!amigo) {
      return interaction.editReply('Amigo não encontrado.');
    }

    try {
      // Busca a lista de amigos do usuário selecionado
      const friendsList = await getFriends(amigo.steamid);
      if (!friendsList.length) {
        return interaction.editReply('Nenhum amigo encontrado para esse usuário.');
      }

      // Busca os dados detalhados dos amigos
      const steamIds = friendsList.map(f => f.steamid);
      const summaries = await getPlayerSummaries(steamIds);
      if (!summaries.length) {
        return interaction.editReply('Não foi possível buscar os dados dos amigos.');
      }

      // Aplica o filtro de status
      const filteredPlayers = filterPlayersByStatus(summaries, statusFilter);
      if (!filteredPlayers.length) {
        return interaction.editReply(`Nenhum amigo ${statusFilter} encontrado.`);
      }

      // Cria e envia o embed
      const embed = createFriendsEmbed(amigo.name, statusFilter, filteredPlayers);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao executar comando friends:', error);
      await interaction.editReply('Ocorreu um erro ao buscar os dados dos amigos.');
    }
  },
}; 