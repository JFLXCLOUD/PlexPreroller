@echo off
echo Starting PlexPreroller...
echo.
echo Make sure you have:
echo 1. config.env file in this directory
echo 2. frontend folder in this directory
echo 3. Plex running on localhost:32400
echo.
echo Press any key to start the application...
pause > nul

echo.
echo Starting PlexPreroller...
plexpreroller.exe

echo.
echo Application stopped. Press any key to exit...
pause > nul
