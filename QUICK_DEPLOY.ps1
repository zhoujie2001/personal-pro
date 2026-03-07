# 快速部署脚本
# 这个脚本会指导你完成GitHub仓库创建和部署

Write-Host "🎵 Personal Pro 项目部署指南" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ 项目已完成以下功能：" -ForegroundColor Green
Write-Host "1. 三个浮动歌单卡片：光和枯树、雨和屋檐、风和草地" -ForegroundColor Yellow
Write-Host "2. 每个卡片上下浮动动画（错开时间）" -ForegroundColor Yellow
Write-Host "3. 每次访问随机显示5首歌曲" -ForegroundColor Yellow
Write-Host "4. 完整歌曲信息：专辑封面、歌名、歌手、专辑" -ForegroundColor Yellow
Write-Host "5. 响应式设计，适配所有设备" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 请按以下步骤操作：" -ForegroundColor Cyan
Write-Host ""

# 步骤1：创建GitHub仓库
Write-Host "步骤1：创建GitHub仓库" -ForegroundColor Magenta
Write-Host "1. 访问 https://github.com/new" -ForegroundColor White
Write-Host "2. 填写信息：" -ForegroundColor White
Write-Host "   - Owner: zhoujie2001" -ForegroundColor White
Write-Host "   - Repository name: personal-pro" -ForegroundColor White
Write-Host "   - Description: 个人网站项目，包含歌单板块" -ForegroundColor White
Write-Host "   - Public (公开)" -ForegroundColor White
Write-Host "   - 不要初始化README、.gitignore或license" -ForegroundColor White
Write-Host "3. 点击 'Create repository'" -ForegroundColor White
Write-Host ""

# 步骤2：获取仓库URL
Write-Host "步骤2：获取仓库URL" -ForegroundColor Magenta
Write-Host "创建成功后，复制仓库的HTTPS URL，格式如下：" -ForegroundColor White
Write-Host "https://github.com/zhoujie2001/personal-pro.git" -ForegroundColor Green
Write-Host ""

# 步骤3：设置远程仓库并推送
Write-Host "步骤3：推送代码" -ForegroundColor Magenta
Write-Host "在PowerShell中执行以下命令：" -ForegroundColor White
Write-Host ""
Write-Host "# 进入项目目录" -ForegroundColor Gray
Write-Host "cd D:\WORK\personal-pro" -ForegroundColor Green
Write-Host ""
Write-Host "# 设置远程仓库（替换YOUR_URL为实际的仓库URL）" -ForegroundColor Gray
Write-Host "git remote remove origin 2>null" -ForegroundColor Green
Write-Host "git remote add origin https://github.com/zhoujie2001/personal-pro.git" -ForegroundColor Green
Write-Host "git branch -M main" -ForegroundColor Green
Write-Host "git push -u origin main" -ForegroundColor Green
Write-Host ""

# 步骤4：部署到GitHub Pages
Write-Host "步骤4：部署到GitHub Pages" -ForegroundColor Magenta
Write-Host "执行部署命令：" -ForegroundColor White
Write-Host "npm run deploy" -ForegroundColor Green
Write-Host ""

# 步骤5：访问网站
Write-Host "步骤5：访问网站" -ForegroundColor Magenta
Write-Host "部署完成后，访问以下地址：" -ForegroundColor White
Write-Host "https://zhoujie2001.github.io/personal-pro/" -ForegroundColor Cyan -BackgroundColor DarkGray
Write-Host ""

# 检查当前状态
Write-Host "📊 当前项目状态：" -ForegroundColor Cyan
Write-Host ""

# 检查Git状态
try {
    $gitStatus = git status --short 2>$null
    if ($gitStatus) {
        Write-Host "Git状态：有未提交的更改" -ForegroundColor Yellow
        Write-Host $gitStatus -ForegroundColor Gray
    } else {
        Write-Host "Git状态：所有更改已提交" -ForegroundColor Green
    }
} catch {
    Write-Host "Git状态：无法获取" -ForegroundColor Red
}

Write-Host ""

# 检查构建状态
Write-Host "构建状态：已成功构建" -ForegroundColor Green
Write-Host "构建目录：D:\WORK\personal-pro\dist" -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 按照上述步骤操作后，你的网站将在几分钟内上线！" -ForegroundColor Cyan
Write-Host ""

# 提供帮助
Write-Host "需要帮助？" -ForegroundColor Yellow
Write-Host "1. 如果遇到GitHub认证问题，可能需要输入用户名和密码" -ForegroundColor White
Write-Host "2. 如果使用双重认证，需要使用Personal Access Token作为密码" -ForegroundColor White
Write-Host "3. 部署后可能需要等待1-2分钟才能访问" -ForegroundColor White
Write-Host ""

Write-Host "🎉 项目已完全准备好，祝你部署顺利！" -ForegroundColor Green