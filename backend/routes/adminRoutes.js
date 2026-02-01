const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAdmin } = require('../middleware/auth');

router.use(checkAdmin);

router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.delete('/users/:id', adminController.deleteUser);

// Book Management
router.get('/books', adminController.adminGetAllBooks);
router.post('/books', adminController.createBook);
router.put('/books/:id', adminController.updateBook);
router.delete('/books/:id', adminController.deleteBook);

// Category Management
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);

module.exports = router;
