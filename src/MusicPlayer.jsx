import React, { useState, useEffect } from 'react';
import './MusicPlayer.css';

// 歌单数据
const playlists = [
    {
        id: 1,
        name: "光和枯树",
        url: "https://y.qq.com/n3/other/pages/details/playlist.html?hosteuin=oK6soKoqNenP7z**&id=8670100374&appversion=200105&ADTAG=wxfshare&appshare=iphone_wx&redirecttag=mn.error.getInitialProps.timeout&mnst=502.28",
        description: "温暖的光与静谧的树，适合安静思考的时光",
        icon: "☀️",
        songs: [
            { id: 1, title: "光", artist: "陈粒", album: "如也" },
            { id: 2, title: "枯树", artist: "房东的猫", album: "柔软" },
            { id: 3, title: "树洞", artist: "许嵩", album: "青年晚报" },
            { id: 4, title: "光年之外", artist: "G.E.M.邓紫棋", album: "新的心跳" },
            { id: 5, title: "枯木逢春", artist: "枯木逢春", album: "亦是此间少年" },
            { id: 6, title: "追光者", artist: "岑宁儿", album: "夏至未至" },
            { id: 7, title: "光之翼", artist: "王菲", album: "光之翼" },
            { id: 8, title: "树读", artist: "王俊凯", album: "树读" },
            { id: 9, title: "光合作用", artist: "房东的猫", album: "柔软" },
            { id: 10, title: "光晕", artist: "周深", album: "深的深" }
        ]
    },
    {
        id: 2,
        name: "雨和屋檐",
        url: "https://i2.y.qq.com/n3/other/pages/details/playlist.html?hosteuin=oK6soKoqNenP7z**&id=8667064202&appversion=200105&ADTAG=wxfshare&appshare=iphone_wx",
        description: "雨声与屋檐的对话，适合雨天聆听的旋律",
        icon: "🌧️",
        songs: [
            { id: 1, title: "雨爱", artist: "杨丞琳", album: "Rainie & Love...?" },
            { id: 2, title: "屋檐", artist: "周杰伦", album: "七里香" },
            { id: 3, title: "下雨天", artist: "南拳妈妈", album: "优の良曲 南搞小孩" },
            { id: 4, title: "雨下一整晚", artist: "周杰伦", album: "跨时代" },
            { id: 5, title: "屋檐下的思念", artist: "汪苏泷", album: "传世乐章" },
            { id: 6, title: "雨天", artist: "孙燕姿", album: "My Story, Your Song" },
            { id: 7, title: "雨一直下", artist: "张宇", album: "雨一直下" },
            { id: 8, title: "六月的雨", artist: "胡歌", album: "仙剑奇侠传" },
            { id: 9, title: "听见下雨的声音", artist: "周杰伦", album: "哎呦，不错哦" },
            { id: 10, title: "雨蝶", artist: "李翊君", album: "还珠格格" }
        ]
    },
    {
        id: 3,
        name: "风和草地",
        url: "https://i2.y.qq.com/n3/other/pages/details/playlist.html?hosteuin=oK6soKoqNenP7z**&id=8667059995&appversion=200105&ADTAG=wxfshare&appshare=iphone_wx",
        description: "风与草地的交响，适合户外漫步的节奏",
        icon: "🌬️",
        songs: [
            { id: 1, title: "风", artist: "张杰", album: "爱，不解释" },
            { id: 2, title: "风吹麦浪", artist: "李健", album: "想念你" },
            { id: 3, title: "草", artist: "陈奕迅", album: "上五楼的快活" },
            { id: 4, title: "风中有朵雨做的云", artist: "孟庭苇", album: "风中有朵雨做的云" },
            { id: 5, title: "草原之夜", artist: "刀郎", album: "2002年的第一场雪" },
            { id: 6, title: "风继续吹", artist: "张国荣", album: "风继续吹" },
            { id: 7, title: "野子", artist: "苏运莹", album: "野子" },
            { id: 8, title: "风吹草动", artist: "林志炫", album: "散了吧" },
            { id: 9, title: "风之彩", artist: "范晓萱", album: "小魔女的魔法书" },
            { id: 10, title: "草原上升起不落的太阳", artist: "吴雁泽", album: "经典民歌" }
        ]
    }
];

// 随机选择歌曲
const getRandomSongs = (songs, count = 5) => {
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// 获取封面颜色类名
const getCoverColorClass = (index) => {
    const colors = [
        'music-song-cover-color-0',
        'music-song-cover-color-1',
        'music-song-cover-color-2',
        'music-song-cover-color-3',
        'music-song-cover-color-4'
    ];
    return colors[index % colors.length];
};

const MusicPlayer = () => {
    const [randomSongs, setRandomSongs] = useState({});

    // 初始化随机歌曲
    useEffect(() => {
        const newRandomSongs = {};
        playlists.forEach(playlist => {
            newRandomSongs[playlist.id] = getRandomSongs(playlist.songs, 5);
        });
        setRandomSongs(newRandomSongs);
    }, []);

    // 刷新随机歌曲
    const refreshSongs = () => {
        const newRandomSongs = {};
        playlists.forEach(playlist => {
            newRandomSongs[playlist.id] = getRandomSongs(playlist.songs, 5);
        });
        setRandomSongs(newRandomSongs);
    };

    return (
        <div className="music-player">
            <div className="music-player-title">
                <h2>🎵 音乐播放器</h2>
                <p>三个歌单卡片并列 + 浮动动画效果 | 每次刷新随机显示5首歌</p>
            </div>

            <div className="music-cards-container">
                {playlists.map((playlist, index) => (
                    <div 
                        key={playlist.id} 
                        className="music-card music-card-float"
                        style={{ animationDelay: `${index * 0.5}s` }}
                    >
                        <div className="music-card-icon">
                            {playlist.icon}
                        </div>
                        
                        <h3>{playlist.name}</h3>
                        <p>{playlist.description}</p>
                        
                        <div className="music-playlist-songs">
                            {randomSongs[playlist.id]?.map((song, songIndex) => (
                                <div key={song.id} className="music-song-item">
                                    <div className={`music-song-cover ${getCoverColorClass(songIndex)}`}>
                                        <span>🎵</span>
                                    </div>
                                    <div className="music-song-info">
                                        <div className="music-song-title">{song.title}</div>
                                        <div className="music-song-artist">{song.artist}</div>
                                        <div className="music-song-album">{song.album}</div>
                                    </div>
                                </div>
                            ))}
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

            <div className="music-status">
                <p>
                    页面已加载 | 三个卡片并列显示 ✅ | 卡片浮动动画 ✅ | 随机歌曲显示 ✅
                    <button 
                        onClick={refreshSongs}
                        style={{
                            marginLeft: '15px',
                            padding: '5px 15px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        刷新歌曲
                    </button>
                </p>
            </div>
        </div>
    );
};

export default MusicPlayer;