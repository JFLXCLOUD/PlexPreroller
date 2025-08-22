import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const requiredEnv = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};

const PLEX_BASE_URL = requiredEnv("PLEX_BASE_URL").replace(/\/$/, "");
const PLEX_TOKEN = requiredEnv("PLEX_TOKEN");

const qs = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

async function plexPrefsGet() {
  const url = `${PLEX_BASE_URL}/:/prefs?${qs({ "X-Plex-Token": PLEX_TOKEN })}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Plex prefs GET failed: ${res.status}`);
  // Plex returns XML by default; JSON works on many builds, but we’ll parse text and sniff.
  const text = await res.text();
  return text;
}

async function plexPrefsSet({ prerollPaths }) {
  // Plex stores preroll video paths in the preference key "cinemaTrailersPrerollID"
  // Value: comma-separated absolute file paths.
  const value = prerollPaths.join(",");
  const url = `${PLEX_BASE_URL}/:/prefs?${qs({
    "X-Plex-Token": PLEX_TOKEN,
    "cinemaTrailersPrerollID": value
  })}`;
  const res = await fetch(url, { method: "PUT" });
  if (!res.ok) throw new Error(`Plex prefs PUT failed: ${res.status}`);
  return true;
}

async function refreshLibraries(sectionIds = []) {
  // Kick scans so Plex sees new files immediately.
  if (!sectionIds || sectionIds.length === 0) {
    // Try to list sections and refresh all
    const url = `${PLEX_BASE_URL}/library/sections?${qs({ "X-Plex-Token": PLEX_TOKEN })}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const xml = await res.text();
    const ids = [...xml.matchAll(/<Directory[^>]*key="(\d+)"/g)].map(m => m[1]);
    sectionIds = ids;
  }
  for (const id of sectionIds) {
    const url = `${PLEX_BASE_URL}/library/sections/${id}/refresh?${qs({ "X-Plex-Token": PLEX_TOKEN })}`;
    await fetch(url).catch(()=>{});
  }
}

export default {
  plexPrefsGet,
  plexPrefsSet,
  refreshLibraries
};
