const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple JSON file database (works everywhere)
const DB_FILE = path.join(__dirname, 'contacts.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Helper functions
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

console.log('✅ Database ready!');

// ============ API ROUTES ============

// POST - Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const contacts = readDB();
    const newContact = {
      id: Date.now(),
      name,
      email,
      message,
      created_at: new Date().toISOString()
    };
    contacts.push(newContact);
    writeDB(contacts);

    console.log(`📩 New message from: ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Message received successfully!',
      id: newContact.id
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// GET - View all messages (for you to check submissions)
app.get('/api/contacts', (req, res) => {
  try {
    const contacts = readDB();
    res.json(contacts.reverse()); // newest first
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running! ⚓' });
});

// GET - Root route
app.get('/', (req, res) => {
  res.json({ message: 'Pirates Backend API 🏴‍☠️', endpoints: ['/api/health', '/api/contacts', '/api/contact'] });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏴‍☠️ Backend server running on port ${PORT}`);
});
