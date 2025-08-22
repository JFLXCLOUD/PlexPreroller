# PlexPreroller Portainer Deployment Guide

This guide will help you deploy PlexPreroller on Portainer using Docker images.

## Prerequisites

- Portainer running on your system
- Docker registry access (Docker Hub, private registry, or local)
- Plex Media Server running and accessible

## Option 1: Build and Deploy from Source

### 1. Build the Docker Image

```bash
# Clone the repository
git clone https://github.com/JFLXCLOUD/plexpreroller.git
cd plexpreroller

# Build the image
docker build -f Dockerfile.portainer -t plexpreroller:latest .

# Tag for your registry (replace with your registry)
docker tag plexpreroller:latest your-registry/plexpreroller:latest

# Push to registry
docker push your-registry/plexpreroller:latest
```

### 2. Configure Environment

Copy and edit the `config.env` file:

```bash
cp config.env config.env.local
# Edit config.env.local with your actual values
```

**Required Configuration:**
- `PLEX_BASE_URL`: Your Plex server URL (e.g., `http://192.168.1.50:32400`)
- `PLEX_TOKEN`: Your Plex API token
- `ADMIN_API_KEY`: A secure key for accessing the web UI
- `PLEX_SECTION_IDS`: Comma-separated library section IDs (optional)

### 3. Deploy on Portainer

1. **Create a Stack:**
   - In Portainer, go to Stacks → Add Stack
   - Name: `plexpreroller`
   - Copy the contents of `docker-compose.portainer.yml`

2. **Update the image reference:**
   - Replace `your-registry/plexpreroller:latest` with your actual image

3. **Deploy the stack**

## Option 2: Use Pre-built Image

If you have access to a pre-built image, simply update the `docker-compose.portainer.yml` file with the correct image reference.

## Configuration Details

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PLEX_BASE_URL` | Plex server base URL | `http://192.168.1.50:32400` |
| `PLEX_TOKEN` | Plex API token | `xxxxxxxxxxxx` |
| `ADMIN_API_KEY` | Web UI access key | `your-secure-key-here` |
| `PREROLL_DIR` | Preroll storage directory | `/app/prerolls` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:8088` |
| `PORT` | Backend port | `8080` |

### Volume Mappings

- `./prerolls:/app/prerolls`: Maps local prerolls directory to container
- `./config.env:/app/backend/.env:ro`: Maps configuration file (read-only)

### Port Mapping

- `8088:8088`: Maps host port 8088 to container port 8088

## Accessing the Application

Once deployed, access PlexPreroller at:
- **Web UI**: http://localhost:8088
- **Health Check**: http://localhost:8088/health

## Getting Your Plex Token

1. Open Plex Web and log in
2. Open Developer Tools → Network
3. Perform an action (e.g., refresh libraries)
4. Look for requests containing `X-Plex-Token=...`
5. Copy the token value

## Troubleshooting

### Common Issues

1. **Container won't start:**
   - Check environment variables are set correctly
   - Verify Plex server is accessible from container

2. **Can't access web UI:**
   - Verify port 8088 is not blocked by firewall
   - Check container logs for errors

3. **Prerolls not working:**
   - Ensure Plex can read the preroll files
   - Check Plex token has admin permissions

### Viewing Logs

```bash
# View container logs
docker logs plexpreroller

# Follow logs in real-time
docker logs -f plexpreroller
```

## Security Notes

- Change the default `ADMIN_API_KEY` to a secure value
- Consider using HTTPS in production
- Restrict access to the prerolls directory
- Use a private Docker registry for production deployments

## Support

For issues or questions:
- Check the main README.md
- Review container logs
- Ensure all environment variables are properly set 