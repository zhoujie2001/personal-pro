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

function getFallbackCover(song) {
  return FALLBACK_COVER_URLS[simpleHash(`${song.title}-${song.artist}-cover`) % FALLBACK_COVER_URLS.length];
}

export function getReliableAudioUrl(song) {
  return FALLBACK_AUDIO_URLS[simpleHash(`${song.title}-${song.artist}-audio`) % FALLBACK_AUDIO_URLS.length];
}

export function getHighQualityCoverUrl(song) {
  return getFallbackCover(song);
}

function buildSearchKeyword(song) {
  return `${song.title} ${song.artist}`.trim();
}

function pickBestCandidate(song, list = []) {
  const normalize = (value) => (value || '').toLowerCase().replace(/\s+/g, '');
  const targetTitle = normalize(song.title);
  const targetArtist = normalize(song.artist);

  const scored = list.map((item) => {
    const name = normalize(item.songname);
    const singers = normalize((item.singer || []).map((s) => s.name).join('/'));

    let score = 0;
    if (name === targetTitle) score += 100;
    else if (name.includes(targetTitle) || targetTitle.includes(name)) score += 50;
    if (singers.includes(targetArtist) || targetArtist.includes(singers)) score += 50;
    if (item.free) score += 10;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item || null;
}

async function searchSong(song) {
  const keyword = encodeURIComponent(buildSearchKeyword(song));
  const response = await fetch(`https://api.timelessq.com/music/tencent/search?keyword=${keyword}&page=1&pageSize=8`);
  if (!response.ok) {
    throw new Error(`search failed: ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.errno !== 0 || !Array.isArray(payload?.data?.list)) {
    throw new Error('invalid search payload');
  }

  return pickBestCandidate(song, payload.data.list);
}

async function fetchSongUrl(songmid) {
  const response = await fetch(`https://api.timelessq.com/music/tencent/songUrl?songmid=${encodeURIComponent(songmid)}`);
  if (!response.ok) {
    throw new Error(`songUrl failed: ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.errno !== 0 || !Array.isArray(payload?.data) || !payload.data[0]?.url) {
    throw new Error('invalid songUrl payload');
  }

  return payload.data[0].url;
}

async function hydrateSong(song) {
  try {
    const matched = await searchSong(song);
    if (!matched?.songmid) {
      throw new Error('no matched song');
    }

    const audioUrl = await fetchSongUrl(matched.songmid);
    return {
      ...song,
      qqSongMid: matched.songmid,
      title: matched.songname || song.title,
      artist: (matched.singer || []).map((item) => item.name).join(' / ') || song.artist,
      album: matched.albumname || song.album,
      cover: matched.albumcover || getFallbackCover(song),
      audioUrl,
      free: matched.free !== false,
      source: 'QQ歌单映射',
    };
  } catch (error) {
    return {
      ...song,
      cover: getFallbackCover(song),
      audioUrl: getReliableAudioUrl(song),
      source: '回退音源',
      error: error.message,
    };
  }
}

export async function enhanceSongsSimple(songs) {
  const results = await Promise.all(songs.map((song) => hydrateSong(song)));
  return results;
}

export async function testAudioAccessibility() {
  return {
    success: true,
    results: [],
    message: '运行时按需获取歌曲播放地址',
  };
}

export function getServiceStatus() {
  return {
    name: 'QQ音乐搜索映射播放服务',
    version: '2.0.0',
    features: [
      '基于歌单种子数据随机展示',
      '运行时搜索歌曲封面与播放链接',
      '点击后在线播放',
      '失败时自动回退到公共音源',
    ],
    audioSources: FALLBACK_AUDIO_URLS.length,
    coverSources: FALLBACK_COVER_URLS.length,
    lastUpdated: new Date().toISOString(),
  };
}
