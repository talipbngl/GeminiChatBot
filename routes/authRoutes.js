// routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser } = require('../controllers/authControllers');

const router = express.Router();

// Kullanıcı kayıt endpoint'i
router.post('/register', registerUser);

// Kullanıcı giriş endpoint'i
router.post('/login', loginUser);

module.exports = router;