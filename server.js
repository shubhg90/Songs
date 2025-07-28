//const express = require("express");
//const app = express();
 //const port = 3000;
 // Set the correct directory to serve static files //
 //const folderPath = "C:\\Users\\shubh\\OneDrive\\Desktop\\webd1\\Project2"; app.use(express.static(folderPath));
//app.listen(port, () => { console.log(`Server running at http://localhost:${port}`); });
const express = require('express');
const path    = require('path');
const fs      = require('fs').promises;

const app = express();
const SONGS_ROOT = path.join(__dirname, 'public', 'songs');

/**
 * Recursively scan a directory for .mp3 files.
 * Returns an object mapping folder names to arrays of file names.
 */
async function scanForMp3(dir, base = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let result = {};

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath  = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // Dive into subfolder
      const nested = await scanForMp3(fullPath, relPath);
      result = { ...result, ...nested };
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
      const folder = base || 'root';
      result[folder] = result[folder] || [];
      result[folder].push(entry.name);
    }
  }

  return result;
}

// Expose the JSON API
app.get('/api/songs', async (req, res) => {
  try {
    const songsMap = await scanForMp3(SONGS_ROOT);
    res.json(songsMap);
  } catch (err) {
    console.error('Error scanning for mp3s:', err);
    res.status(500).json({ error: 'Failed to scan songs' });
  }
});

// Serve your static frontend & songs folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);
