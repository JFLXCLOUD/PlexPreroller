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

### Option 1: Using the Batch File (Recommended)
1. Double-click `run-plexpreroller.bat`
2. Follow the prompts and press any key to start
3. A console window will open showing the server status
4. Open your browser to http://localhost:8088
5. Enter your `ADMIN_API_KEY` in the web interface
6. Start uploading and managing your prerolls!

### Option 2: Command Line
1. Open Command Prompt (cmd) or PowerShell
2. Navigate to the folder: `cd C:\path\to\plexpreroller`
3. Run: `plexpreroller.exe`
4. Open your browser to http://localhost:8088

## Troubleshooting

### Application Won't Start
- **Nothing happens when double-clicking**: Use `run-plexpreroller.bat` instead, or run from Command Prompt
- **Port already in use**: Change the `PORT` in `config.env`
- **Missing config.env**: Create the configuration file with your Plex settings
- **Missing frontend folder**: Make sure the frontend files are in the same directory

### Connection Issues
- **Can't connect to Plex**: Verify Plex is running and your token is correct
- **Can't access web interface**: Check if port 8088 is blocked by Windows Firewall
- **Upload fails**: Check disk space and file format (MP4/MKV)

### Common Error Messages
- **"Port already in use"**: Change PORT in config.env to 8089 or another free port
- **"Missing environment variable"**: Check your config.env file format
- **"Permission denied"**: Run as Administrator or check file permissions

## File Structure

```
plexpreroller.exe     # Main application
config.env            # Configuration file
frontend/             # Web interface files
README.md             # Detailed documentation
prerolls/             # Created automatically - stores your videos
```
