# Gemini ChatBot

Google Gemini API kullanılarak geliştirilmiş, Node.js ve Express.js tabanlı yapay zekâ destekli chatbot backend projesidir. Projede kullanıcı kimlik doğrulama, JWT tabanlı yetkilendirme, MongoDB veritabanı bağlantısı, mesaj yönetimi ve Gemini API üzerinden yapay zekâ yanıtı üretme özellikleri bulunmaktadır.

## Proje Hakkında

Bu proje, kullanıcıların metin tabanlı mesaj göndererek yapay zekâ destekli yanıtlar almasını sağlayan bir chatbot API uygulamasıdır. Backend tarafında Express.js kullanılmış, veriler MongoDB üzerinde saklanmış ve kullanıcı güvenliği için JWT authentication yapısı oluşturulmuştur.

Proje modüler bir dosya yapısıyla geliştirilmiştir. Route, controller, middleware, model ve config dosyaları ayrı klasörlerde tutulmuştur. Bu sayede kod okunabilirliği ve sürdürülebilirliği artırılmıştır.

## Özellikler

* Kullanıcı kayıt ve giriş işlemleri
* JWT tabanlı authentication ve authorization
* Şifrelerin bcryptjs ile güvenli şekilde hashlenmesi
* MongoDB ve Mongoose ile veritabanı yönetimi
* Google Gemini API ile yapay zekâ destekli cevap üretimi
* Kullanıcı mesajlarının yönetimi
* Route, controller, middleware ve model yapısına ayrılmış modüler backend mimarisi
* `.env` dosyası ile güvenli ortam değişkeni yönetimi
* Hata yakalama ve temel API güvenlik kontrolleri

## Kullanılan Teknolojiler

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token
* bcryptjs
* dotenv
* Google Generative AI API
* Axios
* Winston
* Nodemon

## Proje Yapısı

```bash
GeminiChatBot/
│
├── config/          # Veritabanı ve yapılandırma dosyaları
├── controllers/     # İş mantığı ve controller dosyaları
├── middlewares/     # Authentication ve middleware dosyaları
├── models/          # MongoDB/Mongoose modelleri
├── routes/          # API route dosyaları
├── utils/           # Yardımcı fonksiyonlar
├── server.js        # Ana sunucu dosyası
├── package.json     # Proje bağımlılıkları ve scriptler
└── .gitignore       # GitHub'a gönderilmeyecek dosyalar
```

## Kurulum

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

### 1. Repoyu klonlayın

```bash
git clone https://github.com/talipbngl/GeminiChatBot.git
```

### 2. Proje klasörüne girin

```bash
cd GeminiChatBot
```

### 3. Bağımlılıkları yükleyin

```bash
npm install
```

### 4. `.env` dosyası oluşturun

Ana dizinde `.env` dosyası oluşturup aşağıdaki değişkenleri ekleyin:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
GOOGLE_SEARCH_CX=your_google_search_cx
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

> Not: API key, JWT secret ve veritabanı bağlantı bilgileri kesinlikle GitHub'a yüklenmemelidir. Bu bilgiler `.env` dosyasında saklanmalıdır.

### 5. Projeyi çalıştırın

Geliştirme ortamında çalıştırmak için:

```bash
npm run dev
```

Sunucu varsayılan olarak şu adreste çalışır:

```bash
http://localhost:3000
```

## API Kullanımı

Ana endpoint:

```http
GET /
```

Başarılı çalıştığında aşağıdaki gibi bir mesaj döner:

```text
Gemini Bot API çalışıyor! Sohbet için /api/chat adresine POST isteği gönderin.
```

Temel route yapısı:

```http
/api/auth
/api/chat
/api/messages
```

`/api/chat` ve `/api/messages` route'ları authentication middleware üzerinden korunmaktadır. Bu endpointlere istek atmak için geçerli JWT token gereklidir.

## Güvenlik

Projede gizli bilgiler `.env` dosyası üzerinden yönetilmektedir. `.gitignore` dosyası sayesinde `.env` ve `node_modules` gibi dosyalar GitHub'a gönderilmez.

Kullanıcı şifreleri düz metin olarak saklanmaz. Şifreler bcryptjs kullanılarak hashlenir. Kullanıcı yetkilendirme işlemleri JWT ile yapılır.

## Geliştirme Notları

Bu proje, yapay zekâ API entegrasyonu, backend mimarisi, kullanıcı authentication sistemi ve MongoDB kullanımı konusunda pratik yapmak amacıyla geliştirilmiştir. Proje geliştirilmeye açıktır.

Gelecekte eklenebilecek özellikler:

* Frontend arayüzü
* Sohbet geçmişi görüntüleme ekranı
* Admin paneli
* Kullanıcı bazlı konuşma geçmişi
* Daha detaylı hata yönetimi
* API dokümantasyonu
* Test yapısı

## Geliştirici

**Talip Bingöl**
Bilgisayar Mühendisliği 3. Sınıf Öğrencisi

GitHub: [talipbngl](https://github.com/talipbngl)
