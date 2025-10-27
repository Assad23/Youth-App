const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_secret_key';

// In-memory data stores
let users = []; // { id, username, passwordHash, role, approved }
let posts = []; // { id, author, content, image, replies: [] }
let events = []; // { id, title, description, startDate, endDate, speaker, eventType }

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function checkAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
}

// Signup - register new user
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  const existing = users.find(u => u.username === username);
  if (existing) {
    return res.status(400).json({ message: 'User already exists.' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, username, passwordHash, role: 'user', approved: false };
  users.push(user);
  res.status(201).json({ message: 'User registered. Pending approval by admin.' });
});

// Signin - login
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ message: 'Invalid credentials.' });
  if (!user.approved) return res.status(403).json({ message: 'User not approved yet.' });
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ token });
});

// Approve user - admin only
app.post('/approve-user', authenticateToken, checkAdmin, (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.approved = true;
  res.json({ message: `User ${username} approved.` });
});

// Create post
app.post('/posts', authenticateToken, (req, res) => {
  const { content, image } = req.body;
  const post = { id: posts.length + 1, author: req.user.id, content, image: image || null, replies: [] };
  posts.unshift(post);
  res.status(201).json(post);
});

// Reply to post
app.post('/posts/:postId/reply', authenticateToken, (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const post = posts.find(p => p.id === parseInt(postId));
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  const reply = { author: req.user.id, content };
  post.replies.push(reply);
  res.status(201).json(reply);
});

// Get all posts
app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts);
});

// Create event - admin
app.post('/events', authenticateToken, checkAdmin, (req, res) => {
  const { title, description, startDate, endDate, speaker, eventType } = req.body;
  const event = { id: events.length + 1, title, description, startDate, endDate, speaker, eventType };
  events.push(event);
  res.status(201).json(event);
});

// Get events
app.get('/events', authenticateToken, (req, res) => {
  res.json(events);
});

// Fetch random NKJV verse
app.get('/verse', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get('https://bolls.life/get-random-verse/NKJV/');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verse.' });
  }
const PORT = process.env.PORT ||3001 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
