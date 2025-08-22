# PlexPreroller

A self-hosted server for managing Plex prerolls (intros and bumpers shown before movies or TV).

## Features

- Upload and manage preroll videos through a web UI
- Apply prerolls directly to Plex Media Server
- Random preroll selection
- Works with Plex's `cinemaTrailersPrerollID` preference
- Multiple deployment options (Docker, Windows executable)

## Quick Start

### Option 1: Windows Application (Recommended)

The easiest way to get started - download and run on Windows:

1. **Download** the latest release from [Releases](https://github.com/JFLXCLOUD/plexpreroller/releases)
2. **Extract** `plexpreroller-windows.zip` to a folder
3. **Edit** `config.env` with your Plex settings
4. **Run** `plexpreroller.exe`
5. **Access** at http://localhost:8088

See [Windows Installation Guide](windows/INSTALL.md) for detailed instructions.

### Option 2: Docker Deployment

For advanced users who prefer containerized deployment:

```bash
# Clone the repository
git clone https://github.com/JFLXCLOUD/plexpreroller.git
cd plexpreroller

# Build and run with Docker Compose
docker-compose up -d
```

See [Docker Deployment Guide](DOCKER.md) for detailed instructions.

## Configuration

### Required Environment Variables

```env
# Plex Server Configuration
PLEX_BASE_URL=http://localhost:32400
PLEX_TOKEN=your_plex_token_here

# Application Configuration
ADMIN_API_KEY=your_secure_key_here
PORT=8088
```

### Getting Your Plex Token

1. Open Plex Web and log in
2. Open Developer Tools → Network
3. Perform an action (e.g., refresh libraries)
4. Look for requests containing `X-Plex-Token=...`
5. Copy the token value

## Usage

1. **Open the web UI** in your browser
2. **Enter your `ADMIN_API_KEY`**
3. **Upload preroll videos** (MP4, MKV)
4. **Apply changes** — Plex will start showing your prerolls before playback

## API Endpoints

- `GET /api/prerolls` - List all prerolls
- `POST /api/prerolls` - Upload a new preroll
- `DELETE /api/prerolls/:name` - Delete a preroll
- `POST /api/apply` - Apply selected prerolls to Plex
- `POST /api/apply/random` - Apply random prerolls
- `POST /api/clear` - Clear all prerolls from Plex
- `POST /api/refresh` - Refresh Plex libraries

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment Options

### Windows Application
- **Pros**: Easy setup, perfect Plex connectivity, no Docker required
- **Cons**: Windows only
- **Best for**: Home users, simple deployments

### Docker
- **Pros**: Cross-platform, containerized, scalable
- **Cons**: More complex setup, networking considerations
- **Best for**: Advanced users, server deployments

## Troubleshooting

### Common Issues

- **Can't connect to Plex**: Verify Plex is running and your token is correct
- **Upload fails**: Check disk space and file format (MP4/MKV supported)
- **Port conflicts**: Change the `PORT` environment variable

### Getting Help

- Check the application logs for error messages
- Verify your Plex server configuration
- Ensure all environment variables are set correctly

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation in the respective deployment folders
