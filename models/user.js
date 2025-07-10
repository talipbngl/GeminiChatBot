// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcryptjs'i içeri aktar

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Kullanıcı adının tekil olmasını sağlar
        trim: true, // Başındaki ve sonundaki boşlukları kaldırır
        minlength: 3 // Minimum 3 karakter uzunluğu
    },
    email: {
        type: String,
        required: true,
        unique: true, // E-posta adresinin tekil olmasını sağlar
        trim: true,
        lowercase: true, // E-postayı her zaman küçük harfe çevirir
        match: [/.+@.+\..+/, 'Lütfen geçerli bir e-posta adresi girin'] // E-posta formatı doğrulama
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum 6 karakter uzunluğu
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware: Kullanıcı kaydedilmeden önce şifreyi hash'le
UserSchema.pre('save', async function(next) {
    // Şifre değiştirilmediyse veya yeni değilse sonraki adıma geç
    if (!this.isModified('password')) {
        return next();
    }
    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10); // Tuz (salt) oluştur
    this.password = await bcrypt.hash(this.password, salt); // Şifreyi tuz ile hash'le
    next();
});

// Instance Method: Şifreleri karşılaştırmak için bir metot ekle
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Girilen şifreyi hashlenmiş şifre ile karşılaştır
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;