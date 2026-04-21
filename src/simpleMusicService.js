const SEARCH_API = 'https://api.timelessq.com/music/tencent/search'
const SONG_URL_API = 'https://api.timelessq.com/music/tencent/songUrl'
const UNPLAYABLE_URL_PATTERN = /^https?:\/\/aqqmusic\.tc\.qq\.com\/?$/
const songUrlCache = new Map()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJsonWithRetry(url, retries = 3) {
  let lastError

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`request failed: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await sleep(250 * attempt)
      }
    }
  }

  throw lastError
}

function encodeKeyword(title, artist) {
  return encodeURIComponent(`${title} ${artist}`.trim())
}

function normalizeText(value) {
  return `${value || ''}`.trim().toLowerCase()
}

function getSingerText(candidate) {
  return Array.isArray(candidate?.singer)
    ? candidate.singer.map((item) => item.name).filter(Boolean).join(' / ')
    : ''
}

function scoreCandidate(candidate, originalSong) {
  const title = normalizeText(candidate?.songname)
  const artist = normalizeText(getSingerText(candidate))
  const targetTitle = normalizeText(originalSong.title)
  const targetArtist = normalizeText(originalSong.artist)

  let score = 0

  if (title === targetTitle) {
    score += 100
  } else if (title.includes(targetTitle) || targetTitle.includes(title)) {
    score += 60
  }

  if (artist.includes(targetArtist)) {
    score += 40
  }

  if (candidate?.free) {
    score += 15
  }

  return score
}

function normalizeCandidate(candidate, originalSong, playlist, source = 'timelessq-search') {
  const singers = getSingerText(candidate)

  return {
    id: candidate?.songmid || `${playlist.id}-${originalSong.id}`,
    localKey: `${playlist.id}-${candidate?.songmid || originalSong.id}`,
    songmid: candidate?.songmid || '',
    title: candidate?.songname || originalSong.title,
    artist: singers || originalSong.artist,
    album: candidate?.albumname || originalSong.album || '',
    cover: candidate?.albumcover || getFallbackCover(originalSong),
    source,
    playlistId: playlist.id,
    playlistName: playlist.name,
  }
}

export function getFallbackCover(song) {
  return `https://picsum.photos/seed/${encodeURIComponent(`${song.title}-${song.artist}`)}/300/300`
}

async function searchSongCandidates(song) {
  const url = `${SEARCH_API}?keyword=${encodeKeyword(song.title, song.artist)}&page=1&pageSize=10`
  const payload = await fetchJsonWithRetry(url)
  const list = payload?.data?.list
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('no search result')
  }

  return [...list].sort((a, b) => scoreCandidate(b, song) - scoreCandidate(a, song)).slice(0, 6)
}

export async function resolveSongUrl(song) {
  if (!song.songmid) {
    return { ...song, audioUrl: '' }
  }

  if (songUrlCache.has(song.songmid)) {
    return {
      ...song,
      audioUrl: songUrlCache.get(song.songmid),
      source: songUrlCache.get(song.songmid) ? 'timelessq-songUrl-cache' : `${song.source}-unplayable-cache`,
    }
  }

  const payload = await fetchJsonWithRetry(`${SONG_URL_API}?songmid=${encodeURIComponent(song.songmid)}`)
  const data = Array.isArray(payload?.data) ? payload.data[0] : payload?.data
  const audioUrl = data?.url || ''
  const playable = audioUrl && !UNPLAYABLE_URL_PATTERN.test(audioUrl)
  const finalUrl = playable ? audioUrl : ''
  songUrlCache.set(song.songmid, finalUrl)

  return {
    ...song,
    audioUrl: finalUrl,
    source: playable ? 'timelessq-songUrl' : `${song.source}-unplayable`,
  }
}

export async function searchSong(song, playlist) {
  const candidates = await searchSongCandidates(song)

  for (const candidate of candidates) {
    const normalized = normalizeCandidate(candidate, song, playlist)
    const resolved = await resolveSongUrl(normalized)
    if (resolved.audioUrl) {
      return resolved
    }
  }

  return normalizeCandidate(candidates[0], song, playlist, 'timelessq-search-no-playable-url')
}

export async function buildPlayableSongs(playlist, count = 5) {
  const pool = [...playlist.fallbackSongs].sort(() => Math.random() - 0.5)
  const playableResults = []
  const fallbackResults = []

  for (const song of pool) {
    try {
      const resolved = await searchSong(song, playlist)
      const normalized = {
        ...resolved,
        cover: resolved.cover || getFallbackCover(song),
      }

      if (normalized.audioUrl) {
        playableResults.push(normalized)
      } else {
        fallbackResults.push(normalized)
      }
    } catch (error) {
      fallbackResults.push({
        id: `${playlist.id}-${song.id}`,
        localKey: `${playlist.id}-${song.id}`,
        title: song.title,
        artist: song.artist,
        album: song.album,
        cover: getFallbackCover(song),
        audioUrl: '',
        source: 'fallback-song',
        playlistId: playlist.id,
        playlistName: playlist.name,
      })
    }

    if (playableResults.length >= count) {
      break
    }
  }

  return [...playableResults, ...fallbackResults].slice(0, count)
}
