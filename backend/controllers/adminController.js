const User = require('../models/User');
const Book = require('../models/Book');
const Category = require('../models/Category');
const bcrypt = require('bcryptjs');

exports.getStats = async (req, res) => {
    try {
        const [totalUsers, totalBooks, totalCategories] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments(),
            Category.countDocuments()
        ]);
        res.json({ totalUsers, totalBooks, totalCategories });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// User Management
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        res.json(users.map(u => ({ ...u, id: u._id, role: u.isAdmin ? 'admin' : 'user' })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, isAdmin });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// Book Management
exports.adminGetAllBooks = async (req, res) => {
    try {
        const books = await Book.find().lean();
        res.json(books.map(b => ({ ...b, id: b._id })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books' });
    }
};

exports.createBook = async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error creating book' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error updating book' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book' });
    }
};

// Category Management
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().lean();
        res.json(categories.map(c => ({ ...c, id: c._id })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category' });
    }
};
