

const mongoose = require('mongoose');

// --- MongoDB Bağlantısı ---
async function connectDB() {
    try {
        // Bağlantı adresi sabit olarak yazılmak yerine, .env dosyasından okunuyor
        // Bu, hem güvenlik hem de esneklik için en doğru yöntemdir.
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI ortam değişkeni .env dosyasında tanımlanmamış!');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB\'ye başarıyla bağlandı!');
    } catch (err) {
        console.error('MongoDB bağlantı hatası:', err.message);
        // Hatanın çağırana iletilmesini sağla ki sunucu başlangıcında hata yakalanabilsin.
        throw err;
    }
}

// Bağlantıyı kapatma fonksiyonu 
async function closeDB() {
    try {
        await mongoose.connection.close();
        console.log('MongoDB bağlantısı kapatıldı.');
    } catch (err) {
        console.error('MongoDB bağlantısını kapatırken hata oluştu:', err);
    }
}

// --- Post Şeması ve Modeli ---
const postSchema = new mongoose.Schema({
    author: String,
    text: String,
    tags: [String],
    date: { type: Date, default: Date.now },
    view_count: { type: Number, default: 0 }
});

const Post = mongoose.model('Post', postSchema);

// --- CRUD Fonksiyonları ---


async function createPost(author, text, tags) {
    try {
        const post = new Post({ author, text, tags });
        const result = await post.save();
        console.log('Tek belge eklendi:', result.toJSON());
        return result;
    } catch (err) {
        console.error('Belge ekleme hatası:', err);
        throw err;
    }
}

async function getPosts() {
    try {
        const posts = await Post.find();
        console.log('\nTüm belgeler:');
        if (posts.length > 0) {
            posts.forEach(post => console.log(post.toJSON()));
        }
        return posts;
    } catch (err) {
        console.error('Belgeleri getirme hatası:', err);
        throw err;
    }
}

async function getPostsByAuthor(authorName) {
    try {
        const posts = await Post.find({ author: authorName });
        console.log(`\nYazarı '${authorName}' olan belgeler:`);
        if (posts.length > 0) {
            posts.forEach(post => console.log(post.toJSON()));
        }
        return posts;
    } catch (err) {
        console.error('Belgeleri yazara göre getirme hatası:', err);
        throw err;
    }
}

async function updatePost(authorName, newText) {
    try {
        // BİLGİ: updateOne metodu, bulunan ilk belgeyi günceller.
        const result = await Post.updateOne(
            { author: authorName },
            { $set: { text: newText } }
        );
        console.log(`\nGüncellenen belge sayısı: ${result.modifiedCount}`);
        return result;
    } catch (err) {
        console.error('Belge güncelleme hatası:', err);
        throw err;
    }
}

async function deletePost(authorName) {
    try {
        // BİLGİ: deleteOne metodu, bulunan ilk belgeyi siler.
        const result = await Post.deleteOne({ author: authorName });
        console.log(`\nSilinen belge sayısı: ${result.deletedCount}`);
        return result;
    } catch (err) {
        console.error('Belge silme hatası:', err);
        throw err;
    }
}
async function createManyPosts() {
    try {
        const newPosts = [
            { author: "Bob", text: "MongoDB öğrenmek harika!", tags: ["veritabanı", "mongodb", "nodejs"] },
            { author: "Charlie", text: "Merhaba Node.js dünyası!", tags: ["selamlama", "nodejs"] }
        ];
        const results = await Post.insertMany(newPosts);
        console.log('Birden fazla belge eklendi. IDler:', results.map(doc => doc._id));
        return results;
    } catch (err) {
        console.error('Çoklu belge ekleme hatası:', err);
        throw err;
    }
}


// Tüm gerekli fonksiyonları dışa aktar
module.exports = {
    connectDB,
    closeDB,
    createPost,
    getPosts,
    getPostsByAuthor,
    updatePost,
    deletePost,

    createManyPosts,
    Post
};