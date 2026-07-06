@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MENGHUBUNGKAN PROYEK KE GITHUB
echo ===================================================

:: Periksa apakah Git terinstal
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git tidak terdeteksi di PATH sistem Anda.
    echo Silakan unduh dan instal Git terlebih dahulu di: https://git-scm.com/download/win
    echo.
    echo Setelah instalasi selesai, buka kembali jendela Command Prompt baru
    echo dan jalankan script ini lagi.
    echo.
    pause
    exit /b 1
)

:: Meminta URL Repositori GitHub
set /p "REPO_URL=Masukkan URL Repositori GitHub Anda (contoh: https://github.com/username/repo-name.git): "
if "%REPO_URL%"=="" (
    echo [ERROR] URL Repositori tidak boleh kosong.
    pause
    exit /b 1
)

echo.
echo [INFO] Menginisialisasi repositori Git lokal...
git init

echo [INFO] Menambahkan semua file ke staging area...
git add .

echo [INFO] Membuat commit pertama...
git commit -m "Initial commit - Dashboard Polling"

echo [INFO] Mengatur branch utama menjadi 'main'...
git branch -M main

echo [INFO] Menghubungkan ke remote repository GitHub...
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo.
echo [INFO] Mengunggah (push) file ke GitHub...
echo (Jika belum login, jendela browser/autentikasi GitHub akan muncul untuk login)
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Gagal mengunggah ke GitHub.
    echo Pastikan Anda telah membuat repositori kosong di GitHub dan memiliki akses ke sana.
) else (
    echo.
    echo [SUCCESS] Proyek Anda berhasil terhubung dan diunggah ke GitHub!
)

echo.
pause
