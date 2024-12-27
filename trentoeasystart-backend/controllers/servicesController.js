const axios = require('axios');

let cachedServices = null;
let cacheTimeServices = 0;
const CACHE_DURATION_SERVICES = 10 * 60 * 1000; 

exports.getServices = async (req, res) => {
    const apiUrl = 'https://www.comune.trento.it/api/opendata/v2/content/search?classes=servizio';

    const currentTime = Date.now();

    if (cachedServices && (currentTime - cacheTimeServices) < CACHE_DURATION_SERVICES) {
        console.log('Servendo servizi dalla cache.');
        return res.json(cachedServices);
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Risposta dall\'API esterna:', response.data);

        let services = [];
        if (response.data && response.data.searchHits && response.data.searchHits.length > 0) {
            services = response.data.searchHits.map(item => ({
                id: item.metadata.id,
                title: item.data['ita-IT'].titolo || 'Titolo non disponibile.',
                description: item.data['ita-IT'].abstract || 'Nessuna descrizione disponibile.',
                category: item.data['ita-IT'].categoria || 'Categoria non disponibile.',
                link: item.metadata.link || '#'
            }));
        }

        if (services.length === 0) {
            console.log('Nessun servizio trovato.');
            return res.status(404).json({ msg: 'Nessun servizio trovato.' });
        }

        cachedServices = services;
        cacheTimeServices = currentTime;

        console.log('Servizi salvati nella cache:', services);
        res.json(services);
    } catch (error) {
        console.error('Errore nel recupero dei servizi:', error.message);
        res.status(500).json({ msg: 'Errore nel recupero dei servizi.' });
    }
};
