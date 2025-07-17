import axios from 'axios';

export async function getGameDetails(appId) {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
    const { data } = await axios.get(url);
    if (!data[appId]?.success) return null;
    return data[appId].data;
}