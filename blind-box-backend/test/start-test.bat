@echo off
chcp 65001 >nul
echo 🚀 盲盒相纸小程序后端API测试
echo ================================

echo.
echo 📋 选择操作:
echo 1. 启动开发服务器
echo 2. 运行API测试
echo 3. 启动服务器并运行测试
echo 4. 初始化数据库
echo 5. 退出
echo.

set /p choice=请输入选择 (1-5): 

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto run_test
if "%choice%"=="3" goto start_and_test
if "%choice%"=="4" goto init_db
if "%choice%"=="5" goto exit
goto invalid_choice

:start_server
echo.
echo 🚀 启动开发服务器...
echo 服务器将在 http://localhost:3000 启动
echo 按 Ctrl+C 停止服务器
echo.
npm run dev
goto end

:run_test
echo.
echo 🧪 运行API测试...
echo 请确保服务器已在 http://localhost:3000 运行
echo.
pause
node test-api.js
goto end

:start_and_test
echo.
echo 🚀 启动服务器并运行测试...
echo.
start "Blind Box Server" cmd /k "npm run dev"
echo 等待服务器启动...
timeout /t 5 /nobreak >nul
echo.
echo 🧪 开始运行API测试...
node test-api.js
goto end

:init_db
echo.
echo 🗄️ 初始化数据库...
echo 请确保MySQL服务已启动并配置正确
echo.
mysql -u root -p < database/init.sql
echo 数据库初始化完成！
goto end

:invalid_choice
echo.
echo ❌ 无效选择，请输入 1-5
echo.
pause
goto start

:exit
echo.
echo 👋 再见！
goto end

:end
echo.
pause
