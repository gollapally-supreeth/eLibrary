const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { checkAuth } = require('../middleware/auth');

router.get('/', checkAuth, bookController.getAllBooks);
router.get('/categories', checkAuth, bookController.getCategories);
router.get('/favorites', checkAuth, bookController.getFavorites);
router.post('/favorites/:bookId', checkAuth, bookController.addFavorite);
router.delete('/favorites/:bookId', checkAuth, bookController.removeFavorite);

module.exports = router;
