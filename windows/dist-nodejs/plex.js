const fetch = require("node-fetch");
const fs = require("fs-extra");
const path = require("path");

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
  
  console.log('Setting Plex prerolls:', value);
  console.log('Plex URL:', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const res = await fetch(url, { 
      method: "PUT",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`Plex prefs PUT failed: ${res.status}`);
    console.log('Plex prerolls updated successfully');
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Plex request timed out after 10 seconds');
    }
    throw error;
  }
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

module.exports = {
  plexPrefsGet,
  plexPrefsSet,
  refreshLibraries
};
