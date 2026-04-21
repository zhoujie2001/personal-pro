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
  return `${value || ''}`
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\s\u00A0]+/g, '')
    .replace(/[()（）\[\]【】《》<>「」『』'"“”‘’`~!！?？,，.。:：;；/\\|·•—\-_+*=]+/g, '')
}

function getSingerList(candidate) {
  return Array.isArray(candidate?.singer)
    ? candidate.singer.map((item) => `${item?.name || ''}`.trim()).filter(Boolean)
    : []
}

function getSingerText(candidate) {
  return getSingerList(candidate).join(' / ')
}

function getCandidateAlbum(candidate) {
  return `${candidate?.albumname || ''}`.trim()
}

function isExactTitleMatch(candidate, originalSong) {
  return normalizeText(candidate?.songname) === normalizeText(originalSong.title)
}

function isExactArtistMatch(candidate, originalSong) {
  const targetArtist = normalizeText(originalSong.artist)
  const singers = getSingerList(candidate).map((item) => normalizeText(item))
  return singers.includes(targetArtist)
}

function isExactAlbumMatch(candidate, originalSong) {
  const targetAlbum = normalizeText(originalSong.album)
  if (!targetAlbum) {
    return false
  }
  return normalizeText(getCandidateAlbum(candidate)) === targetAlbum
}

function isStrictMatch(candidate, originalSong) {
  return isExactTitleMatch(candidate, originalSong) && isExactArtistMatch(candidate, originalSong)
}

function scoreStrictCandidate(candidate, originalSong) {
  let score = 0
  const singers = getSingerList(candidate)

  if (isExactTitleMatch(candidate, originalSong)) {
    score += 100
  }

  if (isExactArtistMatch(candidate, originalSong)) {
    score += 100
  }

  if (isExactAlbumMatch(candidate, originalSong)) {
    score += 60
  }

  if (singers.length === 1) {
    score += 20
  } else if (singers.length > 1) {
    score += 5
  }

  if (candidate?.free) {
    score += 10
  }

  return score
}

function normalizeCandidate(candidate, originalSong, playlist, source = 'timelessq-search') {
  const singers = getSingerText(candidate)
  const album = getCandidateAlbum(candidate)

  return {
    id: candidate?.songmid || `${playlist.id}-${originalSong.id}`,
    localKey: `${playlist.id}-${candidate?.songmid || originalSong.id}`,
    songmid: candidate?.songmid || '',
    title: candidate?.songname || originalSong.title,
    artist: singers || originalSong.artist,
    album: album || originalSong.album || '',
    cover: candidate?.albumcover || getFallbackCover(candidate?.songname || originalSong.title, singers || originalSong.artist),
    source,
    playlistId: playlist.id,
    playlistName: playlist.name,
  }
}

function buildUnavailableSong(originalSong, playlist, reason = 'fallback-song') {
  return {
    id: `${playlist.id}-${originalSong.id}`,
    localKey: `${playlist.id}-${originalSong.id}`,
    songmid: '',
    title: originalSong.title,
    artist: originalSong.artist,
    album: originalSong.album || '',
    cover: getFallbackCover(originalSong.title, originalSong.artist),
    audioUrl: '',
    source: reason,
    playlistId: playlist.id,
    playlistName: playlist.name,
  }
}

export function getFallbackCover(title, artist) {
  return `https://picsum.photos/seed/${encodeURIComponent(`${title}-${artist}`)}/300/300`
}

async function searchSongCandidates(song) {
  const url = `${SEARCH_API}?keyword=${encodeKeyword(song.title, song.artist)}&page=1&pageSize=10`
  const payload = await fetchJsonWithRetry(url)
  const list = payload?.data?.list

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('no search result')
  }

  return list
    .filter((candidate) => isStrictMatch(candidate, song))
    .sort((a, b) => scoreStrictCandidate(b, song) - scoreStrictCandidate(a, song))
}

export async function resolveSongUrl(song) {
  if (!song.songmid) {
    return { ...song, audioUrl: '' }
  }

  if (songUrlCache.has(song.songmid)) {
    const cachedUrl = songUrlCache.get(song.songmid)
    return {
      ...song,
      audioUrl: cachedUrl,
      source: cachedUrl ? 'timelessq-songUrl-cache' : `${song.source}-unplayable-cache`,
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
  const strictCandidates = await searchSongCandidates(song)

  if (strictCandidates.length === 0) {
    return buildUnavailableSong(song, playlist, 'strict-match-not-found')
  }

  let bestMatchedSong = null

  for (const candidate of strictCandidates.slice(0, 6)) {
    const normalized = normalizeCandidate(candidate, song, playlist)
    const resolved = await resolveSongUrl(normalized)

    if (!bestMatchedSong) {
      bestMatchedSong = resolved
    }

    if (resolved.audioUrl) {
      return resolved
    }
  }

  return {
    ...(bestMatchedSong || buildUnavailableSong(song, playlist, 'strict-match-no-playable-url')),
    audioUrl: '',
    source: bestMatchedSong ? `${bestMatchedSong.source}-no-playable-exact` : 'strict-match-no-playable-url',
  }
}

export async function buildPlayableSongs(playlist, count = 5) {
  const picked = [...playlist.fallbackSongs]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)

  return Promise.all(
    picked.map(async (song) => {
      try {
        return await searchSong(song, playlist)
      } catch (error) {
        return buildUnavailableSong(song, playlist)
      }
    }),
  )
}
