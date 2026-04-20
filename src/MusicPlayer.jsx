import React, { useEffect, useMemo, useRef, useState } from 'react';
import './MusicPlayer.css';
import { playlists as importedPlaylists, pickRandomSongs } from './playlistData';
import { buildFallbackSongs, fetchPlaylistSongs } from './simpleMusicService';

const playlists = importedPlaylists;

const playlistImages = {
  光和枯树: 'images/光和枯树.jpg',
  雨和屋檐: 'images/雨和屋檐.jpg',
  风和草地: 'images/风和草地.jpg',
};

const MusicPlayer = () => {
  const [randomSongs, setRandomSongs] = useState({});
  const [playlistErrors, setPlaylistErrors] = useState({});
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef(null);

  const playlistMap = useMemo(() => (
    playlists.reduce((acc, playlist) => {
      acc[playlist.id] = playlist;
      return acc;
    }, {})
  ), []);

  const loadPlaylists = async () => {
    setIsLoading(true);
    const nextSongs = {};
    const nextErrors = {};

    await Promise.all(
      playlists.map(async (playlist) => {
        try {
          const songs = await fetchPlaylistSongs(playlist);
          nextSongs[playlist.id] = pickRandomSongs(songs, Math.min(5, songs.length));
        } catch (error) {
          nextSongs[playlist.id] = buildFallbackSongs(playlist, 5);
          nextErrors[playlist.id] = error.message || '真实歌单抓取失败';
        }
      })
    );

    setRandomSongs(nextSongs);
    setPlaylistErrors(nextErrors);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, []);

  const playSong = async (song) => {
    if (!song?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onerror = () => setIsPlaying(false);
    }

    const isSameSong = currentSong?.localKey === song.localKey;

    if (isSameSong) {
      if (audioRef.current.paused) {
        await audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
      return;
    }

    try {
      audioRef.current.pause();
      audioRef.current.src = song.audioUrl;
      audioRef.current.load();
      setCurrentSong(song);
      setShowPlayer(true);
      await audioRef.current.play();
    } catch (error) {
      console.error('播放失败', error);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentSong) return;
    if (audioRef.current.paused) {
      await audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setShowPlayer(false);
    setCurrentSong(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showPlayer || !currentSong) return;
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'Escape') {
        closePlayer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPlayer, currentSong]);

  return (
    <>
      <div className="music-player">
        {isLoading ? (
          <div className="music-loading">
            <div className="music-loading-spinner"></div>
            <p>正在抓取真实歌单数据...</p>
            <p className="music-loading-hint">已升级为 Serverless 代理方案，保持原有 UI 不变</p>
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
                    style={{
                      backgroundImage: `url(${playlistImages[playlist.name]})`,
                      backgroundSize: '100% auto',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: '12px 12px 0 0',
                      height: '120px',
                      position: 'relative',
                      width: '100%',
                    }}
                  >
                    <div className="music-card-overlay">
                      <h3>{playlist.name}</h3>
                      <p>{playlist.description}</p>
                    </div>
                  </div>
                </div>

                <div className="music-playlist-songs">
                  {(randomSongs[playlist.id] || []).map((song) => {
                    const isCurrent = currentSong?.localKey === song.localKey;
                    return (
                      <div
                        key={song.localKey}
                        className={`music-song-item ${isCurrent ? 'music-song-item-playing' : ''}`}
                        onClick={() => playSong(song)}
                      >
                        <div className="music-song-cover">
                          <div className="music-song-cover-wrapper">
                            <img className="music-song-cover-img" src={song.cover} alt={song.title} />
                          </div>
                        </div>
                        <div className="music-song-info">
                          <div className="music-song-title">
                            <span>{song.title}</span>
                            {isCurrent && isPlaying && <span className="music-song-playing-indicator">●</span>}
                          </div>
                          <div className="music-song-artist">{song.artist}</div>
                          <div className="music-song-album">
                            {song.album || '未知专辑'}
                            <span className={`music-song-source ${song.source === '回退音源' ? 'music-song-source-fallback' : 'music-song-source-music-alger'}`}>
                              {song.source}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {playlistErrors[playlist.id] && (
                  <div className="music-fetch-warning">当前歌单受 QQ 隐私或鉴权限制，已自动回退为占位播放。</div>
                )}

                <a className="music-card-btn" href={playlist.url} target="_blank" rel="noreferrer">
                  查看完整歌单
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPlayer && currentSong && (
        <>
          {isPlaying && (
            <div className="music-visualizer-placeholder">
              <span className="music-visualizer-bar"></span>
              <span className="music-visualizer-bar"></span>
              <span className="music-visualizer-bar"></span>
              <span className="music-visualizer-bar"></span>
              <span className="music-visualizer-bar"></span>
            </div>
          )}
          <div className="music-fixed-player">
            <div className="music-player-container">
              <div className="music-player-info">
                <div className="music-player-cover">
                  <img src={currentSong.cover} alt={currentSong.title} />
                </div>
                <div className="music-player-details">
                  <div className="music-player-title">{currentSong.title}</div>
                  <div className="music-player-artist">{currentSong.artist}</div>
                  <div className="music-player-playlist">{playlistMap[currentSong.playlistId]?.name || currentSong.playlistName}</div>
                </div>
              </div>
              <div className="music-player-controls">
                <button className="music-player-control-btn" onClick={togglePlay} aria-label="播放或暂停">
                  {isPlaying ? '❚❚' : '▶'}
                </button>
                <button className="music-player-control-btn music-player-close-btn" onClick={closePlayer} aria-label="关闭播放器">
                  ×
                </button>
              </div>
            </div>
            <div className="music-keyboard-hint">空格播放/暂停，Esc关闭</div>
          </div>
        </>
      )}
    </>
  );
};

export default MusicPlayer;
