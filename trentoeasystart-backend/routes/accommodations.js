const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    createAccommodation,
    getAllAccommodations,
    getAccommodationById,
    updateAccommodation,
    deleteAccommodation
} = require('../controllers/accommodationController');

router.post('/', auth, createAccommodation);
router.get('/', getAllAccommodations);
router.get('/:id', getAccommodationById);
router.put('/:id', auth, updateAccommodation);
router.delete('/:id', auth, deleteAccommodation);

module.exports = router;
