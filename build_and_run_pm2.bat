@echo off
setlocal EnableDelayedExpansion

set root_path=%~dp0
cd /d "%root_path%"

REM 获取当前目录的项目名称
set project_name=start-web-platform
echo 项目名称: %project_name%

echo 检查PM2应用是否存在...
call pm2 list | findstr "%project_name%" >nul
if %errorlevel% equ 0 (
    echo 应用 %project_name% 已存在，使用零停机部署模式更新...
    set app_exists=true
) else (
    echo 应用 %project_name% 不存在，全新部署
    set app_exists=false
)

echo 构建前端项目...
cd /d "%root_path%\frontend"
if exist dist rd /s /q dist
echo 安装前端依赖...
call npm i
if %errorlevel% neq 0 (
    echo 前端依赖安装失败
    pause
    exit /b %errorlevel%
)

echo 构建前端项目...
call npm run build
if %errorlevel% neq 0 (
    echo 前端项目构建失败
    pause
    exit /b %errorlevel%
)

echo 前端项目构建完成

cd /d "%root_path%"
echo 构建dist目录...
if exist dist rd /s /q dist
echo 移动前端dist目录到项目目录...
move frontend\dist dist
if %errorlevel% neq 0 (
    echo 移动dist目录失败
    pause
    exit /b %errorlevel%
)

echo 安装后端依赖...
cd /d "%root_path%\backend"
call npm i
if %errorlevel% neq 0 (
    echo 后端依赖安装失败
    pause
    exit /b %errorlevel%
)

cd /d "%root_path%\backend"
if "!app_exists!"=="true" (
    echo 执行PM2重载实现零停机部署...
    call pm2 reload ecosystem.config.js
    if %errorlevel% neq 0 (
        echo PM2重载失败，尝试重启应用...
        call pm2 restart ecosystem.config.js
        if %errorlevel% neq 0 (
            echo PM2重启失败
            pause
            exit /b %errorlevel%
        )
    )
    call pm2 list
) else (
    echo 启动PM2应用...
    call pm2 start ecosystem.config.js
    if %errorlevel% neq 0 (
        echo PM2启动失败
        pause
        exit /b %errorlevel%
    )
)

cd /d "%root_path%"
echo.
echo 部署完成
echo 项目名称: %project_name%
echo.
pause >nul