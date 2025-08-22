# Plex Pre-Roll Manager (MVP)

## Run
1. Copy `backend/.env.example` to `backend/.env` and fill values.
2. `docker-compose up --build -d`
3. Open UI at http://localhost:8080, paste your API key, upload prerolls, and click Apply.

## Plex Notes
- Preference key used: `cinemaTrailersPrerollID`
- Value format: comma-separated absolute paths available to the Plex server process.
- Ensure **Plex can read** files at those paths (if Plex is on another host/container, mount the same volume path).
