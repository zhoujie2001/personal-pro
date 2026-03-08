// 歌单数据
export const playlists = [
  {
    id: 1,
    name: "光和枯树",
    url: "https://y.qq.com/n3/other/pages/details/playlist.html?hosteuin=oK6soKoqNenP7z**&id=8670100374&appversion=200105&ADTAG=wxfshare&appshare=iphone_wx&redirecttag=mn.error.getInitialProps.timeout&mnst=502.28",
    description: "温暖的光与静谧的树，适合安静思考的时光",
    icon: "☀️",
    // 示例歌曲数据 - 实际项目中应该从API获取
    songs: [
      { id: 1, title: "光", artist: "陈粒", album: "如也" },
      { id: 2, title: "枯树", artist: "房东的猫", album: "柔软" },
      { id: 3, title: "树洞", artist: "许嵩", album: "青年晚报" },
      { id: 4, title: "光年之外", artist: "G.E.M.邓紫棋", album: "新的心跳" },
      { id: 5, title: "枯木逢春", artist: "枯木逢春", album: "亦是此间少年" }
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
      { id: 5, title: "屋檐下的思念", artist: "汪苏泷", album: "传世乐章" }
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
      { id: 5, title: "草原之夜", artist: "刀郎", album: "2002年的第一场雪" }
    ]
  }
];

// 随机选择5首歌曲
export function getRandomSongs(songs, count = 5) {
  const shuffled = [...songs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}