import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { generate } from 'random-words';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3293;
const filePath = 'pastes.json';

app.use(cors());
app.use(bodyParser.json());

// Asynchronous file operations
async function loadPastes() {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading pastes file:', err.message);
    return [];
  }
}

async function savePastes(pastes) {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(pastes, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing pastes file:', err.message);
  }
}

// Middleware for logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Validation middleware
function validateInput(req, res, next) {
  if (req.query.action === 'create' && !req.query.content) {
    return res.status(400).json({ error: 'Content is required when creating a paste' });
  }
  next();
}

app.use(validateInput);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.get('/pastes', async (req, res) => {
  const action = req.query.action;

  if (action === 'create') {
    const content = req.query.content;
    const pastes = await loadPastes();
    const paste = { id: generatePasteId(), content };
    pastes.push(paste);
    await savePastes(pastes);
    res.status(201).json({ id: paste.id });
  } else if (action === 'getpaste') {
    const id = req.query.id;
    const pastes = await loadPastes();
    const paste = pastes.find((p) => p.id === id);

    if (paste) {
      res.json(paste);
    } else {
      res.status(404).json({ error: 'Paste not found' });
    }
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

function generatePasteId() {
  return `Guru_${uuidv4()}`;
}

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
