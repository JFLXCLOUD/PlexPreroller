@echo off
echo Building PlexPreroller Windows Application (Simple)...

echo.
echo Step 1: Installing dependencies...
npm install

echo.
echo Step 2: Creating simple executable...
echo Creating simple launcher...

REM Create a simple batch file that runs Node.js directly
echo @echo off > plexpreroller-simple.bat
echo title PlexPreroller >> plexpreroller-simple.bat
echo color 0A >> plexpreroller-simple.bat
echo. >> plexpreroller-simple.bat
echo echo Starting PlexPreroller... >> plexpreroller-simple.bat
echo echo. >> plexpreroller-simple.bat
echo node src/main.cjs >> plexpreroller-simple.bat
echo pause >> plexpreroller-simple.bat

echo.
echo Step 3: Creating distribution package...
mkdir dist-simple 2>nul
copy plexpreroller-simple.bat dist-simple\
copy src\*.cjs dist-simple\
xcopy /E /I frontend dist-simple\frontend
copy config.env dist-simple\
copy README.md dist-simple\
copy launcher.bat dist-simple\

echo.
echo Build complete!
echo.
echo The simple version is in: dist-simple/
echo This version requires Node.js to be installed on the target machine.
echo.
pause
