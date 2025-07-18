import axios from 'axios';
import 'dotenv/config';

const STEAM_API_KEY = process.env.STEAM_API_KEY_VITOR;
const STEAM_API_ID = process.env.STEAM_API_ID_VITOR;

const steamAxios = axios.create({
  timeout: 10000,
});

export async function getGameDetails(appId) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
    const { data } = await steamAxios.get(url);
    if (!data[appId]?.success) return null;
    return data[appId].data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do jogo:', error.message);
    return null;
  }
}

export async function getPlayerSummaries(steamIds, apiKey = STEAM_API_KEY) {
  if (!steamIds.length) return [];
  try {
    const ids = steamIds.join(',');
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${ids}`;
    const { data } = await steamAxios.get(url);
    return data?.response?.players || [];
  } catch (error) {
    console.error('Erro ao buscar summaries:', error.message);
    return [];
  }
}

export async function getFriends(steamid = STEAM_API_ID, apiKey = STEAM_API_KEY) {
  try {
    const url = `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${apiKey}&steamid=${steamid}`;
    const { data } = await steamAxios.get(url);
    return data?.friendslist?.friends || [];
  } catch (error) {
    console.error('Erro ao buscar lista de amigos:', error.message);
    return [];
  }
}