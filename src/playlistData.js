export const playlists = [
  {
    id: 1,
    dissid: '8670100374',
    name: '光和枯树',
    url: 'https://y.qq.com/n/ryqq/playlist/8670100374',
    description: '温暖的光与静谧的树，适合安静思考的时光',
    icon: '☀️',
  },
  {
    id: 2,
    dissid: '8667064202',
    name: '雨和屋檐',
    url: 'https://y.qq.com/n/ryqq/playlist/8667064202',
    description: '雨声与屋檐的对话，适合雨天聆听的旋律',
    icon: '🌧️',
  },
  {
    id: 3,
    dissid: '8667059995',
    name: '风和草地',
    url: 'https://y.qq.com/n/ryqq/playlist/8667059995',
    description: '风与草地的交响，适合户外漫步的节奏',
    icon: '🌬️',
  },
];

export function pickRandomSongs(songs, count = 5) {
  const shuffled = [...songs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
