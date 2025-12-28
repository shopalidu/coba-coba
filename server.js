const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'dictionary.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper function to read dictionary
const readDictionary = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist or error, return empty array
        return [];
    }
};

// Helper function to save dictionary
const saveDictionary = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API: Search
app.get('/api/search', (req, res) => {
    const { term, direction } = req.query; // direction: 'id-tae' or 'tae-id'

    if (!term) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    const dictionary = readDictionary();
    const searchTerm = term.toLowerCase();

    const results = dictionary.filter(entry => {
        if (direction === 'id-tae') {
            // Search in Indonesian, return Tae
            return entry.indonesian.toLowerCase().includes(searchTerm);
        } else {
            // Search in Tae, return Indonesian
            return entry.tae.toLowerCase().includes(searchTerm);
        }
    });

    res.json(results);
});

// API: Add Word
app.post('/api/add', (req, res) => {
    const { indonesian, tae } = req.body;

    if (!indonesian || !tae) {
        return res.status(400).json({ error: 'Both Indonesian and Tae words are required' });
    }

    const dictionary = readDictionary();

    // Check if duplicate (exact match)
    const exists = dictionary.some(entry =>
        entry.indonesian.toLowerCase() === indonesian.toLowerCase() &&
        entry.tae.toLowerCase() === tae.toLowerCase()
    );

    if (exists) {
        return res.status(409).json({ message: 'Word pair already exists' });
    }

    const newEntry = {
        indonesian: indonesian,
        tae: tae
    };

    dictionary.push(newEntry);
    saveDictionary(dictionary);

    res.status(201).json({ message: 'Word added successfully', entry: newEntry });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
