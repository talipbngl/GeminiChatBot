

const User = require('../models/user'); // User modelini içeri aktar
const jwt = require('jsonwebtoken'); // jsonwebtoken'ı içeri aktar

// JWT Token oluşturma fonksiyonu (Yardımcı Fonksiyon)
const generateToken = (id) => {
    // JWT_SECRET ve JWT_EXPIRES_IN değerlerini .env dosyanızdan alacağız
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN // Token'ın ne kadar süre geçerli olacağı
    });
};

// --- Kullanıcı Kayıt Olma (Register) Fonksiyonu ---
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Kullanıcı adı veya e-posta zaten mevcut mu kontrol et
        const userExists = await User.findOne({ $or: [{ username }, { email }] });

        if (userExists) {
            return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten kullanımda.' });
        }

        // Yeni kullanıcı oluştur
        const user = await User.create({
            username,
            email,
            password // Şifre, User modelindeki pre('save') middleware'i ile hash'lenecek
        });

        if (user) {
            // Başarılı olursa token oluştur ve gönder
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id) // Token oluştur
            });
        } else {
            res.status(400).json({ message: 'Kullanıcı oluşturulamadı.' });
        }
    } catch (error) {
        console.error('Kayıt olma hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' });
    }
};

// --- Kullanıcı Giriş Yapma (Login) Fonksiyonu ---
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // E-posta ile kullanıcıyı bul
        const user = await User.findOne({ email });

        // Kullanıcı mevcut değilse veya şifre eşleşmiyorsa hata döndür
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        // Başarılı giriş: Token oluştur ve gönder
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id) // Token oluştur
        });
    } catch (error) {
        console.error('Giriş yapma hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' });
    }
};

module.exports = {
    registerUser,
    loginUser
};