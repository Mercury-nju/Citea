@echo off
REM Vercel环境变量配置脚本 (Windows)

echo 🚀 配置Vercel环境变量...

REM 检查是否已登录Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 请先登录Vercel:
    vercel login
)

echo.
echo 📋 读取本地环境变量...

REM 检查是否存在.env.local文件
if exist .env.local (
    echo 发现 .env.local 文件，开始配置...
    
    REM 逐行读取并设置环境变量
    for /f "usebackq tokens=*" %%a in (".env.local") do (
        set "line=%%a"
        
        REM 跳过空行和注释
        echo !line! | findstr /r "^\s*$" >nul
        if !errorlevel! neq 0 (
            echo !line! | findstr /b "#" >nul
            if !errorlevel! neq 0 (
                REM 提取变量名和值
                for /f "tokens=1* delims==" %%i in ("!line!") do (
                    set "key=%%i"
                    set "value=%%j"
                    
                    REM 设置环境变量
                    echo 设置: !key!
                    echo !value! | vercel env add "!key!" production
                )
            )
        )
    )
    
    echo.
    echo ✅ 环境变量配置完成！
    echo.
    echo 请重新部署项目：
    echo git push origin main
) else (
    echo.
    echo ❌ 未找到 .env.local 文件
    echo 请确保.env.local文件存在并包含必要的环境变量
)

echo.
echo 🎯 下一步操作：
echo 1. 运行: git push origin main
echo 2. 等待Vercel重新部署
echo 3. 测试新的部署URL
echo.
echo 📖 查看DEPLOYMENT_FIX_GUIDE.md获取详细说明

pause