# PlexPreroller Windows Installation Guide

## Quick Installation

1. **Download** `plexpreroller-windows.zip`
2. **Extract** to a folder of your choice
3. **Edit** `config.env` with your Plex settings
4. **Run** `plexpreroller.exe`
5. **Open** http://localhost:8088 in your browser

## Configuration

Edit `config.env` and set these values:

```env
# Your Plex server URL (usually localhost if Plex is on the same machine)
PLEX_BASE_URL=http://localhost:32400

# Your Plex token (see instructions below)
PLEX_TOKEN=your_plex_token_here

# Optional: Specific library section IDs to refresh
PLEX_SECTION_IDS=1,2,3

# Security key for the web interface
ADMIN_API_KEY=your_secure_key_here

# Port for the web interface
PORT=8088
```

## Getting Your Plex Token

1. Open Plex Web in your browser
2. Press F12 to open Developer Tools
3. Go to the Network tab
4. Perform any action in Plex (like refreshing a library)
5. Look for requests containing `X-Plex-Token=...`
6. Copy the token value (the part after `X-Plex-Token=`)

## First Run

1. Double-click `plexpreroller.exe`
2. A console window will open showing the server status
3. Open your browser to http://localhost:8088
4. Enter your `ADMIN_API_KEY` in the web interface
5. Start uploading and managing your prerolls!

## Troubleshooting

- **Port already in use**: Change the `PORT` in `config.env`
- **Can't connect to Plex**: Verify Plex is running and your token is correct
- **Upload fails**: Check disk space and file format (MP4/MKV)

## File Structure

```
plexpreroller.exe     # Main application
config.env            # Configuration file
frontend/             # Web interface files
README.md             # Detailed documentation
prerolls/             # Created automatically - stores your videos
```
