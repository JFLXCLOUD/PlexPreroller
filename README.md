# PlexPreroller 🎬

**PlexPreroller** is a self-hosted tool and workflow manager for Plex prerolls (intros and bumpers shown before movies or TV).  
It lets you upload, organize, and rotate preroll videos — with optional **n8n automation** for seasonal themes, random rolls, or nightly rotation.

---

## Features

- Upload and manage preroll videos through a web UI  
- Rotate prerolls automatically with included **n8n workflows**  
- Organize prerolls by theme (holiday, trailers, custom bumpers)  
- Works with Plex’s `cinemaTrailersPrerollID` preference  
- Docker-ready (single `docker-compose up`)  
- API secured with admin key  

---

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/plexpreroller.git
cd plexpreroller
```

### 2. Configure environment
Copy the example env file and set values:
```bash
cp backend/.env.example backend/.env
```

### 3. Run with Docker
```bash
docker-compose up --build -d
```

The UI will be available at:

http://localhost:8080

---

## Environment Variables

The backend uses a few required environment variables. Copy `.env.example` to `.env` and set your values:

| Variable       | Example                       | Description |
|----------------|-------------------------------|-------------|
| `PLEX_BASE_URL` | `http://192.168.1.50:32400`   | The base URL of your Plex Media Server. Default Plex port is `32400`. Use `http://host.docker.internal:32400` if running Plex locally with Docker. |
| `PLEX_TOKEN`    | `xxxxxxxxxxxx`                | Your Plex API token (X-Plex-Token). Required to allow PlexPreroller to update Plex preferences. |
| `ADMIN_API_KEY` | `changeme`                    | Secret key for authenticating with the PlexPreroller API and UI. Change this to a long random string. |
| `PREROLL_DIR`   | `/app/prerolls`               | Directory inside the container where preroll videos are stored. In Docker you should map this to a local folder (e.g. `./prerolls:/app/prerolls`). |

---

### Getting your Plex Token

1. Open Plex Web and log in.  
2. Open **Developer Tools → Network** in your browser.  
3. Perform an action (e.g. refresh libraries).  
4. Look for requests containing `X-Plex-Token=...` in the URL.  
5. Copy the token value and paste it into `.env`.  

---

## Usage

1. Open the web UI  
2. Enter your `ADMIN_API_KEY`  
3. Upload preroll videos (MP4, MKV)  
4. Apply changes — Plex will start showing your prerolls before playback 🎉  

---

## Automation with n8n

This repo includes example workflows in the `n8n/` folder:

- `rotate-prerolls-nightly.json` → pick a new preroll each day  
- `seasonal-themes.json` → swap in holiday-themed intros automatically  

Import them into your n8n instance, set the API endpoint + key, and enjoy hands-off preroll management.

---

## Project Structure

```
plexpreroller/
  backend/        # Express API for Plex + preroll storage
  frontend/       # Web UI for uploads & management
  n8n/            # Example n8n workflows
  docker-compose.yml
  README.md
```

---

## Contributing

Pull requests are welcome!  
Ideas for enhancements:
- Advanced scheduling  
- Multiple Plex servers  
- Per-library prerolls  
- Trailers + outros support  

---

## License

MIT License
