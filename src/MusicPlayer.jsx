import React, { useEffect, useMemo, useRef, useState } from 'react'
import './MusicPlayer.css'
import { playlists as importedPlaylists } from './playlistData'
import { buildPlayableSongs } from './simpleMusicService'

const playlists = importedPlaylists

const playlistImages = {
  '光和枯树': 'images/光和枯树.jpg',
  '雨和屋檐': 'images/雨和屋檐.jpg',
  '风和草地': 'images/风和草地.jpg',
}

const MusicPlayer = () => {
  const [randomSongs, setRandomSongs] = useState({})
  const [playlistErrors, setPlaylistErrors] = useState({})
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef(null)

  const playlistMap = useMemo(() => (
    playlists.reduce((acc, playlist) => {
      acc[playlist.id] = playlist
      return acc
    }, {})
  ), [])

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }

  const loadPlaylists = async () => {
    setIsLoading(true)
    const nextSongs = {}
    const nextErrors = {}

    await Promise.all(playlists.map(async (playlist) => {
      try {
        const songs = await buildPlayableSongs(playlist, 5)
        const playableCount = songs.filter((item) => item.audioUrl).length
        nextSongs[playlist.id] = songs
        if (playableCount === 0) {
          nextErrors[playlist.id] = '已匹配歌曲信息，但当前批次未拿到可播放音源'
        }
      } catch (error) {
        nextSongs[playlist.id] = []
        nextErrors[playlist.id] = error.message || '歌单装载失败'
      }
    }))

    setRandomSongs(nextSongs)
    setPlaylistErrors(nextErrors)
    setIsLoading(false)
  }

  useEffect(() => {
    loadPlaylists()
    return () => stopCurrentAudio()
  }, [])

  const playSong = async (song) => {
    if (!song.audioUrl) {
      return
    }

    const isSameSong = currentSong && currentSong.localKey === song.localKey

    if (isSameSong && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          setIsPlaying(false)
        }
      }
      return
    }

    stopCurrentAudio()

    try {
      const audio = new Audio(song.audioUrl)
      audio.preload = 'none'
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => setIsPlaying(false)
      audioRef.current = audio
      setCurrentSong(song)
      setShowPlayer(true)
      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      setIsPlaying(false)
    }
  }

  const togglePlay = async () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }
    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      setIsPlaying(false)
    }
  }

  const closePlayer = () => {
    stopCurrentAudio()
    setShowPlayer(false)
    setIsPlaying(false)
    setCurrentSong(null)
  }

  return (
    <>
      <div className="music-player">
        {isLoading ? (
          <div className="music-loading">
            <div className="music-loading-spinner"></div>
            <p>正在准备音乐数据...</p>
            <p className="music-loading-hint">正在检索歌曲信息与可播放链接</p>
          </div>
        ) : (
          <div className="music-cards-container">
            {playlists.map((playlist, index) => (
              <div
                key={playlist.id}
                className="music-card music-card-float"
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                <div className="music-card-header">
                  <div
                    className="music-card-background"
                    style={{ backgroundImage: `url(${playlistImages[playlist.name]})` }}
                  >
                    <div className="music-card-overlay">
                      <h3>{playlist.name}</h3>
                      <p>{playlist.description}</p>
                    </div>
                  </div>
                </div>

                {playlistErrors[playlist.id] && (
                  <div className="music-fetch-warning">{playlistErrors[playlist.id]}</div>
                )}

                <div className="music-playlist-songs">
                  {(randomSongs[playlist.id] || []).map((song) => {
                    const isCurrent = currentSong && currentSong.localKey === song.localKey
                    return (
                      <div
                        key={song.localKey}
                        className={`music-song-item ${isCurrent ? 'music-song-item-playing' : ''} ${song.audioUrl ? '' : 'music-song-item-disabled'}`}
                        onClick={() => playSong(song)}
                        role="button"
                        tabIndex={song.audioUrl ? 0 : -1}
                      >
                        <div className="music-song-cover">
                          <img src={song.cover} alt={`${song.title} cover`} className="music-song-cover-img" loading="lazy" />
                        </div>
                        <div className="music-song-info">
                          <div className="music-song-title">
                            {song.title}
                            {isCurrent && isPlaying && <span className="music-song-playing-indicator">●</span>}
                          </div>
                          <div className="music-song-artist">{song.artist}</div>
                          <div className="music-song-album">{song.album || '未知专辑'}</div>
                          {!song.audioUrl && <div className="music-song-unavailable">当前歌曲暂无可用音源</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <a className="music-card-btn" href={playlist.url} target="_blank" rel="noreferrer">
                  查看完整歌单
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPlayer && currentSong && (
        <div className="music-fixed-player">
          <div className="music-player-container">
            <div className="music-player-info">
              <div className="music-player-cover">
                <img src={currentSong.cover} alt={currentSong.title} />
              </div>
              <div className="music-player-details">
                <div className="music-player-title">{currentSong.title}</div>
                <div className="music-player-artist">{currentSong.artist}</div>
                <div className="music-player-playlist">
                  {playlistMap[currentSong.playlistId]?.name || currentSong.playlistName}
                </div>
              </div>
            </div>
            <div className="music-player-controls">
              <button type="button" className="music-player-control-btn" onClick={togglePlay}>
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <button type="button" className="music-player-control-btn music-player-close-btn" onClick={closePlayer}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MusicPlayer
