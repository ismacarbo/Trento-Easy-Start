const Accommodation = require('../models/Accommodation');

exports.createAccommodation = async (req, res) => {
    const { title, type, description, location, price, images } = req.body;

    try {
        const newAccommodation = new Accommodation({
            title,
            type,
            description,
            location,
            price,
            images,
            postedBy: req.user.id,
        });

        const accommodation = await newAccommodation.save();
        res.json(accommodation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getAllAccommodations = async (req, res) => {
    try {
        const accommodations = await Accommodation.find().populate('postedBy', ['name', 'email']);
        res.json(accommodations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getAccommodationById = async (req, res) => {
    try {
        const accommodation = await Accommodation.findById(req.params.id).populate('postedBy', ['name', 'email']);
        if (!accommodation) {
            return res.status(404).json({ msg: 'Alloggio non trovato' });
        }
        res.json(accommodation);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Alloggio non trovato' });
        }
        res.status(500).send('Server error');
    }
};

exports.updateAccommodation = async (req, res) => {
    const { title, type, description, location, price, images } = req.body;


    const accommodationFields = {};
    if (title) accommodationFields.title = title;
    if (type) accommodationFields.type = type;
    if (description) accommodationFields.description = description;
    if (location) accommodationFields.location = location;
    if (price) accommodationFields.price = price;
    if (images) accommodationFields.images = images;

    try {
        let accommodation = await Accommodation.findById(req.params.id);

        if (!accommodation) {
            return res.status(404).json({ msg: 'Alloggio non trovato' });
        }


        if (accommodation.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Non autorizzato' });
        }

        accommodation = await Accommodation.findByIdAndUpdate(
            req.params.id,
            { $set: accommodationFields },
            { new: true }
        );

        res.json(accommodation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.deleteAccommodation = async (req, res) => {
    try {
        const accommodation = await Accommodation.findById(req.params.id);

        if (!accommodation) {
            return res.status(404).json({ msg: 'Alloggio non trovato' });
        }


        if (accommodation.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Non autorizzato' });
        }

        await accommodation.remove();

        res.json({ msg: 'Alloggio eliminato' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Alloggio non trovato' });
        }
        res.status(500).send('Server error');
    }
};

exports.getAllAccommodations = async (req, res) => {
    const { location, type, minPrice, maxPrice } = req.query;


    let query = {};

    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
        query.type = type;
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
            query.price.$gte = Number(minPrice);
        }
        if (maxPrice) {
            query.price.$lte = Number(maxPrice);
        }
    }

    try {
        const accommodations = await Accommodation.find(query).sort({ datePosted: -1 });
        res.json(accommodations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};