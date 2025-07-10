// models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: { // Bu mesajı gönderen veya alan kullanıcının ID'si
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // User modeline referans, kimlik doğrulama ile ilişkilendirme
    },
    sessionId: { // Bu mesajın hangi sohbet oturumuna ait olduğunu belirtir
        type: String,
        required: true,
        index: true // Performans için index ekledik, oturum bazlı sorgulamalar sık olabilir
    },
    role: { // Mesajın kim tarafından gönderildiği (user veya model)
        type: String,
        enum: ['user', 'model'], // Sadece bu değerlere izin ver
        required: true
    },
    content: { // Mesajın içeriği (text)
        type: String,
        required: true
    },
    createdAt: { // Mesajın oluşturulma tarihi
        type: Date,
        default: Date.now,
        index: true // Tarihe göre sıralama veya filtreleme için index
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;