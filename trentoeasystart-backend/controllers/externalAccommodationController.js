const cheerio = require('cheerio');
const axios = require('axios');

let location;

function filter(accommodation, filters ){

    let check = true;
    console.log(accommodation.price, parseInt(filters['maxPrice']));
    
    if(filters['maxPrice'] && accommodation.price && accommodation.price > parseInt(filters['maxPrice']) ){
        check = false;
    }

    if(filters['minPrice'] && accommodation.price && accommodation.price < parseInt(filters['minPrice']) ){
        check = false;
    }

    if (!accommodation.image && !accommodation.description){
        check = false;
    }

    return check;
}

const fetchRentolaListings = async (filters) => {
    const url = 'https://rentola.it/affitto/' + location;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const listings = [];
    $('[data-controller="thumbnail--main"]').each((_, element) => {
        let description = "" ;
        $(element).find('.row')._findBySelector('div').each((i, div) => {
            const $div = $(div);
            if ($div.hasClass('prop-label')) {
                description += $div.text().trim() + ': ';
            } else if ($div.hasClass('prop-value')) {
                description += $div.text().trim() + '   ';
            }
        });

        let accUrl = $(element).find('a').attr('href');
        if (accUrl.indexOf('https://') == -1){ accUrl = 'https://rentola.it' + accUrl; }

        let price;
        try {
            price = parseInt($(element).find('.buttons').text().trim().split(' ')[0].replace('.',''));
        }
        catch {
            price = undefined;
        }

        const accommodation = {
            title: $(element).find('.location-label').text().trim(),
            priceLabel: $(element).find('.buttons').text().trim(),
            price: price,
            location: location.toUpperCase(),
            description: description,
            url: accUrl,
            image: $(element).find('img').attr('data-src')
        };

        if (filter(accommodation, filters)){
            listings.push(accommodation);
        }
        
    });

    return listings;
};

const fetchPhosphoroListings = async (filters) => {
    const url = 'https://www.phosphoro.com/casa/appartamento/' + location + '/offerta/affitto/1';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const listings = [];
    $('.elemento_lista_annunci').each((_, element) => {
        let txt = $(element).find('a').text()
        let title = txt.split('€')[0];
        let priceLabel = 'Non disponibile';
        if (txt.indexOf('€') != -1){
            priceLabel = '€ ' + txt.split('€ ')[1].split(' ')[0].trim();
        }
        let price;
        try {
            console.log($(element)._findBySelector('#prezzo'));
            price = parseInt($(element)._findBySelector('#prezzo').attr('value').replace('.',''));
        }
        catch {
            if (priceLabel == 'Non disponibile'){
                price = undefined;
            }
            else {
                price = parseInt(priceLabel.split(' ')[1].replace('.',''));
            }
        }
        console.log(price)
        
        let description = $(element)._findBySelector('[class="row_description"]').find('p').text();
        let prevImage = $(element)._findBySelector('[class="photo_link"]').attr('resource');
        let accUrl = $(element).find('a').attr('href');
        if (accUrl.indexOf('https://') == -1){
            accUrl = 'https://www.phosphoro.com' + accUrl;
        }

        const accommodation = {
            title: title,
            priceLabel: priceLabel,
            price: price,
            location: location.toUpperCase(),
            description: description,
            url: accUrl,
            image: prevImage
        };

        if (filter(accommodation, filters)){
            listings.push(accommodation);
        }
        
    });

    return listings;
};

exports.fetchExternalListings = async (req, res) => {
    try {
        const filters = req.query;
        location = filters['location'].toLowerCase();
        const rentolaListings = await fetchRentolaListings(filters);
        const phosphoroListings = await fetchPhosphoroListings(filters);

        const combinedListings = [...rentolaListings, ...phosphoroListings];
        res.json(combinedListings);
    } catch (error) {
        console.error('Errore durante lo scraping:', error.message);
        res.status(500).json({ msg: 'Errore durante lo scraping' });
    }
};
