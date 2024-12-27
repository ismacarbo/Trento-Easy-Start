const axios = require('axios');

let cachedNews = null;
let cacheTimeNews = 0;
const CACHE_DURATION_NEWS = 10 * 60 * 1000;

exports.getNews = async (req, res) => {
    const apiUrl = 'https://www.comune.trento.it/api/opendata/v2/content/search?classes=avviso';

    const currentTime = Date.now();

    if (cachedNews && (currentTime - cacheTimeNews) < CACHE_DURATION_NEWS) {
        console.log('Servendo notizie dalla cache.');
        return res.json(cachedNews);
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Risposta dall\'API esterna:', response.data);

        if (response.data && response.data.searchHits && response.data.searchHits.length > 0) {
            const news2024 = response.data.searchHits
                .map(item => ({
                    id: item.metadata.id,
                    title: item.data['ita-IT'].titolo || 'Titolo non disponibile.',
                    description: item.data['ita-IT'].abstract || 'Nessuna descrizione disponibile.',
                    date: item.metadata.published || 'Data non disponibile.',
                    link: item.metadata.link || '#',
                    type: 'avviso'
                }))
                .filter(notizia => {
                    if (!notizia.date || notizia.date === 'Data non disponibile.') return false;
                    const notiziaDate = new Date(notizia.date);
                    return notiziaDate.getFullYear() === 2023;
                });

            if (news2024.length === 0) {
                console.log('Nessuna notizia trovata per il 2024.');
                return res.status(404).json({ msg: 'Nessuna notizia trovata per il 2024.' });
            }

            cachedNews = news2024;
            cacheTimeNews = currentTime;

            console.log('Notizie 2024 mappate e salvate nella cache:', news2024);
            res.json(news2024);
        } else {
            console.log('Nessuna notizia trovata nell\'API esterna.');
            res.status(404).json({ msg: 'Nessuna notizia trovata.' });
        }
    } catch (error) {
        console.error('Errore nel recupero delle notizie:', error.message);
        res.status(500).json({ msg: 'Errore nel recupero delle notizie.' });
    }
};
