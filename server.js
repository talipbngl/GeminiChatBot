// server.js

const express = require('express');
const dotenv = require('dotenv');
// DÜZELTME: connectDB fonksiyonu, destructering yöntemiyle daha doğru bir şekilde içeri aktarıldı.
const { connectDB } = require('./config/database.js'); 
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messagesRoutes = require('./routes/messagesRoutes.js');
const authMiddleware = require('./middlewares/authMiddleware');

dotenv.config(); // .env dosyasındaki ortam değişkenlerini yükle

const app = express();
const port = process.env.PORT || 3000;

// Gelen JSON isteklerini ayrıştırmak için middleware
app.use(express.json());

// API anahtarlarını ve CX ID'yi .env dosyasından alın
const geminiApiKey = process.env.GEMINI_API_KEY;
const googleSearchApiKey = process.env.GOOGLE_SEARCH_API_KEY;
const googleSearchCx = process.env.GOOGLE_SEARCH_CX;
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

// Gerekli tüm ortam değişkenlerinin ayarlı olup olmadığını kontrol edin
if (!geminiApiKey || !googleSearchApiKey || !googleSearchCx || !jwtSecret || !jwtExpiresIn) {
    console.error('Hata: Gerekli ortam değişkenleri eksik. Lütfen .env dosyanızı kontrol edin.');
    if (!geminiApiKey) console.error('   - GEMINI_API_KEY eksik.');
    if (!googleSearchApiKey) console.error('   - GOOGLE_SEARCH_API_KEY eksik.');
    if (!googleSearchCx) console.error('   - GOOGLE_SEARCH_CX eksik.');
    if (!jwtSecret) console.error('   - JWT_SECRET eksik.');
    if (!jwtExpiresIn) console.error('   - JWT_EXPIRES_IN eksik.');
    process.exit(1);
}

// API anahtarlarını Express uygulamasının yerel değişkenlerine kaydedin
app.locals.geminiApiKey = geminiApiKey;
app.locals.googleSearchApiKey = googleSearchApiKey;
app.locals.googleSearchCx = googleSearchCx;

// Ana sayfa rotası
app.get('/', (req, res) => {
    res.send('Gemini Bot API çalışıyor! Sohbet için /api/chat adresine POST isteği gönderin.');
});

// --- Rota Tanımlamaları ---
app.use('/api/auth', authRoutes);
// BİLGİ: /api/chat ile başlayan tüm istekler önce authMiddleware'den geçer, sonra chatRoutes'a yönlendirilir.
app.use('/api/chat', authMiddleware, chatRoutes); 
app.use('/api/messages', authMiddleware, messagesRoutes);

// Tanımlanmamış rotalar için 404 hatası
app.use((req, res, next) => {
    res.status(404).json({ message: 'Bilinmeyen rota.' });
});

// Genel hata yakalayıcı middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Sunucuda bir şeyler yanlış gitti!', error: err.message });
});

// Sunucuyu başlatma fonksiyonu
async function startServer() {
    try {
        await connectDB(); // Veritabanı bağlantısı kurulana kadar bekle
        app.listen(port, () => {
            console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
        });
    } catch (error) {
        console.error('Uygulama başlatılırken kritik hata oluştu:', error);
        process.exit(1);
    }
}

startServer(); // Sunucuyu başlat