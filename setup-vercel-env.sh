#!/bin/bash
# Vercel环境变量配置脚本

echo "🚀 配置Vercel环境变量..."

# 检查是否已登录Vercel
if ! vercel whoami; then
    echo "请先登录Vercel:"
    vercel login
fi

# 读取本地环境变量
if [ -f .env.local ]; then
    echo "发现 .env.local 文件，开始配置..."
    
    # 逐行读取并设置环境变量
    while IFS= read -r line; do
        # 跳过空行和注释
        if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
            # 提取变量名和值
            key=$(echo "$line" | cut -d'=' -f1)
            value=$(echo "$line" | cut -d'=' -f2-)
            
            # 设置环境变量
            echo "设置: $key"
            echo "$value" | vercel env add "$key" production
        fi
    done < .env.local
    
    echo "✅ 环境变量配置完成！"
    echo "请重新部署项目："
    echo "git push origin main"
else
    echo "❌ 未找到 .env.local 文件"
fi
