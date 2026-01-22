const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// MongoDB connection with singleton pattern
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = "mongodb+srv://congo43:4596manu@cluster0.2vjumfn.mongodb.net/?appName=Cluster0";
  
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  const db = client.db('nursing-school');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://nursing-school-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running on Vercel' });
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const { username, password } = req.body;

    const user = await usersCollection.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.hashedPassword);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const JWT_SECRET = 'your_jwt_secret';
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { isLoggedOn: true, loginTimestamp: new Date() } }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const { username, email, password, confirmPassword, ...rest } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await usersCollection.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.insertOne({
      username,
      email,
      hashedPassword,
      ...rest,
      signupTimestamp: new Date(),
      isLoggedOn: false
    });

    const JWT_SECRET = 'your_jwt_secret';
    const token = jwt.sign({ userId: result.insertedId }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Export for Vercel
module.exports = app;