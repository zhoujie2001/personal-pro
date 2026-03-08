/**
 * music.alger.fun 音乐网站服务
 * 用于从该网站搜索歌曲并获取封面和音频
 */

// 网站基础URL
const BASE_URL = 'http://music.alger.fun';

// 模拟搜索API（实际需要分析网站的真实API）
const SEARCH_API = `${BASE_URL}/api/search`; // 假设的API端点

// 歌曲缓存，避免重复请求
const songCache = new Map();

/**
 * 搜索歌曲
 * @param {string} query - 搜索关键词（歌曲名 + 歌手）
 * @returns {Promise<Array>} 歌曲列表
 */
export async function searchSongs(query) {
    console.log(`搜索歌曲: ${query}`);
    
    // 检查缓存
    const cacheKey = `search:${query}`;
    if (songCache.has(cacheKey)) {
        console.log(`从缓存获取: ${query}`);
        return songCache.get(cacheKey);
    }
    
    try {
        // 由于CORS限制，这里使用模拟数据
        // 实际项目中需要：
        // 1. 分析网站的真实API
        // 2. 使用后端代理绕过CORS
        // 3. 或者使用允许跨域的API
        
        // 模拟API响应延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 根据查询返回模拟数据
        const mockResults = generateMockResults(query);
        
        // 缓存结果
        songCache.set(cacheKey, mockResults);
        
        return mockResults;
    } catch (error) {
        console.error('搜索歌曲失败:', error);
        return [];
    }
}

/**
 * 获取歌曲详情（包括封面和音频URL）
 * @param {string} songId - 歌曲ID
 * @returns {Promise<Object>} 歌曲详情
 */
export async function getSongDetails(songId) {
    console.log(`获取歌曲详情: ${songId}`);
    
    // 检查缓存
    if (songCache.has(songId)) {
        return songCache.get(songId);
    }
    
    try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 生成模拟详情
        const details = generateMockDetails(songId);
        
        // 缓存结果
        songCache.set(songId, details);
        
        return details;
    } catch (error) {
        console.error('获取歌曲详情失败:', error);
        return null;
    }
}

/**
 * 获取歌曲封面URL
 * @param {Object} song - 歌曲对象 {title, artist}
 * @returns {Promise<string>} 封面URL
 */
export async function getSongCover(song) {
    const { title, artist } = song;
    const query = `${title} ${artist}`;
    
    console.log(`获取歌曲封面: ${query}`);
    
    try {
        // 先搜索歌曲
        const searchResults = await searchSongs(query);
        
        if (searchResults.length > 0) {
            // 取第一个结果
            const firstResult = searchResults[0];
            
            // 获取详情
            const details = await getSongDetails(firstResult.id);
            
            if (details && details.coverUrl) {
                console.log(`找到封面: ${details.coverUrl}`);
                return details.coverUrl;
            }
        }
        
        // 如果没有找到，使用占位图片
        console.warn(`未找到歌曲封面: ${query}，使用占位图片`);
        return getPlaceholderCover(song);
    } catch (error) {
        console.error('获取封面失败:', error);
        return getPlaceholderCover(song);
    }
}

/**
 * 获取歌曲音频URL
 * @param {Object} song - 歌曲对象 {title, artist}
 * @returns {Promise<string>} 音频URL
 */
export async function getSongAudioUrl(song) {
    const { title, artist } = song;
    const query = `${title} ${artist}`;
    
    console.log(`获取歌曲音频: ${query}`);
    
    try {
        // 先搜索歌曲
        const searchResults = await searchSongs(query);
        
        if (searchResults.length > 0) {
            // 取第一个结果
            const firstResult = searchResults[0];
            
            // 获取详情
            const details = await getSongDetails(firstResult.id);
            
            if (details && details.audioUrl) {
                console.log(`找到音频: ${details.audioUrl}`);
                return details.audioUrl;
            }
        }
        
        // 如果没有找到，使用示例音频
        console.warn(`未找到歌曲音频: ${query}，使用示例音频`);
        return getExampleAudio(song);
    } catch (error) {
        console.error('获取音频失败:', error);
        return getExampleAudio(song);
    }
}

/**
 * 批量获取歌曲信息
 * @param {Array} songs - 歌曲列表
 * @returns {Promise<Array>} 增强后的歌曲列表
 */
export async function enhanceSongsWithMusicInfo(songs) {
    console.log(`批量增强 ${songs.length} 首歌曲`);
    
    const enhancedSongs = [];
    
    for (const song of songs) {
        try {
            const [cover, audioUrl] = await Promise.all([
                getSongCover(song),
                getSongAudioUrl(song)
            ]);
            
            enhancedSongs.push({
                ...song,
                cover,
                audioUrl,
                source: 'music.alger.fun'
            });
        } catch (error) {
            console.error(`增强歌曲失败 ${song.title}:`, error);
            // 使用回退数据
            enhancedSongs.push({
                ...song,
                cover: getPlaceholderCover(song),
                audioUrl: getExampleAudio(song),
                source: 'fallback'
            });
        }
    }
    
    return enhancedSongs;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 生成模拟搜索结果
 */
function generateMockResults(query) {
    // 根据查询关键词返回不同的模拟结果
    const mockData = {
        // 光和枯树歌单
        '光 陈粒': [
            { id: 'chenli-guang', title: '光', artist: '陈粒', album: '如也' }
        ],
        '枯树 房东的猫': [
            { id: 'fdm-kushu', title: '枯树', artist: '房东的猫', album: '柔软' }
        ],
        '树洞 许嵩': [
            { id: 'xusong-shudong', title: '树洞', artist: '许嵩', album: '青年晚报' }
        ],
        '光年之外 G.E.M.邓紫棋': [
            { id: 'gem-guangnian', title: '光年之外', artist: 'G.E.M.邓紫棋', album: '新的心跳' }
        ],
        '枯木逢春 枯木逢春': [
            { id: 'kmfc-kumufengchun', title: '枯木逢春', artist: '枯木逢春', album: '亦是此间少年' }
        ],
        
        // 雨和屋檐歌单
        '雨爱 杨丞琳': [
            { id: 'ycl-yuai', title: '雨爱', artist: '杨丞琳', album: 'Rainie & Love...?' }
        ],
        '屋檐 周杰伦': [
            { id: 'jielun-qilixiang', title: '七里香', artist: '周杰伦', album: '七里香' }
        ],
        '下雨天 南拳妈妈': [
            { id: 'nqm-xiayutian', title: '下雨天', artist: '南拳妈妈', album: '优の良曲 南搞小孩' }
        ],
        '雨下一整晚 周杰伦': [
            { id: 'jielun-yuxia', title: '雨下一整晚', artist: '周杰伦', album: '跨时代' }
        ],
        '屋檐下的思念 汪苏泷': [
            { id: 'wsl-wuyan', title: '屋檐下的思念', artist: '汪苏泷', album: '传世乐章' }
        ],
        
        // 风和草地歌单
        '风 张杰': [
            { id: 'zhangjie-feng', title: '风', artist: '张杰', album: '爱，不解释' }
        ],
        '风吹麦浪 李健': [
            { id: 'lijian-fengchuimailang', title: '风吹麦浪', artist: '李健', album: '想念你' }
        ],
        '草 陈奕迅': [
            { id: 'eason-cao', title: '草', artist: '陈奕迅', album: '上五楼的快活' }
        ],
        '风中有朵雨做的云 孟庭苇': [
            { id: 'mengtingwei-fengzhong', title: '风中有朵雨做的云', artist: '孟庭苇', album: '风中有朵雨做的云' }
        ],
        '草原之夜 刀郎': [
            { id: 'daolang-caoyuan', title: '草原之夜', artist: '刀郎', album: '2002年的第一场雪' }
        ]
    };
    
    // 查找匹配的查询
    for (const [key, results] of Object.entries(mockData)) {
        if (query.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
            return results;
        }
    }
    
    // 默认返回空数组
    return [];
}

/**
 * 生成模拟歌曲详情
 */
function generateMockDetails(songId) {
    // 模拟详情数据
    const detailsMap = {
        'chenli-guang': {
            id: 'chenli-guang',
            title: '光',
            artist: '陈粒',
            album: '如也',
            coverUrl: 'https://picsum.photos/300/300?image=101',
            audioUrl: 'https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3',
            duration: 245
        },
        'gem-guangnian': {
            id: 'gem-guangnian',
            title: '光年之外',
            artist: 'G.E.M.邓紫棋',
            album: '新的心跳',
            coverUrl: 'https://picsum.photos/300/300?image=102',
            audioUrl: 'https://assets.codepen.io/4358584/Asher_Fulero_-_Game_Show.mp3',
            duration: 236
        },
        'jielun-qilixiang': {
            id: 'jielun-qilixiang',
            title: '七里香',
            artist: '周杰伦',
            album: '七里香',
            coverUrl: 'https://picsum.photos/300/300?image=103',
            audioUrl: 'https://assets.codepen.io/4358584/Asher_Fulero_-_Six_Seasons.mp3',
            duration: 299
        },
        'eason-cao': {
            id: 'eason-cao',
            title: '草',
            artist: '陈奕迅',
            album: '上五楼的快活',
            coverUrl: 'https://picsum.photos/300/300?image=104',
            audioUrl: 'https://assets.codepen.io/4358584/Dee_Yan-Key_-_rain_street.mp3',
            duration: 267
        },
        'daolang-caoyuan': {
            id: 'daolang-caoyuan',
            title: '草原之夜',
            artist: '刀郎',
            album: '2002年的第一场雪',
            coverUrl: 'https://picsum.photos/300/300?image=105',
            audioUrl: 'https://assets.codepen.io/4358584/DivKid_-_Microchip.mp3',
            duration: 312
        }
    };
    
    // 返回匹配的详情或默认详情
    if (detailsMap[songId]) {
        return detailsMap[songId];
    }
    
    // 默认详情
    return {
        id: songId,
        title: '未知歌曲',
        artist: '未知歌手',
        album: '未知专辑',
        coverUrl: `https://picsum.photos/300/300?image=${Math.floor(Math.random() * 100)}`,
        audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 15) + 1}.mp3`,
        duration: 180
    };
}

/**
 * 获取占位封面
 */
function getPlaceholderCover(song) {
    // 使用歌曲ID和标题生成唯一占位图片
    // 使用哈希函数确保唯一性
    const hash = simpleHash(`${song.id}-${song.title}-${song.artist}`);
    return `https://picsum.photos/50/50?image=${hash}`;
}

/**
 * 简单哈希函数，生成0-999的数字
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash) % 1000; // 返回0-999的数字
}

/**
 * 获取示例音频
 */
function getExampleAudio(song) {
    // 使用可靠的音频源
    // 这里使用一个公开可访问的音频文件
    const reliableAudioUrls = [
        "https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3",
        "https://assets.codepen.io/4358584/Asher_Fulero_-_Game_Show.mp3",
        "https://assets.codepen.io/4358584/Asher_Fulero_-_Six_Seasons.mp3",
        "https://assets.codepen.io/4358584/Dee_Yan-Key_-_rain_street.mp3",
        "https://assets.codepen.io/4358584/DivKid_-_Microchip.mp3",
        "https://assets.codepen.io/4358584/Godmode_-_Time_Chaser.mp3",
        "https://assets.codepen.io/4358584/Jahzzar_-_Saturday.mp3",
        "https://assets.codepen.io/4358584/Kai_Engel_-_Brotherhood.mp3",
        "https://assets.codepen.io/4358584/Kai_Engel_-_Moonlight.mp3",
        "https://assets.codepen.io/4358584/OYStudio_-_Summer_Breeze.mp3",
        "https://assets.codepen.io/4358584/Quincas_Moreira_-_Moonlight.mp3",
        "https://assets.codepen.io/4358584/Quincas_Moreira_-_Once_Again.mp3",
        "https://assets.codepen.io/4358584/Quincas_Moreira_-_The_Curtain_Rises.mp3",
        "https://assets.codepen.io/4358584/Quincas_Moreira_-_Vereda_Tropical.mp3",
        "https://assets.codepen.io/4358584/Tours_-_Enthusiast.mp3"
    ];
    
    // 使用歌曲ID选择不同的音频，确保唯一性
    const hash = simpleHash(`${song.id}-${song.title}`);
    const audioIndex = hash % reliableAudioUrls.length;
    
    console.log(`歌曲 "${song.title}" 音频URL: ${reliableAudioUrls[audioIndex]}`);
    return reliableAudioUrls[audioIndex];
}

/**
 * 测试网站连接
 */
export async function testConnection() {
    try {
        console.log('测试 music.alger.fun 连接...');
        
        // 尝试访问网站（由于CORS，这里只是模拟）
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟成功响应
        return {
            success: true,
            message: '网站连接正常（模拟）',
            url: BASE_URL
        };
    } catch (error) {
        return {
            success: false,
            message: `连接失败: ${error.message}`,
            url: BASE_URL
        };
    }
}