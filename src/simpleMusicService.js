const FALLBACK_AUDIO_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
];

const FALLBACK_COVER_URLS = [
  'https://picsum.photos/300/300?image=11',
  'https://picsum.photos/300/300?image=22',
  'https://picsum.photos/300/300?image=33',
  'https://picsum.photos/300/300?image=44',
  'https://picsum.photos/300/300?image=55',
];

function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function getReliableAudioUrl(song) {
  return FALLBACK_AUDIO_URLS[simpleHash(`${song.title}-${song.artist}-audio`) % FALLBACK_AUDIO_URLS.length];
}

export function getFallbackCover(song) {
  return FALLBACK_COVER_URLS[simpleHash(`${song.title}-${song.artist}-cover`) % FALLBACK_COVER_URLS.length];
}

function normalizeSong(song, playlist) {
  const singers = Array.isArray(song.singer)
    ? song.singer.map((item) => item.name).filter(Boolean).join(' / ')
    : song.artist;

  return {
    id: song.songid || song.id || song.songmid,
    songmid: song.songmid || song.mid || '',
    title: song.songname || song.title || '未知歌曲',
    artist: singers || '未知歌手',
    album: song.albumname || song.album || '未知专辑',
    cover: song.albumcover || getFallbackCover(song),
    audioUrl: song.audioUrl || getReliableAudioUrl(song),
    source: song.audioSource || song.source || '真实歌单',
    playlistId: playlist.id,
    playlistName: playlist.name,
  };
}

export async function fetchPlaylistSongs(playlist) {
  const response = await fetch(`/api/qq/playlist?dissid=${encodeURIComponent(playlist.dissid)}`);
  const payload = await response.json();

  if (!response.ok || !payload?.success || !Array.isArray(payload?.songs)) {
    throw new Error(payload?.message || 'playlist fetch failed');
  }

  return payload.songs.map((song, index) => ({
    ...normalizeSong(song, playlist),
    localKey: `${playlist.id}-${song.songmid || song.songid || index}-${index}`,
  }));
}

export function buildFallbackSongs(playlist, count = 5) {
  return Array.from({ length: count }, (_, index) => {
    const baseTitle = `${playlist.name} ${index + 1}`;
    return {
      id: `${playlist.id}-${index + 1}`,
      songmid: '',
      title: baseTitle,
      artist: '暂未获取',
      album: '等待服务端抓取',
      cover: getFallbackCover({ title: baseTitle, artist: playlist.name }),
      audioUrl: getReliableAudioUrl({ title: baseTitle, artist: playlist.name }),
      source: '回退音源',
      playlistId: playlist.id,
      playlistName: playlist.name,
      localKey: `${playlist.id}-fallback-${index + 1}`,
    };
  });
}

export function getServiceStatus() {
  return {
    name: '真实 QQ 歌单代理服务',
    version: '3.0.0',
    features: [
      '通过 Serverless 代理获取真实歌单',
      '随机展示每个歌单 5 首歌曲',
      '展示真实封面、歌名、歌手、专辑',
      '可播放时优先使用真实音源',
      '失败时自动回退到公共音源',
    ],
    lastUpdated: new Date().toISOString(),
  };
}
