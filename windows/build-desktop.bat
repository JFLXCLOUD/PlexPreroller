@echo off
echo Building PlexPreroller Desktop Application...

echo.
echo Step 1: Building the server executable...
cd ..
npm run build-windows

echo.
echo Step 2: Setting up Electron app...
cd electron-app
npm install

echo.
echo Step 3: Building desktop application...
npm run dist

echo.
echo Build complete!
echo The installer is located in: electron-app/dist/
echo.
pause
