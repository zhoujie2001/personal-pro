const PLAYLIST_ENDPOINT = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';
const SEARCH_ENDPOINT = 'https://api.timelessq.com/music/tencent/search';
const SONG_URL_ENDPOINT = 'https://api.timelessq.com/music/tencent/songUrl';

function json(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.send(JSON.stringify(data));
}

function pickBestCandidate(song, list = []) {
  const normalize = (value) => (value || '').toLowerCase().replace(/\s+/g, '');
  const targetTitle = normalize(song.songname || song.title);
  const targetArtist = normalize(song.artist || (song.singer || []).map((item) => item.name).join('/'));

  return [...list]
    .map((item) => {
      const title = normalize(item.songname);
      const singers = normalize((item.singer || []).map((s) => s.name).join('/'));
      let score = 0;
      if (title === targetTitle) score += 100;
      else if (title.includes(targetTitle) || targetTitle.includes(title)) score += 50;
      if (singers.includes(targetArtist) || targetArtist.includes(singers)) score += 50;
      if (item.free) score += 10;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.item || null;
}

async function fetchPlaylistFromQQ(dissid, cookie) {
  const url = `${PLAYLIST_ENDPOINT}?type=1&json=1&utf8=1&onlysong=0&disstid=${encodeURIComponent(dissid)}`;
  const response = await fetch(url, {
    headers: {
      referer: 'https://y.qq.com/',
      'user-agent': 'Mozilla/5.0',
      ...(cookie ? { cookie } : {}),
    },
  });

  const text = await response.text();
  const normalized = text.replace(/^jsonCallback\(/, '').replace(/\)\s*$/, '');
  const payload = JSON.parse(normalized);

  if (payload?.code !== 0 || !Array.isArray(payload?.cdlist) || !payload.cdlist[0]) {
    throw new Error(payload?.msg || 'qq playlist fetch failed');
  }

  return payload.cdlist[0].songlist || [];
}

async function fetchPlayableSong(song) {
  const keyword = encodeURIComponent(`${song.songname || song.title} ${(song.singer || []).map((item) => item.name).join(' / ')}`.trim());
  const searchResponse = await fetch(`${SEARCH_ENDPOINT}?keyword=${keyword}&page=1&pageSize=6`);
  const searchPayload = await searchResponse.json();

  if (searchPayload?.errno !== 0 || !Array.isArray(searchPayload?.data?.list)) {
    throw new Error('search candidate failed');
  }

  const candidate = pickBestCandidate(song, searchPayload.data.list);
  if (!candidate?.songmid) {
    throw new Error('no candidate');
  }

  const songUrlResponse = await fetch(`${SONG_URL_ENDPOINT}?songmid=${encodeURIComponent(candidate.songmid)}`);
  const songUrlPayload = await songUrlResponse.json();
  const audioUrl = songUrlPayload?.data?.[0]?.url;

  if (!audioUrl) {
    throw new Error('song url unavailable');
  }

  return {
    songid: song.songid,
    songmid: candidate.songmid,
    songname: song.songname || candidate.songname,
    singer: candidate.singer || song.singer || [],
    albumname: candidate.albumname || song.albumname || '',
    albumcover: candidate.albumcover || '',
    audioUrl,
    audioSource: '真实歌单代理',
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return json(res, 200, { success: true });
  }

  const { dissid } = req.query || {};
  if (!dissid) {
    return json(res, 400, { success: false, message: 'missing dissid' });
  }

  try {
    const songs = await fetchPlaylistFromQQ(dissid, process.env.QQMUSIC_COOKIE || '');
    const playableSongs = await Promise.all(
      songs.slice(0, 30).map(async (song) => {
        try {
          return await fetchPlayableSong(song);
        } catch (error) {
          return {
            songid: song.songid,
            songmid: song.songmid || '',
            songname: song.songname || '未知歌曲',
            singer: song.singer || [],
            albumname: song.albumname || '',
            albumcover: '',
            audioUrl: '',
            audioSource: `抓取成功但音源不可用: ${error.message}`,
          };
        }
      })
    );

    return json(res, 200, {
      success: true,
      dissid,
      total: playableSongs.length,
      songs: playableSongs.filter((item) => item.songname),
      source: 'qq-serverless-proxy',
    });
  } catch (error) {
    return json(res, 502, {
      success: false,
      dissid,
      message: error.message || 'playlist proxy failed',
      hint: '该歌单可能需要有效的 QQMUSIC_COOKIE，或歌单本身存在隐私限制。',
    });
  }
}
