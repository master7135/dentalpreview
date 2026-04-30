const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this-in-production';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataFile = path.join(__dirname, 'appointments.json');
const usersFile = path.join(__dirname, 'users.json');
const availabilityFile = path.join(__dirname, 'availability.json');

// Initialize files if not exists
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify([]));
if (!fs.existsSync(availabilityFile)) fs.writeFileSync(availabilityFile, JSON.stringify({}));
if (!fs.existsSync(usersFile)) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('admin123', salt);
  fs.writeFileSync(usersFile, JSON.stringify([{ username: 'admin', password: hash }]));
}

function normalizeIndianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const localTenDigits = digits.slice(-10);
  if (localTenDigits.length !== 10) return null;
  return `+91 ${localTenDigits}`;
}

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- PUBLIC API ---

app.get('/api/availability', (req, res) => {
  try {
    const data = fs.readFileSync(availabilityFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read availability' });
  }
});

app.post('/api/book-appointment', (req, res) => {
  try {
    const { name, phone, date, time, service, message } = req.body;
    const normalizedPhone = normalizeIndianPhone(phone);
    
    if (!name || !normalizedPhone || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = fs.readFileSync(dataFile);
    const appointments = JSON.parse(data);
    
    const newAppointment = {
      id: Date.now().toString(),
      name,
      phone: normalizedPhone,
      date,
      time,
      service,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    fs.writeFileSync(dataFile, JSON.stringify(appointments, null, 2));
    
    res.status(201).json({ message: 'Appointment booked successfully!', appointment: newAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// --- ADMIN API ---

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/appointments', authenticate, (req, res) => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read appointments' });
  }
});

app.post('/api/admin/appointments/:id/status', authenticate, (req, res) => {
  try {
    const { status } = req.body;
    const appointments = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const index = appointments.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    appointments[index].status = status;
    fs.writeFileSync(dataFile, JSON.stringify(appointments, null, 2));
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/availability', authenticate, (req, res) => {
  try {
    fs.writeFileSync(availabilityFile, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Availability updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users', authenticate, (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    users.push({ username, password: hash });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.json({ message: 'User added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
