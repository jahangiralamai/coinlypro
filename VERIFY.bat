@echo off
REM Quick Verification Script for Coinly App

echo.
echo ================================
echo  COINLY APP VERIFICATION SCRIPT
echo ================================
echo.

REM Check Git Status
echo [1/4] Checking Git Status...
cd /d "c:\Users\Jahangir Alam\Desktop\Coinly"
git status --short
if %ERRORLEVEL% EQU 0 (
    echo     ✓ Git repository OK
) else (
    echo     ✗ Git repository error
)

echo.
echo [2/4] Latest Commits (CORS Fixes)...
git log --oneline -3

echo.
echo [3/4] Checking Backend Files...
if exist "server\index.js" (
    echo     ✓ server/index.js exists
) else (
    echo     ✗ server/index.js NOT FOUND
)

if exist "server\package.json" (
    echo     ✓ server/package.json exists
) else (
    echo     ✗ server/package.json NOT FOUND
)

if exist "index.html" (
    echo     ✓ index.html exists
) else (
    echo     ✗ index.html NOT FOUND
)

echo.
echo [4/4] Frontend API Configuration...
findstr /N "API_BASE_URL" index.html | findstr "const" | head -1

echo.
echo ================================
echo  VERIFICATION COMPLETE
echo ================================
echo.
echo NEXT STEPS:
echo 1. Test Production: https://coinly-pro.vercel.app
echo 2. Open DevTools (F12)
echo 3. Check Console for: "API_BASE_URL resolved to:"
echo 4. Try watching an ad or withdrawing
echo 5. Check Railway logs at: https://railway.app
echo.
echo See TESTING-GUIDE.md for detailed instructions
echo.
pause
