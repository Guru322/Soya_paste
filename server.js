import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'; 

const app = express();
const port = 3000;
const dbUrl = 'https://gurupaste.gurucharan-saho.repl.co'; 

app.use(cors());
app.use(bodyParser.json());

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
    const paste = { id: generatePasteId(), content };
    
    try {
     
      await axios.post(`${dbUrl}/pastes`, paste);
      res.status(201).json({ id: paste.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (action === 'getpaste') {
    const id = req.query.id;

    try {
      
      const response = await axios.get(`${dbUrl}/pastes/${id}`);
      const paste = response.data;

      if (paste) {
        res.json(paste);
      } else {
        res.status(404).json({ error: 'Paste not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
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
