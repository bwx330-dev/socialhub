@echo off
title Push SocialHub to GitHub
echo ========================================================
echo   MENGHUBUNGKAN SOCIALHUB KE GITHUB (bwx330-dev)
echo ========================================================
echo.
cd /d "C:\Users\BOWXLSS\.gemini\antigravity\scratch\socialhub"

"C:\Program Files\GitHub CLI\gh.exe" auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [Langkah 1/2] Verifikasi Login GitHub:
    echo Browser akan otomatis terbuka dan menampilkan kode verifikasi.
    echo Cukup klik tombol hijau Authorize di browser kamu!
    echo.
    "C:\Program Files\GitHub CLI\gh.exe" auth login --web -h github.com -p https
)

echo.
echo [Langkah 2/2] Mengupload SocialHub ke GitHub...
"C:\Program Files\GitHub CLI\gh.exe" auth setup-git
git push -u origin main --force

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   BERHASIL! SocialHub sudah ter-upload 100%% ke GitHub!
    echo ========================================================
) else (
    echo [!] Terjadi kendala saat push.
)
echo.
pause
