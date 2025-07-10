const express = require('express');
// YENİ FONKSİYONU İÇERİ AKTAR
const { getMessagesBySession, getChatSessionsByUser, getAllMessages } = require('../controllers/messageControllers');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// Mevcut Rotalar
router.get('/session/:sessionId', protect, getMessagesBySession);
router.get('/sessions', protect, getChatSessionsByUser);


// GET /api/messages/all adresine gelen istekleri getAllMessages fonksiyonu yönlendirir.
// 'protect' middleware'i bu rotanın da yetkilendirme gerektirdiğini belirtir.
router.get('/all', protect, getAllMessages);

module.exports = router;