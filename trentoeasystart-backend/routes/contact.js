const express = require('express');
const router = express.Router();
const { sendContact, getAllContacts } = require('../controllers/contactController');
const auth = require('../middleware/authMiddleware');

router.post('/', sendContact);
router.get('/', auth, getAllContacts);

module.exports = router;
