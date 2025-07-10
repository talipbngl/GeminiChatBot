// controllers/chatControllers.js

const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
const { performGoogleSearch } = require('../utils/googleSearch');
const database = require('../config/database');
const { saveMessage } = require('./messageControllers');

const chatHistories = new Map();

const initialHistory = [
    {
        role: "user",
        parts: [{ text: `Sen bir yapay zeka asistanısın. Sana 'google_search' adında bir araç sağlanmıştır. Bu araç, internette arama yapar ve sana güncel bilgiler (hava durumu, haberler, gerçek zamanlı veriler, tanımlar vb.) sağlar.
Eğer kullanıcı bilgiye ihtiyacı duyarsa, özellikle de bir şeyin tanımı, açıklaması veya güncel verisi isteniyorsa, **mutlaka google_search aracını kullanarak arama yapmalısın**. Bilmediğin bir şeyi 'bilmiyorum' demek yerine arama yapmayı tercih etmelisin. Arama sonuçları sana sağlanacak ve bu sonuçlara dayanarak kullanıcıya yanıt vereceksin.
Ayrıca, sana veritabanı işlemleri için 'create_post', 'get_posts_by_author', 'update_post', 'delete_post', 'get_all_posts' gibi araçlar da sağlanmıştır.
Eğer kullanıcı bir veri kaydetmek, sorgulamak, güncellemek veya silmek istiyorsa, bunun için uygun veritabanı aracını kullanmalısın. Örneğin, 'bir yazı kaydet' dendiğinde 'create_post' aracını, 'yazılarımı göster' dendiğinde 'get_posts_by_author' aracını kullanabilirsin.
Yanıtlarında, arama sonuçlarında bulduğun tüm ilgili kaynak linklerini (URL'lerini) veya veritabanından aldığın bilgileri, kısa bir açıklama ile birlikte açıkça belirt. **Yaptığın işlemlere veya kullandığın araçlara ait teknik fonksiyon adlarını (örneğin 'get_posts_by_author' veya 'google_search') doğrudan kullanıcıya belirtme. Bu tür teknik detayları daha doğal bir dille ifade et.**
Senden sıralama veya herhangi bir madde gerektiren bir şey istenirse bunları alt satırlara inerek madde madde olarak kullanıcıya göster.
'update_post' vb. fonksiyon isimlerini kullanıcıya gösterme. Unutma, amacın kullanıcıya doğru ve güncel bilgi sağlamaktır.` }]
    },
    {
        role: "model",
        parts: [{ text: "Anladım. Güncel bilgiye, tanımlara veya spesifik bilgilere ihtiyacım olduğunda 'google_search' aracını çağırarak arama yapacağım. Veritabanı işlemleri için ise 'create_post', 'get_posts_by_author', 'update_post', 'delete_post', 'get_all_posts' gibi araçları kullanacağım. Tüm sonuçları ve kaynakları yanıtıma dahil edeceğim. **Yanıtlarımda kullandığım araçların teknik adlarını doğrudan belirtmeyecek, bu işlemleri daha doğal bir şekilde ifade edeceğim.**" }]
    }
];

const chatWithGemini = async (req, res, next) => {
    // API anahtarlarını req.app.locals üzerinden alın
    const { geminiApiKey, googleSearchApiKey, googleSearchCx } = req.app.locals;

    if (!geminiApiKey || !googleSearchApiKey || !googleSearchCx) {
        console.error('Sunucu yapılandırma hatası: API anahtarları eksik.');
        return res.status(500).json({ error: 'Sunucu yapılandırma hatası: API anahtarları eksik.' });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        tools: [{
            functionDeclarations: [
                {
                    name: "google_search",
                    description: "İnternette arama yapar ve güncel bilgiler (hava durumu, haberler, gerçek zamanlı veriler, tanımlar vb.) sağlar. Bu bilgiler modele geri döner.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            query: {
                                type: "STRING",
                                description: "Arama sorgusu.",
                            },
                        },
                        required: ["query"],
                    },
                },
                {
                    name: "create_post",
                    description: "Yeni bir yazı (post) oluşturur ve veritabanına kaydeder. Yazar, içerik ve etiketler gereklidir.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            author: { type: "STRING", description: "Yazının yazarı." },
                            text: { type: "STRING", description: "Yazının içeriği." },
                            tags: { type: "ARRAY", items: { type: "STRING" }, description: "Yazıyla ilgili etiketler (örneğin: 'teknoloji', 'yaşam')." },
                        },
                        required: ["text", "author", "tags"],
                    },
                },
                {
                    name: "get_posts_by_author",
                    description: "Belirli bir yazarın tüm yazılarını veritabanından getirir.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            authorName: { type: "STRING", description: "Aranacak yazarın adı." },
                        },
                        required: ["authorName"],
                    },
                },
                {
                    name: "update_post",
                    description: "Belirli bir yazarın ilk bulunan yazısının içeriğini günceller.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            authorName: { type: "STRING", description: "Yazısı güncellenecek yazarın adı." },
                            newText: { type: "STRING", description: "Yazının yeni içeriği." },
                        },
                        required: ["authorName", "newText"],
                    },
                },
                {
                    name: "delete_post",
                    description: "Belirli bir yazarın ilk bulunan yazısını veritabanından siler.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            authorName: { type: "STRING", description: "Silinecek yazarın adı." },
                        },
                        required: ["authorName"],
                    },
                },
                {
                    name: "get_all_posts",
                    description: "Veritabanındaki tüm yazıları getirir.",
                    parameters: {
                        type: "OBJECT",
                        properties: {},
                    },
                },
            ],
        }],
    });

    const userId = req.user._id;
    const userMessage = req.body.message;
    const sessionId = req.body.sessionId;

    if (!userMessage) {
        return res.status(400).json({ error: 'Mesaj boş olamaz.' });
    }
    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId boş olamaz. Lütfen bir oturum kimliği sağlayın.' });
    }

    try {
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        let sessionData = chatHistories.get(sessionId);

        if (!sessionData) {
            console.log(`Yeni sohbet oturumu başlatılıyor: ${sessionId}`);
            sessionData = {
                history: [...initialHistory],
            };
            chatHistories.set(sessionId, sessionData);
        } else {
            console.log(`Mevcut sohbet oturumu kullanılıyor: ${sessionId}`);
        }

        const chat = model.startChat({
            safetySettings: safetySettings,
            history: sessionData.history,
        });

        await saveMessage(userId, sessionId, 'user', userMessage);

        const result = await chat.sendMessage(userMessage);
        const response = result.response;

        sessionData.history = chat.history;
        chatHistories.set(sessionId, sessionData);

        const functionCalls = response.functionCalls();
        const text = response.text();

        console.log("Modelden gelen yanıt:", JSON.stringify(response.candidates?.[0]?.content, null, 2));

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            let toolResult;

            switch (call.name) {
                case "google_search":
                    console.log("Model 'google_search' fonksiyonunu çağırmak istedi, sorgu:", call.args.query);
                    toolResult = await performGoogleSearch(call.args.query, googleSearchApiKey, googleSearchCx);
                    break;
                case "create_post":
                    console.log("Model 'create_post' fonksiyonunu çağırmak istedi, args:", call.args);
                    toolResult = await database.createPost(call.args.author, call.args.text, call.args.tags);
                    break;
                case "get_posts_by_author":
                    console.log("Model 'get_posts_by_author' fonksiyonunu çağırmak istedi, args:", call.args);
                    toolResult = await database.getPostsByAuthor(call.args.authorName);
                    toolResult = toolResult.map(post => ({ author: post.author, text: post.text, date: post.date, tags: post.tags }));
                    break;
                case "update_post":
                    console.log("Model 'update_post' fonksiyonunu çağırmak istedi, args:", call.args);
                    toolResult = await database.updatePost(call.args.authorName, call.args.newText);
                    break;
                case "delete_post":
                    console.log("Model 'delete_post' fonksiyonunu çağırmak istedi, args:", call.args);
                    toolResult = await database.deletePost(call.args.authorName);
                    break;
                case "get_all_posts":
                    console.log("Model 'get_all_posts' fonksiyonunu çağırmak istedi.");
                    toolResult = await database.getPosts();
                    toolResult = toolResult.map(post => ({ author: post.author, text: post.text, date: post.date, tags: post.tags }));
                    break;
                default:
                    console.warn('Bilinmeyen bir araç çağrısı algılandı:', call.name);
                    return res.status(500).json({ error: `Bilinmeyen bir araç çağrısı algılandı: ${call.name}` });
            }

            console.log(`${call.name} aracından dönen sonuç:`, toolResult);

            const functionResponsePayload = { result: toolResult };
            if (toolResult && toolResult.error) {
                functionResponsePayload.error = toolResult.error;
            }

            const toolResponseResult = await chat.sendMessage([
                {
                    functionResponse: {
                        name: call.name,
                        response: functionResponsePayload,
                    },
                },
            ]);

            sessionData.history = chat.history;
            chatHistories.set(sessionId, sessionData);

            const finalResponseText = toolResponseResult.response.text();
            await saveMessage(userId, sessionId, 'model', finalResponseText);

            const cleanedResponseText = finalResponseText;
            console.log("Araç sonucu modele geri gönderildi. Nihai yanıt alındı:", cleanedResponseText);
            res.json({ reply: cleanedResponseText });

        } else if (text) {
            await saveMessage(userId, sessionId, 'model', text);
            console.log("Model doğrudan metin yanıtı verdi:", text);
            res.json({ reply: text });
        } else {
            console.error("Modelden beklenmedik bir yanıt türü alındı.");
            res.status(500).json({ error: 'Modelden beklenmedik bir yanıt türü alındı.' });
        }

    } catch (error) {
        console.error('API işleme sırasında genel hata:', error);
        if (error.response && error.response.candidates && error.response.candidates[0] && error.response.candidates[0].safetyRatings) {
            res.status(400).json({
                error: 'Mesajınız güvenlik politikaları nedeniyle engellendi.',
                details: error.response.candidates[0].safetyRatings
            });
        } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
            res.status(403).json({ error: 'API anahtarınızın yetkilendirme sorunu olabilir veya Custom Search API etkin değil.', details: error.message });
        } else if (error.message.includes("400") && error.message.includes("cx")) {
            res.status(400).json({ error: 'Programlanabilir Arama Motoru (CX) ID\'niz yanlış veya yapılandırma hatası var.', details: error.message });
        } else {
            res.status(500).json({ error: 'Mesaj işlenirken beklenmeyen bir hata oluştu.', details: error.message });
        }
    }
};


module.exports = {
    chatWithGemini
};