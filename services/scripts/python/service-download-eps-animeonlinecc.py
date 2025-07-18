import requests
from bs4 import BeautifulSoup
import yt_dlp
import os

def get_episode_links(anime_url):
    html = requests.get(anime_url).text
    soup = BeautifulSoup(html, 'html.parser')
    episodes = soup.select('ul.episodios a')
    return [ep['href'] for ep in episodes]

def sanitize(text):
    return text.replace(' ', '_').replace(':', '').replace('/', '_')

def download_episode(url, folder, filename):
    os.makedirs(folder, exist_ok=True)
    output = os.path.join(folder, filename + '.%(ext)s')
    ydl_opts = {
        'format': 'best[ext=mp4]',
        'outtmpl': output,
        'external_downloader': 'aria2c',
        'external_downloader_args': ['-x', '16', '-s', '16', '-k', '1M']
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

if __name__ == "__main__":
    anime_url = 'https://animesonlinecc.to/anime/solo-leveling/'
    anime_name = 'Solo_Leveling'
    season = '01'
    links = get_episode_links(anime_url)
    for index, link in enumerate(links, 1):
        folder = sanitize(anime_name)
        filename = f'{anime_name}_S{season}_EP{str(index).zfill(2)}'
        download_episode(link, folder, filename)
