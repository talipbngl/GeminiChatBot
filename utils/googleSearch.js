const axios = require('axios'); // HTTP istekleri için axios'u dahil et

// Fonksiyon artık API anahtarlarını parametre olarak alıyor
async function performGoogleSearch(query, googleSearchApiKey, googleSearchCx) {
    console.log(`performGoogleSearch çağrıldı, sorgu: "${query}"`);
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: googleSearchApiKey, // Parametre olarak gelen anahtarı kullan
                cx: googleSearchCx,     // Parametre olarak gelen CX ID'yi kullan
                q: query,
                num: 5 // Kaç sonuç almak istediğinizi belirtebilirsiniz (maks. 10)
            }
        });

        if (response.data && response.data.items) {
            // Sadece snippet'ları değil, linkleri de alıp bir dizi olarak döndürüyoruz.
            const searchResults = response.data.items.map(item => ({
                snippet: item.snippet,
                link: item.link
            }));
            console.log("Arama sonuçları başarıyla alındı:", searchResults.length, "adet.");
            return searchResults; // Artık bir dizi döndürüyor
        } else {
            console.warn("Arama sonuçları bulunamadı veya 'items' boş.");
            return []; // Boş bir dizi döndür
        }
    } catch (error) {
        console.error('performGoogleSearch içinde Google Custom Search API hatası:', error.message);
        if (error.response) {
            console.error('Axios yanıt hatası durumu:', error.response.status);
            console.error('Axios yanıt hata verisi:', error.response.data);
            return { error: `Arama API hatası: ${error.response.status}` }; // Hata durumunda obje döndür
        } else if (error.request) {
            console.error('Axios istek hatası: Yanıt alınamadı.');
            return { error: "Arama API isteği başarısız." };
        } else {
            console.error('Axios yapılandırma veya başka bir hata:', error.message);
            return { error: "Arama API bilinmeyen hata." };
        }
    }
}

module.exports = { performGoogleSearch };
