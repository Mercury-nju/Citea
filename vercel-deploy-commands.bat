@echo off
echo === Vercel部署命令脚本 ===
echo.
echo 请按顺序执行以下命令：
echo.

echo 1. 安装Vercel CLI（如果未安装）
echo    npm i -g vercel
echo.

echo 2. 登录Vercel
echo    vercel login
echo.

echo 3. 在项目目录中初始化Vercel
echo    vercel
echo.

echo 4. 配置环境变量
echo    vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo    vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo    vercel env add REDIS_URL production
echo    vercel env add JWT_SECRET production
echo    vercel env add NODE_ENV production
echo.

echo 5. 部署到生产环境
echo    vercel --prod
echo.

echo === 环境变量值 ===
echo.
type vercel-env-config.txt
echo.
echo === 部署完成 ===
pause