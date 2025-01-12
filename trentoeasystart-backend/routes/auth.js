const express = require('express');
const router = express.Router();
const  { register, login, getUser, createAdmin, getAllUsers, deleteUser, getUserRegistrationStats } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/', authMiddleware, getUser);

router.post('/createAdmin', authMiddleware, createAdmin);

router.get('/users', authMiddleware, getAllUsers);
router.delete('/users/:id', authMiddleware, deleteUser);
router.get('/users/stats', authMiddleware, getUserRegistrationStats);


module.exports = router;
