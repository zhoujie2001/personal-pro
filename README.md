# Personal Pro - 个人网站

这是一个包含歌单板块的个人网站项目，基于React + Vite构建。

## 功能特点

- **关于我**：个人介绍
- **阅读**：喜欢的书籍列表
- **旅行**：旅行视频展示
- **摄影**：摄影作品展示
- **歌单**：三个浮动卡片歌单，每个歌单随机显示5首歌曲
- **链接**：社交媒体链接

## 歌单板块

歌单板块包含三个浮动卡片：
1. **光和枯树** - 光与树的主题歌单
2. **雨和屋檐** - 雨与屋檐的主题歌单  
3. **风和草地** - 风与草地的主题歌单

每个歌单卡片具有：
- 上下浮动动画效果（错开时间）
- 随机显示5首歌曲预览
- 歌曲信息包括：专辑封面、歌名、歌手、专辑
- 点击查看完整歌单链接

## 技术栈

- React 19
- Vite 8
- Tailwind CSS
- Lucide React图标库

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 部署到GitHub Pages
npm run deploy
```

## 部署

项目已配置GitHub Pages部署，访问地址：https://zhoujie2001.github.io/personal-pro/

## 更新日志

### 最新更新
- **集成音乐播放器到Playlist板块**
  - 添加MusicPlayer组件（三个卡片并列 + 浮动动画）
  - 添加MusicPlayer.css样式文件
  - 更新App.jsx，用MusicPlayer替换原Playlist部分
  - 添加独立音乐播放器页面（public/music-player-simple.html）
  - 优化CSS样式和动画效果
  - 每次刷新随机显示5首歌
  - 响应式设计，适配所有设备