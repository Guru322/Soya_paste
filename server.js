import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import {generate} from 'random-words';

const app = express();
const port = 3000;

app.use(bodyParser.json());

const filePath = 'pastes.json';

let pastes = [];

try {
    const data = fs.readFileSync(filePath, 'utf8');
    pastes = JSON.parse(data);
} catch (err) {
    console.error('Error reading pastes file:', err.message);
}

function savePastes() {
    fs.writeFileSync(filePath, JSON.stringify(pastes, null, 2), 'utf8');
}

function generatePasteId() {
    return `Guru_${generate()}`;
}

app.get('/pastes', (req, res) => {
    const action = req.query.action;

    if (action === 'create') {
        const content = req.query.content;
        const paste = { id: generatePasteId(), content };
        pastes.push(paste);
        savePastes();
        res.status(201).json({ id: paste.id });
    } else if (action === 'getpaste') {
        const id = req.query.id;
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

app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
