const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署到GitHub Pages...\n');

try {
    // 1. 构建项目
    console.log('1. 构建项目...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 2. 检查dist目录
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
        throw new Error('dist目录不存在，构建失败');
    }
    
    console.log('✅ 构建成功');
    console.log(`📁 dist目录内容:`);
    const files = fs.readdirSync(distPath);
    files.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        } else {
            console.log(`   📁 ${file}/`);
        }
    });
    
    // 3. 使用gh-pages部署
    console.log('\n2. 部署到GitHub Pages...');
    execSync('npx gh-pages -d dist', { stdio: 'inherit' });
    
    console.log('\n🎉 部署成功！');
    console.log('🔗 访问链接: https://zhoujie2001.github.io/personal-pro/');
    console.log('🔗 Playlist页面: https://zhoujie2001.github.io/personal-pro/#playlist');
    
    console.log('\n⏳ 部署可能需要几分钟生效');
    console.log('💡 如果页面仍然报错，请:');
    console.log('   1. 等待5-10分钟');
    console.log('   2. 按Ctrl+Shift+R强制刷新');
    console.log('   3. 清除浏览器缓存');
    
} catch (error) {
    console.error('\n❌ 部署失败:', error.message);
    console.log('\n🔧 解决方案:');
    console.log('1. 安装gh-pages: npm install -g gh-pages');
    console.log('2. 检查网络连接');
    console.log('3. 检查GitHub token权限');
    
    process.exit(1);
}