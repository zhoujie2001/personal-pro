# 创建GitHub仓库的PowerShell脚本
# 需要先设置环境变量 GITHUB_TOKEN

$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "错误: 未设置GITHUB_TOKEN环境变量" -ForegroundColor Red
    Write-Host "请先设置GitHub Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. 访问 https://github.com/settings/tokens" -ForegroundColor Yellow
    Write-Host "2. 生成新的token (需要repo权限)" -ForegroundColor Yellow
    Write-Host "3. 设置环境变量: setx GITHUB_TOKEN your_token_here" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

$body = @{
    name = "personal-pro"
    description = "个人网站项目，包含歌单板块"
    private = $false
    auto_init = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ 仓库创建成功!" -ForegroundColor Green
    Write-Host "仓库名称: $($response.name)" -ForegroundColor Green
    Write-Host "仓库URL: $($response.html_url)" -ForegroundColor Green
    Write-Host "克隆URL: $($response.clone_url)" -ForegroundColor Green
    
    # 设置远程仓库
    git remote remove origin 2>$null
    git remote add origin $response.clone_url
    git branch -M main
    git push -u origin main
    
    Write-Host "✅ 代码推送成功!" -ForegroundColor Green
}
catch {
    Write-Host "错误: $_" -ForegroundColor Red
    exit 1
}