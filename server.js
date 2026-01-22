const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'portfolio.db'));

// Create contacts table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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
    const stmt = db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, message);

    console.log(`📩 New message from: ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Message received successfully!',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// GET - View all messages (for you to check submissions)
app.get('/api/contacts', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC');
    const contacts = stmt.all();
    res.json(contacts);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running! ⚓' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏴‍☠️ Backend server running at http://localhost:${PORT}`);
  console.log(`📋 View messages at http://localhost:${PORT}/api/contacts`);
});
