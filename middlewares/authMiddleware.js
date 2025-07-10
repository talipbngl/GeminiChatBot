// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user'); // User modelini içeri aktar

const protect = async (req, res, next) => {
    console.log('Authorization Header:', req.headers.authorization);
    let token;

    // İstek başlıklarında 'Authorization' ve 'Bearer' token var mı kontrol et
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı al (Bearer TOKEN_STRING)
            token = req.headers.authorization.split(' ')[1];

            // Token yoksa hata döndür (Bu kontrol aslında if (!token) bloğunda da var ama burada da olabilir)
            if (!token) {
                return res.status(401).json({ message: 'Yetkilendirme başarısız, token yok.' });
            }

            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Token'daki ID ile kullanıcıyı bul ve isteğe ekle
            // populate() kullanmak isterseniz, kullanıcının ilişkili alanlarını da getirebilirsiniz.
            req.user = await User.findById(decoded.id).select('-password'); // Şifreyi dahil etme

            // Eğer kullanıcı bulunamazsa (örneğin token eski bir kullanıcıya aitse)
            if (!req.user) {
                return res.status(401).json({ message: 'Yetkilendirme başarısız, kullanıcı bulunamadı.' });
            }

            next(); // Sonraki middleware'e veya rota handler'a geç
        } catch (error) {
            console.error('Token doğrulama hatası:', error);
            // Hata detaylarını production ortamında doğrudan göstermeyin
            res.status(401).json({ message: 'Yetkilendirme başarısız, token geçersiz veya süresi dolmuş.' });
        }
    } else {
        // Authorization başlığı yoksa veya 'Bearer' ile başlamıyorsa
        res.status(401).json({ message: 'Yetkilendirme başarısız, token bulunamadı veya formatı yanlış.' });
    }
};

module.exports = protect; 