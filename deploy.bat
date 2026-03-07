@echo off
echo ========================================
echo Personal Pro 项目部署脚本
echo ========================================
echo.

echo ✅ 项目功能已实现：
echo 1. 三个浮动歌单卡片
echo 2. 上下浮动动画（错开时间）
echo 3. 随机显示5首歌曲
echo 4. 完整歌曲信息
echo 5. 响应式设计
echo.

echo 📋 请按以下步骤操作：
echo.

echo 步骤1：创建GitHub仓库
echo 1. 访问 https://github.com/new
echo 2. 填写信息：
echo    - Owner: zhoujie2001
echo    - Repository name: personal-pro
echo    - Description: 个人网站项目，包含歌单板块
echo    - 选择 Public (公开)
echo    - 不要初始化README、.gitignore或license
echo 3. 点击 'Create repository'
echo.

echo 步骤2：获取仓库URL
echo 创建成功后，复制仓库的HTTPS URL：
echo https://github.com/zhoujie2001/personal-pro.git
echo.

echo 步骤3：推送代码
echo 执行以下命令：
echo.
echo git remote remove origin
echo git remote add origin https://github.com/zhoujie2001/personal-pro.git
echo git branch -M main
echo git push -u origin main
echo.

echo 步骤4：部署到GitHub Pages
echo 执行部署命令：
echo npm run deploy
echo.

echo 步骤5：访问网站
echo 部署完成后，访问：
echo https://zhoujie2001.github.io/personal-pro/
echo.

echo 🚀 项目已完全准备好！
echo 按照上述步骤操作后，网站将在几分钟内上线。
echo.

pause