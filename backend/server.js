const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const authRoutes = require('./routes/auth');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('DealDhamaka DB Connected 🔥'))
.catch(err => console.log(err));
app.use('/api/auth', authRoutes);

// Register
app.post('/api/register', async (req, res) => {
  try {
    const {name, email, password} = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({name, email, password: hash});
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
    res.json({token, user: {name: user.name, email: user.email}});
  } catch(e) {
    res.status(400).json({error: 'Email already exists'});
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({error: 'User not found'});
  
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({error: 'Wrong password'});
  
  const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
  res.json({token, user: {name: user.name, email: user.email}});
});

// Products API
app.get('/api/products', async (req, res) => {
  res.json([
    {id: 1, name: "DealDhamaka Phone", price: 19999, image: "https://i.imgur.com/phone.jpg"},
    {id: 2, name: "Dhamaka Earbuds", price: 1499, image: "https://i.imgur.com/earbuds.jpg"},
    {id: 3, name: "Dhamaka Watch", price: 2999, image: "https://i.imgur.com/watch.jpg"}
  ]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`DealDhamaka Server running on ${PORT} ⚡`));
