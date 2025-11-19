const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelAutoConfigurator {
    constructor() {
        this.envVars = {};
        this.deploymentUrl = null;
    }

    // 读取本地环境变量
    loadLocalEnv() {
        console.log('📖 读取本地环境变量...');
        
        const envFiles = ['.env.local', '.env'];
        
        for (const file of envFiles) {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                console.log(`✅ 找到 ${file}`);
                const content = fs.readFileSync(filePath, 'utf8');
                
                content.split('\n').forEach(line => {
                    line = line.trim();
                    if (line && !line.startsWith('#')) {
                        const [key, ...valueParts] = line.split('=');
                        if (key && valueParts.length > 0) {
                            const value = valueParts.join('=').trim();
                            this.envVars[key.trim()] = value;
                        }
                    }
                });
            }
        }
        
        console.log(`📊 找到 ${Object.keys(this.envVars).length} 个环境变量`);
        return Object.keys(this.envVars).length > 0;
    }

    // 检查Vercel CLI状态
    checkVercelCLI() {
        console.log('🔍 检查Vercel CLI状态...');
        
        try {
            execSync('vercel --version', { stdio: 'pipe' });
            console.log('✅ Vercel CLI已安装');
            return true;
        } catch (error) {
            console.log('❌ Vercel CLI未安装');
            console.log('📥 请安装: npm i -g vercel');
            return false;
        }
    }

    // 检查登录状态
    checkLoginStatus() {
        console.log('🔐 检查登录状态...');
        
        try {
            const result = execSync('vercel whoami', { encoding: 'utf8', stdio: 'pipe' });
            console.log(`✅ 已登录: ${result.trim()}`);
            return true;
        } catch (error) {
            console.log('❌ 未登录Vercel');
            return false;
        }
    }

    // 登录Vercel
    async loginToVercel() {
        console.log('🔑 登录Vercel...');
        console.log('🌐 将打开浏览器进行登录...');
        
        try {
            execSync('vercel login', { stdio: 'inherit' });
            console.log('✅ 登录成功');
            return true;
        } catch (error) {
            console.log('❌ 登录失败');
            return false;
        }
    }

    // 获取项目信息
    getProjectInfo() {
        console.log('📋 获取项目信息...');
        
        try {
            // 尝试读取vercel项目配置
            const vercelJsonPath = path.join(process.cwd(), '.vercel/project.json');
            if (fs.existsSync(vercelJsonPath)) {
                const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
                console.log(`✅ 找到Vercel项目: ${config.projectId}`);
                return config;
            }
            
            // 如果没有项目配置，提示创建
            console.log('⚠️  未找到Vercel项目配置');
            console.log('📝 需要创建新项目或链接现有项目');
            return null;
        } catch (error) {
            console.log('❌ 获取项目信息失败');
            return null;
        }
    }

    // 配置环境变量
    async configureEnvironmentVariables() {
        console.log('⚙️  开始配置环境变量...');
        
        const requiredVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'REDIS_URL',
            'JWT_SECRET'
        ];
        
        let configuredCount = 0;
        
        for (const varName of requiredVars) {
            if (this.envVars[varName]) {
                try {
                    console.log(`🔧 配置 ${varName}...`);
                    
                    // 使用echo命令设置环境变量
                    const command = `echo "${this.envVars[varName]}" | vercel env add ${varName} production`;
                    execSync(command, { stdio: 'pipe' });
                    
                    console.log(`✅ ${varName} 配置成功`);
                    configuredCount++;
                } catch (error) {
                    console.log(`❌ ${varName} 配置失败: ${error.message}`);
                }
            } else {
                console.log(`⚠️  未找到 ${varName} 的值`);
            }
        }
        
        console.log(`📊 环境变量配置完成: ${configuredCount}/${requiredVars.length}`);
        return configuredCount > 0;
    }

    // 触发重新部署
    async triggerRedeployment() {
        console.log('🚀 触发重新部署...');
        
        try {
            console.log('📤 推送代码到Git...');
            
            // 创建部署触发文件
            const triggerContent = `# 部署触发 - ${new Date().toISOString()}
# 这个文件用于触发Vercel重新部署
自动配置环境变量完成
`;
            fs.writeFileSync('deployment-trigger-auto.txt', triggerContent);
            
            // 添加到git并提交
            execSync('git add deployment-trigger-auto.txt', { stdio: 'pipe' });
            execSync('git commit -m "自动配置: 更新环境变量"', { stdio: 'pipe' });
            execSync('git push origin main', { stdio: 'pipe' });
            
            console.log('✅ 已推送新提交，触发重新部署');
            return true;
        } catch (error) {
            console.log('❌ 触发重新部署失败');
            console.log('💡 请手动执行: git push origin main');
            return false;
        }
    }

    // 检查部署状态
    async checkDeploymentStatus() {
        console.log('⏳ 等待部署完成...');
        
        // 这里可以添加部署状态检查逻辑
        console.log('🌐 访问Vercel控制台查看部署状态');
        console.log('🔗 https://vercel.com/dashboard');
    }

    // 主配置流程
    async runConfiguration() {
        console.log('🎯 开始自动配置Vercel环境变量\n');
        
        // 1. 读取环境变量
        if (!this.loadLocalEnv()) {
            console.log('❌ 未找到环境变量文件');
            console.log('💡 请确保 .env.local 文件存在');
            return false;
        }
        
        // 2. 检查Vercel CLI
        if (!this.checkVercelCLI()) {
            return false;
        }
        
        // 3. 检查登录状态
        if (!this.checkLoginStatus()) {
            if (!await this.loginToVercel()) {
                return false;
            }
        }
        
        // 4. 获取项目信息
        const projectInfo = this.getProjectInfo();
        if (!projectInfo) {
            console.log('⚠️  需要手动创建或链接Vercel项目');
            console.log('💡 运行: vercel 来创建新项目');
            return false;
        }
        
        // 5. 配置环境变量
        const configured = await this.configureEnvironmentVariables();
        if (!configured) {
            console.log('❌ 环境变量配置失败');
            return false;
        }
        
        // 6. 触发重新部署
        await this.triggerRedeployment();
        
        // 7. 检查部署状态
        await this.checkDeploymentStatus();
        
        console.log('\n🎉 自动配置完成！');
        console.log('📋 下一步:');
        console.log('1. 等待Vercel重新部署完成');
        console.log('2. 测试新的部署URL');
        console.log('3. 验证用户注册功能');
        
        return true;
    }
}

// 运行自动配置
if (require.main === module) {
    const configurator = new VercelAutoConfigurator();
    configurator.runConfiguration().catch(console.error);
}

module.exports = VercelAutoConfigurator;