// routes/chatRoutes.js

const express = require('express');
const router = express.Router(); 
const chatControllers = require('../controllers/chatControllers');



// DÜZELTME: Rota '/chat' yerine '/' olarak değiştirildi.
// Bu sayede server.js'deki '/api/chat' ile birleşince doğru endpoint olan
// POST /api/chat oluşur.
router.post('/', chatControllers.chatWithGemini); 

// BİLGİ: Koruma (authMiddleware) işlemi server.js'de merkezi olarak yapıldığı için
// burada tekrar eklemeye gerek yok.

module.exports = router;