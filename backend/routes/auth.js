const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({error: 'User not found'});
  
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({error: 'Wrong password'});
  
  const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
  res.json({token, user: {name: user.name, email: user.email}});
});

module.exports = router;
