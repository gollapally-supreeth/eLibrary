const Book = require('../models/Book');
const Category = require('../models/Category');
const User = require('../models/User');

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find().lean();
        const mappedBooks = await Promise.all(books.map(async (book) => {
            let categoryName = 'Uncategorized';
            if (book.categoryId) {
                const categoryDoc = await Category.findById(book.categoryId);
                if (categoryDoc) categoryName = categoryDoc.name;
            }
            return {
                ...book,
                _id: book._id.toString(),
                category: { name: categoryName },
                category_name: categoryName
            };
        }));
        res.json(mappedBooks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().lean();
        const categoriesWithCount = await Promise.all(categories.map(async (category) => {
            const bookCount = await Book.countDocuments({ categoryId: category._id });
            return {
                ...category,
                _id: category._id.toString(),
                book_count: bookCount
            };
        }));
        res.json(categoriesWithCount);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

exports.addFavorite = async (req, res) => {
    try {
        const { bookId } = req.params;
        const user = await User.findById(req.session.userId);
        if (!user.favorites.includes(bookId)) {
            user.favorites.push(bookId);
            await user.save();
        }
        res.json({ message: 'Added to favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Error adding favorite' });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { bookId } = req.params;
        const user = await User.findById(req.session.userId);
        user.favorites = user.favorites.filter(fav => fav.toString() !== bookId);
        await user.save();
        res.json({ message: 'Removed from favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Error removing favorite' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('favorites');
        res.json(user.favorites || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorites' });
    }
};
