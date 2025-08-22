import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import storage from "./storage.js";
import plex from "./plex.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  const form = formidable({ 
    multiples: false,
    keepExtensions: true,
    uploadDir: '/tmp',
    maxFileSize: 100 * 1024 * 1024 // 100MB limit
  });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: err.message });
    
    console.log('Upload request - fields:', fields);
    console.log('Upload request - files:', files);
    
    const file = files.file;
    if (!file) return res.status(400).json({ error: "file is required" });
    
    // Handle both array and single file cases
    const fileObj = Array.isArray(file) ? file[0] : file;
    
    console.log('File object:', fileObj);
    console.log('File filepath:', fileObj.filepath);
    console.log('File originalFilename:', fileObj.originalFilename);
    
    if (!fileObj.filepath) {
      return res.status(400).json({ error: "Invalid file upload - filepath is missing" });
    }
    
    try {
      console.log('Reading file from:', fileObj.filepath);
      const data = await fs.readFile(fileObj.filepath);
      console.log('File read successfully, size:', data.length);
      
      const filename = fileObj.originalFilename || "preroll.mp4";
      console.log('Saving file as:', filename);
      
      const savedPath = await storage.saveUpload({ 
        filename: filename, 
        buffer: data 
      });
      
      console.log('File saved to:', savedPath);
      
      // Clean up temp file
      try {
        await fs.unlink(fileObj.filepath);
        console.log('Temp file cleaned up');
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError.message);
      }
      
      console.log('Sending success response');
      res.json({ savedPath, filename: filename });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      console.error('Error stack:', uploadError.stack);
      res.status(500).json({ error: `Upload failed: ${uploadError.message}` });
    }
  });
});

// Delete preroll
app.delete("/api/prerolls/:name", requireKey, async (req, res) => {
  await storage.removePreroll(req.params.name);
  res.json({ ok: true });
});

// Apply a specific set of prerolls (by filenames). Empty array clears.
app.post("/api/apply", requireKey, async (req, res) => {
  try {
    const { filenames = [] } = req.body || {};
    console.log('Applying prerolls:', filenames);
    
    const listed = await storage.listPrerolls();
    const map = new Map(listed.map(i => [i.name, i.path]));
    const selectedPaths = filenames.map(f => map.get(f)).filter(Boolean);
    
    console.log('Selected paths:', selectedPaths);
    
    await plex.plexPrefsSet({ prerollPaths: selectedPaths });
    console.log('Successfully applied prerolls to Plex');
    
    res.json({ applied: selectedPaths, count: selectedPaths.length });
  } catch (error) {
    console.error('Error applying prerolls:', error);
    res.status(500).json({ error: `Failed to apply prerolls: ${error.message}` });
  }
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
  try {
    const ids = (req.body?.sectionIds || process.env.PLEX_SECTION_IDS?.split(",") || []).filter(Boolean);
    console.log('Refreshing Plex libraries:', ids);
    
    await plex.refreshLibraries(ids);
    console.log('Successfully refreshed Plex libraries');
    
    res.json({ ok: true, sections: ids });
  } catch (error) {
    console.error('Error refreshing Plex libraries:', error);
    res.status(500).json({ error: `Failed to refresh Plex libraries: ${error.message}` });
  }
});

// Serve frontend build (after all API routes)
app.use(express.static(path.join(__dirname, "../../frontend")));

// Catch-all route for SPA (must be last)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Plex Preroll Manager API listening on ${host}:${port}`);
});
