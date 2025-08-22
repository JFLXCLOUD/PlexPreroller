import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs-extra";
import storage from "./storage.js";
import plex from "./plex.js";
import formidable from "formidable";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Get the application directory (where the exe is located)
const appDir = process.pkg ? path.dirname(process.execPath) : __dirname;
const prerollDir = path.join(appDir, "prerolls");

// Ensure prerolls directory exists
await fs.ensureDir(prerollDir);

// Serve frontend build
app.use(express.static(path.join(__dirname, "../../frontend")));

// Serve prerolls directory
app.use('/prerolls', express.static(prerollDir));

const port = process.env.PORT || 8088;
const API_KEY = process.env.ADMIN_API_KEY || "dev-key";
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "").split(",").filter(Boolean);

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || CORS_ORIGIN.length === 0 || CORS_ORIGIN.includes(origin)),
  credentials: true
}));

app.use(express.json({ limit: "5mb" }));

function requireKey(req, res, next) {
  const key = req.get("x-api-key") || req.query.key;
  if (key !== API_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// Health check
app.get("/api/health", (_, res) => res.json({ ok: true }));

// List prerolls
app.get("/api/prerolls", requireKey, async (_, res) => {
  try {
    const items = await storage.listPrerolls(prerollDir);
    res.json({ items });
  } catch (error) {
    console.error('Error listing prerolls:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload preroll
app.post("/api/prerolls", requireKey, async (req, res) => {
  const form = formidable({ 
    multiples: false,
    keepExtensions: true,
    uploadDir: path.join(appDir, "temp"),
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
      
      const savedPath = await storage.saveUpload(prerollDir, { 
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
  try {
    await storage.removePreroll(prerollDir, req.params.name);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting preroll:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply a specific set of prerolls
app.post("/api/apply", requireKey, async (req, res) => {
  try {
    const { filenames = [] } = req.body || {};
    console.log('Applying prerolls:', filenames);
    
    const listed = await storage.listPrerolls(prerollDir);
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
  try {
    const { count = 1 } = req.body || {};
    const items = await storage.listPrerolls(prerollDir);
    if (items.length === 0) return res.status(400).json({ error: "No prerolls available" });
    
    const shuffled = items.sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.min(count, 5)));
    await plex.plexPrefsSet({ prerollPaths: shuffled.map(i => i.path) });
    res.json({ applied: shuffled.map(i => i.name) });
  } catch (error) {
    console.error('Error applying random prerolls:', error);
    res.status(500).json({ error: `Failed to apply random prerolls: ${error.message}` });
  }
});

// Clear prerolls
app.post("/api/clear", requireKey, async (_, res) => {
  try {
    await plex.plexPrefsSet({ prerollPaths: [] });
    res.json({ cleared: true });
  } catch (error) {
    console.error('Error clearing prerolls:', error);
    res.status(500).json({ error: `Failed to clear prerolls: ${error.message}` });
  }
});

// Force Plex library refresh
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

// Catch-all route for SPA (must be last)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`PlexPreroller Windows App listening on ${host}:${port}`);
  console.log(`Prerolls directory: ${prerollDir}`);
  console.log(`Access the application at: http://localhost:${port}`);
});
