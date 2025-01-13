const axios = require('axios');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const getUpdates = async () => {
    try {
        const response = await axios.get(`https://api.telegram.org/bot7665732013:AAESELbY0HU83yqFrcM9IXT-eHOVOEVw7S4/getUpdates`);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Errore nel recupero degli aggiornamenti:', error);
    }
};

getUpdates();
