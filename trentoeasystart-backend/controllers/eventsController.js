const axios = require('axios');

let cachedEvents = null;
let cacheTimeEvents = 0;
const CACHE_DURATION_EVENTS = 10 * 60 * 1000; 

exports.getEvents = async (req, res) => {
    const apiUrl = 'https://www.comune.trento.it/api/opendata/v2/content/search?classes=event';

    const currentTime = Date.now();

    if (cachedEvents && (currentTime - cacheTimeEvents) < CACHE_DURATION_EVENTS) {
        console.log('Servendo eventi dalla cache.');
        return res.json(cachedEvents);
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Risposta dall\'API esterna:', response.data);

        if (response.data && response.data.searchHits && response.data.searchHits.length > 0) {
            const events = response.data.searchHits.map(item => ({
                id: item.metadata.id,
                title: item.data['ita-IT'].titolo || 'Titolo non disponibile.',
                description: item.data['ita-IT'].abstract || 'Nessuna descrizione disponibile.',
                date: item.metadata.published || 'Data non disponibile.',
                link: item.metadata.link || '#'
            }));

            cachedEvents = events;
            cacheTimeEvents = currentTime;

            console.log('Eventi mappati e salvati nella cache:', events);
            res.json(events);
        } else {
            console.log('Nessun evento trovato nell\'API esterna.');
            res.status(404).json({ msg: 'Nessun evento trovato.' });
        }
    } catch (error) {
        console.error('Errore nel recupero degli eventi:', error.message);
        res.status(500).json({ msg: 'Errore nel recupero degli eventi.' });
    }
};
