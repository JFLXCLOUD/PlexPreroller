# PlexPreroller Windows Application

A Windows desktop application for managing Plex prerolls (intros and bumpers shown before movies or TV).

## Features

- Upload and manage preroll videos through a web UI
- Apply prerolls directly to Plex Media Server
- Random preroll selection
- Works with Plex's `cinemaTrailersPrerollID` preference
- Simple Windows executable - no installation required
- Runs on the same machine as Plex for perfect connectivity

## Quick Start

### 1. Download and Run

1. **Download** `plexpreroller.exe` from the releases
2. **Extract** to a folder of your choice
3. **Configure** the application (see Configuration section)
4. **Run** `plexpreroller.exe`

### 2. Configuration

Create a `config.env` file in the same directory as the executable:

```env
# Plex Server Configuration
PLEX_BASE_URL=http://localhost:32400
PLEX_TOKEN=your_plex_token_here
PLEX_SECTION_IDS=1,2,3

# Application Configuration
ADMIN_API_KEY=your_secure_key_here
PORT=8088
HOST=0.0.0.0
```

### 3. Getting Your Plex Token

1. Open Plex Web and log in
2. Open Developer Tools → Network
3. Perform an action (e.g., refresh libraries)
4. Look for requests containing `X-Plex-Token=...`
5. Copy the token value

### 4. Access the Application

Once running, access PlexPreroller at:
- **Local**: http://localhost:8088
- **Network**: http://your-ip:8088

## Usage

1. **Open the web UI** in your browser
2. **Enter your `ADMIN_API_KEY`**
3. **Upload preroll videos** (MP4, MKV)
4. **Apply changes** — Plex will start showing your prerolls before playback

## File Structure

```
plexpreroller.exe
config.env
prerolls/          # Preroll videos are stored here
temp/              # Temporary upload files
```

## Building from Source

### Prerequisites

- Node.js 18+
- npm or yarn

### Build Steps

```bash
# Clone the repository
git clone https://github.com/JFLXCLOUD/plexpreroller.git
cd plexpreroller/windows

# Install dependencies
npm install

# Build the executable
npm run build

# The executable will be created as plexpreroller.exe
```

## Troubleshooting

### Application Won't Start
- Check if port 8088 is already in use
- Verify the `config.env` file is in the same directory
- Check Windows Firewall settings

### Can't Connect to Plex
- Verify Plex is running on `localhost:32400`
- Check your Plex token is correct
- Ensure Plex allows local connections

### Upload Issues
- Check available disk space
- Verify file format (MP4, MKV supported)
- Check file size (100MB limit)

## Security Notes

- Change the default `ADMIN_API_KEY` to a secure value
- Keep your Plex token private
- The application runs on your local network

## Support

For issues or questions:
- Check the application logs in the console
- Verify your Plex server configuration
- Ensure all environment variables are set correctly

## License

MIT License
