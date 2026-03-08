import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css';
import { playlists as importedPlaylists, getRandomSongs } from './playlistData';
import { enhanceSongsReal, testRealConnection } from './realMusicAlgerService';

// 使用导入的歌单数据
const playlists = importedPlaylists;

// 歌单图片映射
const playlistImages = {
    "光和枯树": "images/光和枯树.jpg",
    "雨和屋檐": "images/雨和屋檐.jpg", 
    "风和草地": "images/风和草地.jpg"
};

const MusicPlayer = () => {
    const [randomSongs, setRandomSongs] = useState({});
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const audioRef = useRef(null);
    const shouldPlayAfterLoad = useRef(false);

    // 初始化随机歌曲
    useEffect(() => {
        const initializeSongs = async () => {
            console.log('初始化歌曲数据...');
            setIsLoading(true);
            
            try {
                // 测试真实网站连接
                const connectionTest = await testRealConnection();
                console.log('真实网站连接测试:', connectionTest);
                
                const newRandomSongs = {};
                
                for (const playlist of playlists) {
                    const randomSongs = getRandomSongs(playlist.songs, 5);
                    
                    try {
                        // 使用真实的 music.alger.fun 服务增强歌曲数据
                        console.log(`=== 处理歌单 "${playlist.name}"，${randomSongs.length} 首歌曲 ===`);
                        const enhancedSongs = await enhanceSongsReal(randomSongs);
                        newRandomSongs[playlist.id] = enhancedSongs;
                        
                        // 记录处理结果
                        console.log(`歌单 "${playlist.name}" 处理完成:`);
                        enhancedSongs.forEach(song => {
                            console.log(`  🎵 "${song.title}" - ${song.artist}`);
                            console.log(`    封面: ${song.cover?.substring(0, 80)}...`);
                            console.log(`    音频: ${song.audioUrl?.substring(0, 80)}...`);
                            console.log(`    来源: ${song.source}`);
                        });
                    } catch (error) {
                        console.error(`处理歌单 "${playlist.name}" 失败:`, error);
                        // 使用基础数据作为回退
                        newRandomSongs[playlist.id] = randomSongs.map(song => ({
                            ...song,
                            cover: `https://picsum.photos/300/300?image=${song.id + 500}`,
                            audioUrl: getReliableAudioUrl(song),
                            source: 'fallback (处理失败)'
                        }));
                    }
                    
                    // 添加延迟避免请求过快
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                setRandomSongs(newRandomSongs);
                console.log('歌曲数据初始化完成');
            } catch (error) {
                console.error('初始化歌曲数据失败:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        initializeSongs();
    }, []);

    // 刷新随机歌曲
    const refreshSongs = async () => {
        console.log('刷新歌曲数据...');
        
        const newRandomSongs = {};
        
        for (const playlist of playlists) {
            const randomSongs = getRandomSongs(playlist.songs, 5);
            
            try {
                // 使用真实的 music.alger.fun 服务增强歌曲数据
                console.log(`刷新歌单 "${playlist.name}"`);
                const enhancedSongs = await enhanceSongsReal(randomSongs);
                newRandomSongs[playlist.id] = enhancedSongs;
            } catch (error) {
                console.error(`刷新歌单 "${playlist.name}" 失败:`, error);
                // 使用基础数据作为回退
                newRandomSongs[playlist.id] = randomSongs.map(song => ({
                    ...song,
                    cover: `https://picsum.photos/300/300?image=${song.id + 600}`,
                    audioUrl: getReliableAudioUrl(song),
                    source: 'fallback (刷新失败)'
                }));
            }
        }
        
        setRandomSongs(newRandomSongs);
        console.log('歌曲数据刷新完成');
    };

    // 播放歌曲
    const playSong = (song) => {
        console.log('播放歌曲:', song);
        console.log('音频URL:', song.audioUrl);
        
        // 如果是同一首歌，切换播放状态
        if (currentSong && currentSong.id === song.id && currentSong.playlistId === song.playlistId) {
            console.log('同一首歌，切换播放状态');
            if (isPlaying) {
                console.log('暂停播放');
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                setIsPlaying(false);
            } else {
                console.log('继续播放');
                // 确保音频元素存在
                if (!audioRef.current) {
                    console.log('音频元素不存在，重新创建');
                    createAudioElement(currentSong);
                }
                
                // 等待音频就绪后再播放
                if (audioRef.current && audioRef.current.readyState >= 2) {
                    audioRef.current.play().catch(e => {
                        // 忽略AbortError，这是正常的竞争条件
                        if (e.name !== 'AbortError') {
                            console.error('播放失败:', e);
                            console.error('错误详情:', e.message);
                        }
                        setIsPlaying(false);
                    });
                    setIsPlaying(true);
                } else {
                    console.log('音频未就绪，等待加载');
                    // 设置标志，在canplay事件中播放
                    shouldPlayAfterLoad.current = true;
                    setIsPlaying(true);
                }
            }
        } else {
            console.log('新歌曲，开始播放');
            // 新歌曲，设置并播放
            setCurrentSong(song);
            setIsPlaying(true);
            setShowPlayer(true);
            
            // 创建新的音频元素
            createAudioElement(song);
        }
    };

    // 创建音频元素
    const createAudioElement = (song) => {
        console.log('创建音频元素，URL:', song.audioUrl);
        
        // 清理旧的音频元素
        if (audioRef.current) {
            console.log('清理旧的音频元素');
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        
        // 创建新的音频元素
        const audio = new Audio();
        audioRef.current = audio;
        
        // 设置音频源
        audio.src = song.audioUrl;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        
        // 重置播放标志
        shouldPlayAfterLoad.current = false;
        
        // 添加事件监听
        audio.oncanplay = () => {
            console.log('音频加载完成，可以播放');
            console.log('音频源:', audio.src);
            console.log('音频就绪状态:', audio.readyState);
            console.log('音频时长:', audio.duration);
            
            // 如果设置了播放标志，开始播放
            if (shouldPlayAfterLoad.current && isPlaying) {
                console.log('音频就绪，开始播放');
                audio.play().catch(e => {
                    // 忽略AbortError
                    if (e.name !== 'AbortError') {
                        console.error('播放失败:', e);
                        console.error('错误详情:', e.message);
                    }
                    setIsPlaying(false);
                });
                shouldPlayAfterLoad.current = false;
            }
        };
        
        audio.onerror = (e) => {
            console.error('音频加载错误');
            console.error('错误目标:', e.target);
            console.error('错误代码:', audio.error?.code);
            console.error('错误信息:', audio.error?.message);
            console.error('音频源URL:', audio.src);
            setIsPlaying(false);
            shouldPlayAfterLoad.current = false;
        };
        
        audio.onloadeddata = () => {
            console.log('音频数据已加载');
            console.log('音频格式支持:', audio.canPlayType('audio/mpeg'));
        };
        
        audio.onstalled = () => {
            console.warn('音频加载停滞');
        };
        
        audio.onpause = () => {
            console.log('音频暂停');
            shouldPlayAfterLoad.current = false;
        };
        
        // 如果音频已经可以播放，立即尝试播放
        if (audio.readyState >= 2 && isPlaying) {
            console.log('音频已就绪，立即播放');
            audio.play().catch(e => {
                if (e.name !== 'AbortError') {
                    console.error('立即播放失败:', e);
                }
                setIsPlaying(false);
            });
        } else if (isPlaying) {
            // 设置标志，等待加载完成
            console.log('等待音频加载完成');
            shouldPlayAfterLoad.current = true;
        }
    };

    // 暂停/播放
    const togglePlay = () => {
        if (!currentSong) {
            console.error('无法播放: 没有当前歌曲');
            return;
        }
        
        if (isPlaying) {
            console.log('暂停播放');
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
            shouldPlayAfterLoad.current = false;
        } else {
            console.log('开始播放');
            
            // 确保音频元素存在
            if (!audioRef.current) {
                console.log('音频元素不存在，重新创建');
                createAudioElement(currentSong);
                return;
            }
            
            // 检查音频就绪状态
            if (audioRef.current.readyState >= 2) {
                console.log('音频已就绪，立即播放');
                audioRef.current.play().catch(e => {
                    // 忽略AbortError
                    if (e.name !== 'AbortError') {
                        console.error('播放失败:', e);
                        console.error('错误详情:', e.message);
                    }
                    setIsPlaying(false);
                });
                setIsPlaying(true);
            } else {
                console.log('音频未就绪，等待加载');
                shouldPlayAfterLoad.current = true;
                setIsPlaying(true);
            }
        }
    };

    // 关闭播放器
    const closePlayer = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        console.log('关闭播放器');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            // 清理音频元素
            audioRef.current = null;
        }
        shouldPlayAfterLoad.current = false;
        setShowPlayer(false);
        setIsPlaying(false);
        setCurrentSong(null);
    };

    // 处理音频结束
    const handleAudioEnd = () => {
        console.log('音频播放结束');
        setIsPlaying(false);
        shouldPlayAfterLoad.current = false;
    };

    // 组件卸载时清理资源
    useEffect(() => {
        return () => {
            console.log('组件卸载，清理音频资源');
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            shouldPlayAfterLoad.current = false;
        };
    }, []);

    // 获取可靠的音频URL
    const getReliableAudioUrl = (song) => {
        // 使用经过测试的可靠音频源
        const reliableAudioUrls = [
            // SoundHelix - 明确允许使用的示例音乐
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
            // 备用音频源
            "https://cdn.pixabay.com/download/audio/2022/03/10/audio_2c8a37f637.mp3?filename=ambient-piano-amp-strings-10711.mp3",
            "https://cdn.pixabay.com/download/audio/2022/03/10/audio_2c8a37f638.mp3?filename=cinematic-trailer-amp- logo-10711.mp3"
        ];
        
        // 基于歌曲信息生成唯一索引
        const hash = simpleHashForAudio(`${song.id}-${song.title}`);
        const index = hash % reliableAudioUrls.length;
        const audioUrl = reliableAudioUrls[index];
        
        console.log(`回退音频URL for "${song.title}": ${audioUrl} (索引: ${index})`);
        return audioUrl;
    };

    // 简单的音频哈希函数
    const simpleHashForAudio = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    };

    // 键盘快捷键
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showPlayer || !currentSong) return;
            
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'Escape':
                    closePlayer();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showPlayer, currentSong, isPlaying]);

    return (
        <>
            <div className="music-player">
                {isLoading ? (
                    <div className="music-loading">
                        <div className="music-loading-spinner"></div>
                        <p>正在从 music.alger.fun 实时搜索歌曲数据...</p>
                        <p className="music-loading-hint">正在根据歌曲名搜索真实封面和音频，这可能需要一些时间</p>
                        <p className="music-loading-hint">请保持网络连接并打开控制台查看详细进度</p>
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
                                        backgroundSize: '100% auto',  // 宽度100%，高度自适应，左右全占满
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        borderRadius: '12px 12px 0 0',
                                        height: '120px',
                                        position: 'relative',
                                        width: '100%'
                                    }}
                                >
                                    <div className="music-card-overlay">
                                        <h3>{playlist.name}</h3>
                                        <p>{playlist.description}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="music-playlist-songs">
                                {randomSongs[playlist.id]?.map((song, songIndex) => {
                                    const isCurrent = currentSong && 
                                        currentSong.id === song.id && 
                                        currentSong.playlistId === playlist.id;
                                    
                                    return (
                                        <div 
                                            key={song.id} 
                                            className={`music-song-item ${isCurrent ? 'music-song-item-playing' : ''}`}
                                            onClick={() => playSong({
                                                ...song,
                                                playlistId: playlist.id,
                                                playlistName: playlist.name
                                            })}
                                        >
                                            <div className="music-song-cover">
                                                {song.cover ? (
                                                    <div className="music-song-cover-wrapper">
                                                        <div className="music-song-cover-skeleton"></div>
                                                        <img 
                                                            src={song.cover} 
                                                            alt={`${song.title} - ${song.artist}`}
                                                            className="music-song-cover-img"
                                                            loading="lazy"  // 懒加载
                                                            onLoad={(e) => {
                                                                e.target.style.opacity = '1';
                                                                e.target.previousElementSibling.style.display = 'none';
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.previousElementSibling.style.display = 'none';
                                                                e.target.parentElement.nextElementSibling.style.display = 'flex';
                                                            }}
                                                            style={{opacity: 0, transition: 'opacity 0.3s ease'}}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span>🎵</span>
                                                )}
                                                <div className="music-song-cover-fallback" style={{display: 'none'}}>
                                                    <span>🎵</span>
                                                </div>
                                            </div>
                                            <div className="music-song-info">
                                                <div className="music-song-title">
                                                    {song.title}
                                                    {isCurrent && isPlaying && (
                                                        <span className="music-song-playing-indicator">▶️</span>
                                                    )}
                                                    {song.source && (
                                                        <span className={`music-song-source ${song.source.includes('真实') ? 'music-song-source-music-alger' : 'music-song-source-fallback'}`}>
                                                            {song.source.includes('真实') ? '🌐 真实数据' : '🔄 回退数据'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="music-song-artist">{song.artist}</div>
                                                <div className="music-song-album">{song.album}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <a 
                                href={playlist.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="music-card-btn"
                            >
                                查看完整歌单
                            </a>
                        </div>
                    ))}
                </div>
                )}
            </div>

            {/* 固定播放控件 */}
            {showPlayer && currentSong && (
                <div className="music-fixed-player">
                    <div className="music-player-container">
                        <div className="music-player-info">
                            <div className="music-player-cover">
                                <img 
                                    src={currentSong.cover || 'https://via.placeholder.com/50/667eea/ffffff?text=🎵'} 
                                    alt={`${currentSong.title} - ${currentSong.artist}`}
                                />
                            </div>
                            <div className="music-player-details">
                                <div className="music-player-title">{currentSong.title}</div>
                                <div className="music-player-artist">{currentSong.artist}</div>
                                <div className="music-player-playlist">来自: {currentSong.playlistName}</div>
                            </div>
                        </div>
                        
                        <div className="music-player-controls">
                            <button 
                                className="music-player-control-btn"
                                onClick={togglePlay}
                                aria-label={isPlaying ? '暂停' : '播放'}
                            >
                                {isPlaying ? '⏸️' : '▶️'}
                            </button>
                            <button 
                                className="music-player-control-btn music-player-close-btn"
                                onClick={closePlayer}
                                aria-label="关闭"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    
                    {/* 音频元素现在动态创建和管理 */}
                </div>
            )}

            {/* 音频可视化占位 - 未来扩展 */}
            {showPlayer && (
                <div className="music-visualizer-placeholder">
                    <div className="music-visualizer-bar"></div>
                    <div className="music-visualizer-bar"></div>
                    <div className="music-visualizer-bar"></div>
                    <div className="music-visualizer-bar"></div>
                    <div className="music-visualizer-bar"></div>
                </div>
            )}
        </>
    );
};

export default MusicPlayer;