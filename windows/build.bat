@echo off
echo Building PlexPreroller Windows Application...

echo Installing dependencies...
npm install

echo Building executable...
npm run build

echo Build complete!
echo The executable is located at: plexpreroller.exe
echo.
echo Next steps:
echo 1. Copy the frontend folder to the same directory as plexpreroller.exe
echo 2. Create a config.env file with your Plex settings
echo 3. Run plexpreroller.exe
echo.
pause
