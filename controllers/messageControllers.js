const Message = require('../models/Messages');
const mongoose = require('mongoose');

const saveMessage = async (userId, sessionId, role, content) => {
  try {
    const newMessage = new Message({
      userId,
      sessionId,
      role,
      content
    });

    await newMessage.save();
    console.log(`Mesaj veritabanına kaydedildi → [${role}]`);
  } catch (error) {
    console.error('Mesaj veritabanına kaydedilirken hata oluştu:', error.message);
  }
};

const getMessagesBySession = async (req, res) => {
    const userId = req.user._id;
    const { sessionId } = req.params;

    if (!sessionId) {
        return res.status(400).json({ message: 'Sohbet oturumu kimliği (sessionId) gerekli.' });
    }

    try {
        const messages = await Message.find({ userId, sessionId })
                                    .sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Mesajlar getirilirken hata oluştu:', error);
        res.status(500).json({ message: 'Mesajlar getirilirken sunucu hatası oluştu.' });
    }
};

const getChatSessionsByUser = async (req, res) => {
    const userId = req.user._id;

    try {
        const sessions = await Message.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $sort: { createdAt: 1 } },
            {
                $group: {
                    _id: "$sessionId",
                    firstMessage: { $first: "$content" },
                    lastMessageAt: { $last: "$createdAt" },
                    messageCount: { $sum: 1 }
                }
            },
            { $sort: { lastMessageAt: -1 } }
        ]);
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Sohbet oturumları getirilirken hata oluştu:', error);
        res.status(500).json({ message: 'Sohbet oturumları getirilirken sunucu hatası oluştu.' });
    }
};



/**
 * Veritabanındaki tüm mesajları getirir.
 * Güvenlik notu: Bu endpoint tüm kullanıcıların tüm mesajlarını döndürdüğü için
 * gerçek bir uygulamada sadece 'admin' gibi özel rollere sahip kullanıcılar tarafından erişilebilir olmalıdır.
 */
const getAllMessages = async (req, res) => {
    try {
        // Message.find({}) -> Filtre olmadan tüm belgeleri bulur.
        // .sort({ createdAt: -1 }) -> Sonuçları en yeniden en eskiye doğru sıralar.
        const messages = await Message.find({}).sort({ createdAt: -1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Tüm mesajlar getirilirken hata oluştu:', error);
        res.status(500).json({ message: 'Tüm mesajlar getirilirken sunucu hatası oluştu.' });
    }
};


module.exports = {
    saveMessage,
    getMessagesBySession,
    getChatSessionsByUser,
    getAllMessages // YENİ FONKSİYONU DIŞA AKTAR
};