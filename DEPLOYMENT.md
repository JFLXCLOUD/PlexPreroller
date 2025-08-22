# PlexPreroller Deployment Guide

## Your Setup
- **Server IP**: 192.168.1.249
- **Port**: 8088
- **Access URL**: http://192.168.1.249:8088

## Quick Deploy

### 1. Build the Image
```bash
docker build -t jbrns/plexpreroller:latest .
```

### 2. Push to Registry (if needed)
```bash
docker tag jbrns/plexpreroller:latest jbrns/plexpreroller:latest
docker push jbrns/plexpreroller:latest
```

### 3. Deploy on Portainer
1. **Go to Stacks** → **Add Stack**
2. **Name**: `plexpreroller`
3. **Copy the content** of `docker-compose.portainer-fixed.yml`
4. **Update environment variables**:
   - `PLEX_BASE_URL`: Your Plex server URL
   - `PLEX_TOKEN`: Your Plex API token
   - `ADMIN_API_KEY`: Your secure access key
5. **Deploy the stack**

## Access
- **Web UI**: http://192.168.1.249:8088
- **Health Check**: http://192.168.1.249:8088/health

## Troubleshooting
If you can't connect:
1. **Check container logs** in Portainer
2. **Verify port 8088** is open on your server
3. **Check firewall** settings on 192.168.1.249
4. **Ensure container is running** and healthy 