import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import storage from "./storage.js";
import plex from "./plex.js";

const app = express();
const port = process.env.PORT || 8088;
const API_KEY = process.env.ADMIN_API_KEY || "dev-key";
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "").split(",").filter(Boolean);

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || CORS_ORIGIN.length === 0 || CORS_ORIGIN.includes(origin)),
  credentials: true
}));

function requireKey(req, res, next) {
  const key = req.get("x-api-key") || req.query.key;
  if (key !== API_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// Health
app.get("/api/health", (_, res) => res.json({ ok: true }));

// List prerolls
app.get("/api/prerolls", requireKey, async (_, res) => {
  const items = await storage.listPrerolls();
  res.json({ items });
});

// Upload preroll
app.post("/api/prerolls", requireKey, async (req, res) => {
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: err.message });
    const file = files.file;
    if (!file) return res.status(400).json({ error: "file is required" });
    const data = await fs.readFile(file.filepath);
    const savedPath = await storage.saveUpload({ filename: file.originalFilename || "preroll.mp4", buffer: data });
    res.json({ savedPath });
  });
});

// Delete preroll
app.delete("/api/prerolls/:name", requireKey, async (req, res) => {
  await storage.removePreroll(req.params.name);
  res.json({ ok: true });
});

// Apply a specific set of prerolls (by filenames). Empty array clears.
app.post("/api/apply", requireKey, async (req, res) => {
  const { filenames = [] } = req.body || {};
  const listed = await storage.listPrerolls();
  const map = new Map(listed.map(i => [i.name, i.path]));
  const selectedPaths = filenames.map(f => map.get(f)).filter(Boolean);
  await plex.plexPrefsSet({ prerollPaths: selectedPaths });
  res.json({ applied: selectedPaths, count: selectedPaths.length });
});

// Apply random N prerolls
app.post("/api/apply/random", requireKey, async (req, res) => {
  const { count = 1 } = req.body || {};
  const items = await storage.listPrerolls();
  if (items.length === 0) return res.status(400).json({ error: "No prerolls available" });
  const shuffled = items.sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.min(count, 5)));
  await plex.plexPrefsSet({ prerollPaths: shuffled.map(i => i.path) });
  res.json({ applied: shuffled.map(i => i.name) });
});

// Clear prerolls
app.post("/api/clear", requireKey, async (_, res) => {
  await plex.plexPrefsSet({ prerollPaths: [] });
  res.json({ cleared: true });
});

// Force Plex library refresh (optional convenience)
app.post("/api/refresh", requireKey, async (req, res) => {
  const ids = (req.body?.sectionIds || process.env.PLEX_SECTION_IDS?.split(",") || []).filter(Boolean);
  await plex.refreshLibraries(ids);
  res.json({ ok: true, sections: ids });
});

app.listen(port, () => {
  console.log(`Plex Preroll Manager API listening on :${port}`);
});
