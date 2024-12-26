const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Se vuoi proteggere la rotta
const { fetchExternalListings } = require('../controllers/externalAccommodationController');

router.get('/fetch', fetchExternalListings);


module.exports = router;
