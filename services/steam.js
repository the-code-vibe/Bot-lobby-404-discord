import axios from 'axios';
import 'dotenv/config';

const STEAM_API_KEY_VITOR = process.env.STEAM_API_KEY_VITOR;
const STEAM_API_ID_VITOR = process.env.STEAM_API_ID_VITOR;

export async function getGameDetails(appId) {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
    const { data } = await axios.get(url);
    if (!data[appId]?.success) return null;
    return data[appId].data;
}

export async function getPlayerSummaries(steamIds) {
    if (!steamIds.length) return [];
    const ids = steamIds.join(',');
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY_VITOR}&steamids=${ids}`;
    const { data } = await axios.get(url);
    return data.response.players;
}

export async function getFriends() {
    const url = `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${STEAM_API_KEY_VITOR}&steamid=${STEAM_API_ID_VITOR}`;
    const { data } = await axios.get(url);
    if (!data.friendslist?.friends) return [];
    return data.friendslist.friends;
}