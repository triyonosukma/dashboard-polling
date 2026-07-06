@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   PENGOPERASIAN APLIKASI DASHBOARD POLLING
echo ===================================================

:: Periksa folder node_modules
if not exist "node_modules\" (
    echo [INFO] Folder node_modules tidak ditemukan. Menjalankan npm install...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Gagal melakukan npm install. Silakan periksa koneksi internet atau instalasi Node.js Anda.
        pause
        exit /b !errorlevel!
    )
)

:: Dapatkan jumlah instance yang ingin dijalankan
set "NUM_INSTANCES=%~1"
if "%NUM_INSTANCES%"=="" (
    set /p "NUM_INSTANCES=Berapa banyak instance aplikasi yang ingin dijalankan? (Default: 1): "
)
if "%NUM_INSTANCES%"=="" set "NUM_INSTANCES=1"

:: Pastikan NUM_INSTANCES berupa angka dan minimal 1
set /a "NUM_INSTANCES=NUM_INSTANCES" 2>nul
if !NUM_INSTANCES! lss 1 (
    set "NUM_INSTANCES=1"
)

echo [INFO] Membangun aplikasi (npm run build)...
call npm run build
if !errorlevel! neq 0 (
    echo [ERROR] Gagal melakukan build aplikasi.
    pause
    exit /b !errorlevel!
)

echo.
echo [INFO] Menjalankan !NUM_INSTANCES! instance aplikasi...
set "BASE_PORT=4173"

for /l %%i in (1, 1, !NUM_INSTANCES!) do (
    set /a "PORT=BASE_PORT + %%i - 1"
    echo [INFO] Memulai Instance %%i di port !PORT!...
    start "Dashboard Polling - Port !PORT!" cmd /k "npm run preview -- --port !PORT! --open"
)

echo.
echo [SUCCESS] Semua !NUM_INSTANCES! instance telah dijalankan.
echo Silakan periksa jendela command prompt baru yang terbuka.
echo Tekan tombol apa saja untuk menutup jendela utama ini...
pause >nul
