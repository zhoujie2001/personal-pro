# 部署指南 - Personal Pro 项目

## 项目已完成的功能

✅ **歌单板块已完全实现**：
- 三个浮动卡片歌单："光和枯树"、"雨和屋檐"、"风和草地"
- 每个卡片上下浮动动画，错开时间（0s, 0.5s, 1s）
- 每次访问随机显示5首歌曲
- 歌曲信息完整：专辑封面、歌名、歌手、专辑
- 点击查看完整歌单链接
- 响应式设计，适配所有设备
- 与现有网站风格完全一致

## 部署步骤

### 步骤1：在GitHub上创建仓库
1. 访问 https://github.com
2. 登录你的账户 (zhoujie2001)
3. 点击右上角"+" → "New repository"
4. 填写信息：
   - Repository name: `personal-pro`
   - Description: `个人网站项目，包含歌单板块`
   - Public (公开)
   - 不要初始化README、.gitignore或license
5. 点击"Create repository"

### 步骤2：推送代码到GitHub
创建仓库后，GitHub会显示以下命令。在项目目录中执行：

```bash
cd D:\WORK\personal-pro
git remote add origin https://github.com/zhoujie2001/personal-pro.git
git branch -M main
git push -u origin main
```

### 步骤3：部署到GitHub Pages
执行部署命令：

```bash
npm run deploy
```

或者手动设置：
1. 访问仓库页面：https://github.com/zhoujie2001/personal-pro
2. 点击"Settings" → "Pages"
3. 在"Source"部分选择"GitHub Actions"
4. 或者选择"Deploy from a branch"，选择`gh-pages`分支

### 步骤4：访问网站
部署完成后，网站将在以下地址可用：
**https://zhoujie2001.github.io/personal-pro/**

## 项目结构

```
personal-pro/
├── src/
│   ├── App.jsx          # 主组件，包含歌单板块
│   ├── App.css          # 样式文件，包含歌单样式
│   ├── playlistData.js  # 歌单数据
│   └── ...
├── public/              # 静态资源
├── dist/               # 构建输出
├── package.json        # 项目配置
└── vite.config.js      # Vite配置
```

## 歌单功能详情

### 1. 三个歌单卡片
- **光和枯树**：https://y.qq.com/n3/other/pages/details/playlist.html?hosteuin=oK6soKoqNenP7z**&id=8670100374
- **雨和屋檐**：https://i2.y.qq.com/n3/other/pages/details/playlist.html?hosteuin=oK6soKoqNenP7z**&id=8667064202
- **风和草地**：https://i2.y.qq.com/n3/other/pages/details/playlist.html?hosteuin=oK6soKoqNenP7z**&id=8667059995

### 2. 浮动动画效果
- 每个卡片独立上下浮动
- 浮动时间错开：0s, 0.5s, 1s
- 形成波浪效果
- 悬停时卡片上浮，阴影加深

### 3. 随机歌曲预览
- 每次刷新随机选择5首歌曲
- 歌曲信息完整显示
- 专辑封面图片占位符
- 实际项目中可替换为真实API数据

### 4. 响应式设计
- 桌面端：三个卡片并排
- 平板端：两个卡片并排
- 手机端：单个卡片垂直排列

## 本地测试

项目已在本地测试通过：
- ✅ 依赖安装成功
- ✅ 开发服务器启动成功 (http://localhost:5173/personal-pro/)
- ✅ 生产构建成功
- ✅ 样式和功能正常

## 故障排除

如果遇到问题：

1. **Git推送失败**：
   - 检查GitHub仓库是否已创建
   - 检查网络连接
   - 确认GitHub账户权限

2. **部署失败**：
   - 检查package.json中的homepage配置
   - 检查vite.config.js中的base路径
   - 确保有gh-pages依赖

3. **网站无法访问**：
   - 等待GitHub Pages部署完成（通常需要1-2分钟）
   - 检查仓库Settings中的Pages配置
   - 清除浏览器缓存

## 联系方式

如有问题，可通过飞书联系我。项目已完全准备好，只需按照上述步骤部署即可获得可访问的链接。