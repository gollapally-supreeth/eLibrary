require('dotenv').config();

// Debug: Check if dotenv loaded properly
console.log('🔍 Environment Variables Debug:');
console.log('- .env file loaded:', process.env.MONGODB_URI ? '✅' : '❌');
console.log('- PORT:', process.env.PORT || 'using default');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');

// Validate critical environment variables
if (!process.env.MONGODB_URI) {
    console.error('❌ Critical Error: MONGODB_URI is missing from environment variables');
    console.error('Please ensure your .env file exists and contains MONGODB_URI');
    console.error('Current working directory:', process.cwd());
    console.error('Environment variables loaded:', Object.keys(process.env).filter(key => key.includes('MONGO')));
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware order is important
app.use(express.json());
app.use(cors({
    origin: true, // Allow all origins temporarily for testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    },
    name: 'sessionId'
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Add this middleware to handle preflight requests
app.options('*', cors());

// Set landing page as the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Serve static files after setting up the root route
app.use(express.static('public'));

// Add this near the top of the file, after middleware setup
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});

// Connect to MongoDB Atlas
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI defined:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI (first 20 chars):', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'undefined');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not defined!');
    console.error('Please check your .env file and ensure MONGODB_URI is set correctly.');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        console.error('Connection string (first 20 chars):', mongoUri.substring(0, 20) + '...');
        process.exit(1);
    });

// Define Book Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    bookUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    categoryId: { type: String }, // Remove default null
    createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

// Define User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: { type: String, select: false }, // This makes password excluded by default
    isAdmin: Boolean,
    avatarSeed: { type: String, default: 'default' }, // Added avatarSeed field
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] // Array of book IDs
});

const User = mongoose.model('User', userSchema);

// Add Category Schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

// Add Settings Schema
const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    lastUpdated: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Admin Routes
app.get('/api/admin/stats', async (req, res) => {
    try {
        if (!req.session.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        const totalBooks = await Book.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalCategories = await Category.countDocuments();
        
        res.json({
            totalBooks,
            totalUsers,
            totalCategories
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Authentication aware routes
app.get('/dashboard', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        if (req.session.isAdmin) {
            res.redirect('/admin-dashboard.html');
        } else {
            res.redirect('/user-portal.html');
        }
    } else {
        res.redirect('/login.html');
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            isAdmin: false, // ensure regular users are not admins
            avatarSeed: username // Initialize avatarSeed with username
        });

        await user.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error during user registration:', error); // Log the actual error
        res.status(500).json({ message: 'Error registering user', details: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });

        // Check for admin credentials
        if (email === 'admin@gmail.com' && password === 'admin2811') {
            req.session.userId = 'admin';
            req.session.isAdmin = true;
            req.session.isAuthenticated = true;

            console.log('Admin login successful');
            return res.json({
                message: 'Login successful',
                isAdmin: true,
                redirectUrl: '/admin-dashboard.html'
            });
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        console.log('Found user:', { 
            exists: !!user, 
            email: user?.email,
            hasPassword: !!user?.password
        });
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password validation:', {
            inputPassword: password,
            isValid: validPassword
        });

        if (!validPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set session data based on user's actual isAdmin value
        req.session.userId = user._id;
        req.session.isAdmin = user.isAdmin; // Use the actual isAdmin value from database
        req.session.isAuthenticated = true;

        console.log('Session created:', {
            userId: req.session.userId,
            isAdmin: req.session.isAdmin,
            isAuthenticated: req.session.isAuthenticated
        });

        // Save session before sending response
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ message: 'Error saving session' });
            }

            // Redirect based on user's admin status
            const redirectUrl = user.isAdmin ? '/admin-dashboard.html' : '/user-portal.html';
            
            res.json({
                message: 'Login successful',
                isAdmin: user.isAdmin,
                redirectUrl: redirectUrl
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Update the checkAuth middleware
const checkAuth = (req, res, next) => {
    console.log('Session data:', req.session);
    
    if (req.session && req.session.isAuthenticated) {
        return next();
    }

    // For API requests
    if (req.xhr || req.path.startsWith('/api/')) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    // For page requests
    res.redirect('/login.html');
};

// Add auth status endpoint
app.get('/api/auth/status', (req, res) => {
    res.json({ authenticated: !!req.session.isAuthenticated });
});

// Protect routes
app.get('/user-portal.html', checkAuth, (req, res, next) => {
    if (req.session.isAdmin) {
        // If an admin somehow tries to access user portal, redirect to their dashboard
        res.redirect('/admin-dashboard.html');
    } else {
        // Serve the user portal file
        res.sendFile(path.join(__dirname, 'public', 'user-portal.html'));
    }
});

// Route for all authenticated users to get categories
app.get('/api/categories', checkAuth, async (req, res) => {
    try {
        const categories = await Category.find().lean();
        
        // Get book count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const bookCount = await Book.countDocuments({ categoryId: category._id });
                return {
                    ...category,
                    _id: category._id.toString(),
                    book_count: bookCount
                };
            })
        );
        
        res.json(categoriesWithCount);
    } catch (error) {
        console.error('Error fetching categories for user:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

app.get('/api/books', checkAuth, async (req, res) => {
    try {
        console.log('📚 Books endpoint hit by user:', req.session.userId);
        console.log('📚 User authenticated:', req.session.isAuthenticated);
        
        console.log('📚 Attempting to find books...');
        const books = await Book.find().lean();
        console.log('📚 Found books in database:', books.length);
        
        if (books.length > 0) {
            console.log('📚 Sample book:', books[0]);
        }
        
        console.log('📚 Starting category mapping...');
        // Fetch category names for books that have categoryId
        const mappedBooks = await Promise.all(books.map(async (book, index) => {
            console.log(`📚 Processing book ${index + 1}/${books.length}: ${book.title}`);
            let categoryName = 'Uncategorized';
            
            if (book.categoryId) {
                try {
                    console.log('📚 Looking up category:', book.categoryId);
                    const categoryDoc = await Category.findById(book.categoryId);
                    if (categoryDoc) {
                        categoryName = categoryDoc.name;
                        console.log('📚 Found category:', categoryName);
                    } else {
                        console.log('📚 Category not found for ID:', book.categoryId);
                    }
                } catch (error) {
                    console.log('📚 Error fetching category for book:', book.title, error.message);
                }
            }
            
            const mappedBook = {
                ...book,
                _id: book._id.toString(),
                category: { name: categoryName }, // Structure expected by frontend
                category_name: categoryName
            };
            
            console.log(`📚 Mapped book ${index + 1}:`, mappedBook.title, 'Category:', categoryName);
            return mappedBook;
        }));
        
        console.log('📚 Category mapping complete');
        console.log('📚 Returning mapped books:', mappedBooks.length);
        res.json(mappedBooks);
    } catch (error) {
        console.error('📚 Error fetching books:', error);
        console.error('📚 Error stack:', error.stack);
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
});

// Protect the book creation route
app.post('/api/books', checkAuth, async (req, res) => {
    try {
        const { title, author, genre } = req.body;
        const newBook = new Book({ title, author, genre });
        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).json({ message: 'Error creating book' });
    }
});

// Add this new route for fetching user profile data
app.get('/api/user/profile', checkAuth, async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated or session expired' });
        }

        const user = await User.findById(req.session.userId).select('username email avatarSeed favorites');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            username: user.username,
            email: user.email,
            avatarSeed: user.avatarSeed,
            favorites: user.favorites || [] // Return user's favorite book IDs
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile', details: error.message });
    }
});

// New route to update user avatar
app.put('/api/user/profile/avatar', checkAuth, async (req, res) => {
    try {
        const { avatarSeed } = req.body;
        if (!avatarSeed) {
            return res.status(400).json({ message: 'Avatar seed is required' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.avatarSeed = avatarSeed;
        await user.save();

        res.json({ message: 'Avatar updated successfully', avatarSeed });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Error updating avatar', details: error.message });
    }
});

// Favorites endpoints
app.post('/api/user/favorites/:bookId', checkAuth, async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.session.userId;

        // Verify book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Add to favorites if not already there
        const user = await User.findById(userId);
        if (!user.favorites.includes(bookId)) {
            user.favorites.push(bookId);
            await user.save();
        }

        res.json({ message: 'Book added to favorites', favorites: user.favorites });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: 'Error adding favorite' });
    }
});

app.delete('/api/user/favorites/:bookId', checkAuth, async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.session.userId;

        // Remove from favorites
        const user = await User.findById(userId);
        user.favorites = user.favorites.filter(fav => fav.toString() !== bookId);
        await user.save();

        res.json({ message: 'Book removed from favorites', favorites: user.favorites });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Error removing favorite' });
    }
});

app.get('/api/user/favorites', checkAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId).populate('favorites');
        
        res.json(user.favorites || []);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Error fetching favorites' });
    }
});

// Update the checkAdmin middleware
const checkAdmin = (req, res, next) => {
    console.log('Checking admin session:', req.session);
    
    if (req.session && req.session.isAuthenticated && req.session.isAdmin) {
        return next();
    }

    // Set proper headers for API responses
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ message: 'Admin access required' });
};

// --- COMPLETE ADMIN BACKEND REWRITE ---

// Helper function to map MongoDB _id to id and handle populated fields
function mapDocumentToResponse(doc) {
    if (!doc) return null;
    if (Array.isArray(doc)) return doc.map(mapDocumentToResponse);
    
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    
    // Handle populated category field for books
    if (obj.category && obj.category._id) {
        obj.category_name = obj.category.name;
        obj.category_id = obj.category._id.toString();
        obj.category.id = obj.category._id.toString();
        delete obj.category._id;
        delete obj.category.__v;
    }
    
    return obj;
}

// --- ADMIN STATISTICS ---
app.get('/api/admin/stats', checkAdmin, async (req, res) => {
    try {
        const [totalUsers, totalBooks, totalCategories] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments(),
            Category.countDocuments()
        ]);
        
        res.json({
            totalUsers,
            totalBooks,
            totalCategories
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// --- ADMIN USERS CRUD ---
app.get('/api/admin/users', checkAdmin, async (req, res) => {
    try {
        const { search, role } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role) {
            query.isAdmin = role === 'admin';
        }
        
        const users = await User.find(query).select('-password').lean();
        const mappedUsers = users.map(user => ({
            ...user,
            id: user._id.toString(),
            role: user.isAdmin ? 'admin' : 'user',
            created_at: user.createdAt || new Date()
        }));
        
        res.json(mappedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

app.get('/api/admin/users/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        const user = await User.findById(req.params.id).select('-password').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const mappedUser = {
            ...user,
            id: user._id.toString(),
            role: user.isAdmin ? 'admin' : 'user'
        };
        
        res.json(mappedUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

app.post('/api/admin/users', checkAdmin, async (req, res) => {
    try {
        const { username, email, password, isAdmin } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            isAdmin: Boolean(isAdmin),
            createdAt: new Date()
        });
        
        const savedUser = await user.save();
        const userResponse = await User.findById(savedUser._id).select('-password').lean();
        
        const mappedUser = {
            ...userResponse,
            id: userResponse._id.toString(),
            role: userResponse.isAdmin ? 'admin' : 'user'
        };
        
        res.status(201).json(mappedUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', details: error.message });
    }
});

app.put('/api/admin/users/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        const { username, email, password, isAdmin } = req.body;
        const updateData = {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            isAdmin: Boolean(isAdmin)
        };
        
        if (password && password.trim()) {
            updateData.password = await bcrypt.hash(password.trim(), 10);
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, select: '-password' }
        ).lean();
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const mappedUser = {
            ...updatedUser,
            id: updatedUser._id.toString(),
            role: updatedUser.isAdmin ? 'admin' : 'user'
        };
        
        res.json(mappedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

app.delete('/api/admin/users/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        if (req.params.id === req.session.userId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// --- ADMIN BOOKS CRUD ---
app.get('/api/admin/books', checkAdmin, async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category) {
            query.categoryId = category;
        }
        
        const books = await Book.find(query).lean();
        
        // Fetch category names for books that have categoryId
        const mappedBooks = await Promise.all(books.map(async (book) => {
            let categoryName = 'Uncategorized';
            let categoryId = null;
            
            if (book.categoryId) {
                try {
                    const categoryDoc = await Category.findById(book.categoryId);
                    if (categoryDoc) {
                        categoryName = categoryDoc.name;
                        categoryId = book.categoryId;
                    }
                } catch (error) {
                    console.log('Error fetching category for book:', book.title, error.message);
                }
            }
            
            return {
                ...book,
                id: book._id.toString(),
                category_name: categoryName,
                category_id: categoryId
            };
        }));
        
        res.json(mappedBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

app.get('/api/admin/books/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid book ID format' });
        }
        
        const book = await Book.findById(req.params.id).lean();
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        // Fetch category name if categoryId exists
        let categoryName = 'Uncategorized';
        if (book.categoryId) {
            try {
                const categoryDoc = await Category.findById(book.categoryId);
                if (categoryDoc) {
                    categoryName = categoryDoc.name;
                }
            } catch (error) {
                console.log('Error fetching category for book:', book.title, error.message);
            }
        }
        
        const mappedBook = {
            ...book,
            id: book._id.toString(),
            category_id: book.categoryId,
            category_name: categoryName,
            cover_image_url: book.imageUrl,
            book_url: book.bookUrl
        };
        
        res.json(mappedBook);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Error fetching book details' });
    }
});

// COMPLETELY REWRITTEN BOOK CREATION WITH MAXIMUM DEBUG
app.post('/api/admin/books', checkAdmin, async (req, res) => {
    try {
        const { title, author, bookUrl, imageUrl, category } = req.body;
        
        if (!title || !author || !bookUrl || !imageUrl) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Check if categories exist
        const allCategories = await Category.find({});
        if (allCategories.length === 0) {
            return res.status(400).json({ message: 'No categories exist. Create categories first.' });
        }
        
        // Process the category
        let finalCategoryId = null;
        
        if (category) {
            const categoryStr = String(category).trim();
            
            if (categoryStr && categoryStr !== 'null' && categoryStr !== 'undefined' && categoryStr !== '') {
                if (mongoose.Types.ObjectId.isValid(categoryStr)) {
                    const categoryDoc = await Category.findById(categoryStr);
                    if (categoryDoc) {
                        finalCategoryId = categoryStr;
                    } else {
                        return res.status(400).json({ message: 'Category not found in database' });
                    }
                } else {
                    return res.status(400).json({ message: 'Invalid category ID format' });
                }
            }
        }
        
        // Create the book object
        const bookData = {
            title: title.trim(),
            author: author.trim(),
            bookUrl: bookUrl.trim(),
            imageUrl: imageUrl.trim()
        };
        
        // Only add categoryId if we have a valid one
        if (finalCategoryId) {
            bookData.categoryId = finalCategoryId;
        }
        
        // Save to database
        const book = new Book(bookData);
        const savedBook = await book.save();
        
        // Fetch category name for response
        let categoryName = 'Uncategorized';
        if (savedBook.categoryId) {
            try {
                const categoryDoc = await Category.findById(savedBook.categoryId);
                if (categoryDoc) {
                    categoryName = categoryDoc.name;
                }
            } catch (error) {
                console.log('Error fetching category name:', error.message);
            }
        }
        
        // Prepare response
        const response = {
            ...savedBook.toObject(),
            id: savedBook._id.toString(),
            category_name: categoryName,
            category_id: savedBook.categoryId
        };
        
        res.status(201).json(response);
        
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ message: 'Error creating book', details: error.message });
    }
});

app.put('/api/admin/books/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid book ID format' });
        }
        
        const { title, author, bookUrl, imageUrl, category } = req.body;
        
        if (!title || !author || !bookUrl || !imageUrl) {
            return res.status(400).json({ message: 'Title, author, book URL, and image URL are required' });
        }
        
        const updateData = {
            title: title.trim(),
            author: author.trim(),
            bookUrl: bookUrl.trim(),
            imageUrl: imageUrl.trim()
        };
        
        // Enhanced category validation for updates - use categoryId
        if (category !== undefined) {
            const categoryValue = category ? category.toString().trim() : '';
            
            if (categoryValue && categoryValue !== '' && categoryValue !== 'null' && categoryValue !== 'undefined') {
                if (mongoose.Types.ObjectId.isValid(categoryValue)) {
                    // Verify category exists in database
                    const categoryExists = await Category.findById(categoryValue);
                    if (categoryExists) {
                        updateData.categoryId = categoryValue; // Store as categoryId instead of category
                    } else {
                        return res.status(400).json({ message: 'Selected category does not exist' });
                    }
                } else {
                    return res.status(400).json({ message: 'Invalid category ID format' });
                }
            } else {
                updateData.categoryId = null;
            }
        }
        
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).lean();
        
        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        // Fetch category name for response
        let categoryName = 'Uncategorized';
        if (updatedBook.categoryId) {
            try {
                const categoryDoc = await Category.findById(updatedBook.categoryId);
                if (categoryDoc) {
                    categoryName = categoryDoc.name;
                }
            } catch (error) {
                console.log('Error fetching category name for response:', error.message);
            }
        }
        
        const mappedBook = {
            ...updatedBook,
            id: updatedBook._id.toString(),
            category_name: categoryName,
            category_id: updatedBook.categoryId
        };
        
        res.json(mappedBook);
    } catch (error) {
        console.error('❌ Error updating book:', error);
        res.status(500).json({ message: 'Error updating book' });
    }
});

app.delete('/api/admin/books/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid book ID format' });
        }
        
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Error deleting book' });
    }
});

// --- ADMIN CATEGORIES CRUD ---
app.get('/api/admin/categories', checkAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        const categories = await Category.find(query).lean();
        
        // Get book count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const bookCount = await Book.countDocuments({ categoryId: category._id });
                console.log(`Category ${category.name}: ${bookCount} books`); // Debug log
                return {
                    ...category,
                    id: category._id.toString(),
                    book_count: bookCount
                };
            })
        );
        
        res.json(categoriesWithCount);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

app.get('/api/admin/categories/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid category ID format' });
        }
        
        const category = await Category.findById(req.params.id).lean();
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        const bookCount = await Book.countDocuments({ category: category._id });
        const mappedCategory = {
            ...category,
            id: category._id.toString(),
            book_count: bookCount
        };
        
        res.json(mappedCategory);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category details' });
    }
});

app.post('/api/admin/categories', checkAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        
        const category = new Category({
            name: name.trim(),
            description: description ? description.trim() : '',
            createdAt: new Date()
        });
        
        const savedCategory = await category.save();
        const mappedCategory = {
            ...savedCategory.toObject(),
            id: savedCategory._id.toString(),
            book_count: 0
        };
        
        res.status(201).json(mappedCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category', details: error.message });
    }
});

app.put('/api/admin/categories/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid category ID format' });
        }
        
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        
        const updateData = {
            name: name.trim(),
            description: description ? description.trim() : ''
        };
        
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).lean();
        
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        const bookCount = await Book.countDocuments({ category: updatedCategory._id });
        const mappedCategory = {
            ...updatedCategory,
            id: updatedCategory._id.toString(),
            book_count: bookCount
        };
        
        res.json(mappedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Error updating category' });
    }
});

app.delete('/api/admin/categories/:id', checkAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid category ID format' });
        }
        
        // Check if category has books
        const bookCount = await Book.countDocuments({ category: req.params.id });
        if (bookCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete category. It contains ${bookCount} book(s). Please reassign or delete the books first.` 
            });
        }
        
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category' });
    }
});

// Add Settings Routes
app.get('/api/admin/settings', checkAdmin, async (req, res) => {
    try {
        const settings = await Settings.find({}).lean();
        const settingsObj = {};
        
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        // Provide default values if settings don't exist
        const defaultSettings = {
            siteName: settingsObj.siteName || 'eLibrary',
            siteDescription: settingsObj.siteDescription || 'Digital Library Management System',
            maintenanceMode: settingsObj.maintenanceMode || false,
            allowRegistration: settingsObj.allowRegistration || true,
            maxBooksPerUser: settingsObj.maxBooksPerUser || 5,
            emailSettings: settingsObj.emailSettings || {
                emailServer: '',
                emailPort: '587',
                emailUser: '',
                emailPassword: '',
                enableEmail: false
            },
            backupSettings: settingsObj.backupSettings || {
                autoBackup: false,
                backupFrequency: 'daily',
                backupTime: '02:00',
                retentionDays: 30
            }
        };

        res.json(defaultSettings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

app.post('/api/admin/settings', checkAdmin, async (req, res) => {
    try {
        const { settings } = req.body;
        
        if (!settings) {
            return res.status(400).json({ message: 'Settings data is required' });
        }

        const updatedSettings = {};

        // Process each setting
        for (const [key, value] of Object.entries(settings)) {
            await Settings.findOneAndUpdate(
                { key },
                { key, value, lastUpdated: new Date() },
                { upsert: true, new: true }
            );
            updatedSettings[key] = value;
        }

        // Handle special cases
        if (settings.emailSettings && settings.emailSettings.enableEmail) {
            try {
                await configureEmailTransporter(settings.emailSettings);
            } catch (error) {
                console.warn('Email configuration failed:', error.message);
            }
        }

        if (settings.backupSettings && settings.backupSettings.autoBackup) {
            scheduleBackup(settings.backupSettings);
        }

        res.json({ 
            message: 'Settings updated successfully',
            settings: updatedSettings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
});

app.post('/api/admin/settings/test-email', checkAdmin, async (req, res) => {
    try {
        const { emailSettings } = req.body;
        
        if (!emailSettings || !emailSettings.emailUser || !emailSettings.emailPassword) {
            return res.status(400).json({ message: 'Email settings are incomplete' });
        }

        const testTransporter = nodemailer.createTransporter({
            host: emailSettings.emailServer,
            port: parseInt(emailSettings.emailPort),
            secure: emailSettings.emailPort === '465',
            auth: {
                user: emailSettings.emailUser,
                pass: emailSettings.emailPassword
            }
        });

        await testTransporter.verify();
        
        await testTransporter.sendMail({
            from: emailSettings.emailUser,
            to: emailSettings.emailUser,
            subject: 'eLibrary Email Test',
            text: 'This is a test email from your eLibrary system.',
            html: '<h1>eLibrary Email Test</h1><p>This is a test email from your eLibrary system. Email configuration is working correctly!</p>'
        });

        res.json({ message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ message: 'Error sending test email: ' + error.message });
    }
});

// --- BACKUP MANAGEMENT ---
app.post('/api/admin/backup/create', checkAdmin, async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        const [users, books, categories, settings] = await Promise.all([
            User.find({}).select('-password').lean(),
            Book.find({}).populate('category').lean(),
            Category.find({}).lean(),
            Settings.find({}).lean()
        ]);

        const backup = {
            timestamp,
            version: '1.0',
            data: {
                users: users.map(u => ({ ...u, id: u._id.toString() })),
                books: books.map(b => ({ ...b, id: b._id.toString() })),
                categories: categories.map(c => ({ ...c, id: c._id.toString() })),
                settings
            },
            stats: {
                totalUsers: users.length,
                totalBooks: books.length,
                totalCategories: categories.length
            }
        };

        const backupJson = JSON.stringify(backup, null, 2);
        const backupDir = path.join(__dirname, 'backups');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const filename = `backup-${timestamp}.json`;
        const filepath = path.join(backupDir, filename);
        fs.writeFileSync(filepath, backupJson);

        res.json({ 
            message: 'Backup created successfully',
            filename,
            size: Buffer.byteLength(backupJson, 'utf8'),
            stats: backup.stats
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ message: 'Error creating backup' });
    }
});

app.get('/api/admin/backup/list', checkAdmin, async (req, res) => {
    try {
        const backupDir = path.join(__dirname, 'backups');
        
        if (!fs.existsSync(backupDir)) {
            return res.json({ backups: [] });
        }

        const files = fs.readdirSync(backupDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filepath = path.join(backupDir, file);
                const stats = fs.statSync(filepath);
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => b.created - a.created);

        res.json({ backups: files });
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({ message: 'Error listing backups' });
    }
});

// --- SYSTEM MONITORING ---
app.get('/api/admin/system/status', checkAdmin, async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
        
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();

        res.json({
            server: {
                status: 'running',
                uptime: Math.floor(uptime),
                memory: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
                }
            },
            database: {
                status: dbStatus,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            },
            lastChecked: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error checking system status:', error);
        res.status(500).json({ message: 'Error checking system status' });
    }
});

// --- ENHANCED REPORTS AND ANALYTICS ---
app.get('/api/admin/reports/summary', checkAdmin, async (req, res) => {
    try {
        const [
            totalUsers,
            totalBooks,
            totalCategories,
            recentUsers,
            recentBooks,
            categoryStats,
            userRegistrations
        ] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments(),
            Category.countDocuments(),
            User.find({}).sort({ createdAt: -1 }).limit(5).select('username email createdAt').lean(),
            Book.find({}).sort({ createdAt: -1 }).limit(5).populate('category').lean(),
            Category.aggregate([
                {
                    $lookup: {
                        from: 'books',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'books'
                    }
                },
                {
                    $project: {
                        name: 1,
                        bookCount: { $size: '$books' }
                    }
                },
                { $sort: { bookCount: -1 } }
            ]),
            User.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
                { $limit: 7 }
            ])
        ]);

        res.json({
            overview: {
                totalUsers,
                totalBooks,
                totalCategories,
                avgBooksPerCategory: totalCategories > 0 ? Math.round(totalBooks / totalCategories) : 0
            },
            recentActivity: {
                users: recentUsers.map(u => ({ ...u, id: u._id.toString() })),
                books: recentBooks.map(b => ({ ...b, id: b._id.toString() }))
            },
            categoryDistribution: categoryStats.map(c => ({ ...c, id: c._id.toString() })),
            userRegistrations: userRegistrations.reverse()
        });
    } catch (error) {
        console.error('Error generating summary report:', error);
        res.status(500).json({ message: 'Error generating summary report' });
    }
});

app.get('/api/admin/reports/activity', checkAdmin, async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        let dateFilter = new Date();
        
        switch (period) {
            case '24h':
                dateFilter.setHours(dateFilter.getHours() - 24);
                break;
            case '7d':
                dateFilter.setDate(dateFilter.getDate() - 7);
                break;
            case '30d':
                dateFilter.setDate(dateFilter.getDate() - 30);
                break;
            case '90d':
                dateFilter.setDate(dateFilter.getDate() - 90);
                break;
        }

        const [newUsers, newBooks, newCategories] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: dateFilter } }),
            Book.countDocuments({ createdAt: { $gte: dateFilter } }),
            Category.countDocuments({ createdAt: { $gte: dateFilter } })
        ]);

        res.json({
            period,
            metrics: {
                newUsers,
                newBooks,
                newCategories,
                totalActivity: newUsers + newBooks + newCategories
            }
        });
    } catch (error) {
        console.error('Error generating activity report:', error);
        res.status(500).json({ message: 'Error generating activity report' });
    }
});

// Add logout route
app.post('/api/logout', (req, res) => {
    console.log(`Logout attempt. Session ID: ${req.sessionID}, Authenticated: ${req.session ? req.session.isAuthenticated : 'No session'}`);
    try {
        if (req.session && req.session.isAuthenticated) {
            const userId = req.session.userId; // Capture for logging
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session for user:', userId, err);
                    // Ensure a JSON response for the client to parse
                    return res.status(500).json({ message: 'Logout failed: Could not destroy session.', details: err.message });
                } else {
                    console.log('Session destroyed successfully for user:', userId);
                    // Clear the session cookie with appropriate options
                    // Match options used when setting the cookie (path, httpOnly, secure)
                    const cookieOptions = {
                        path: '/',
                        httpOnly: true,
                        secure: req.app.get('env') === 'production' // Or false if always HTTP
                    };
                    res.clearCookie('sessionId', cookieOptions);
                    return res.status(200).json({ message: 'Logged out successfully', redirectUrl: '/login.html' });
                }
            });
        } else {
            console.warn('Logout attempt with no active or authenticated session.');
            // If no session, or not authenticated, effectively already logged out.
            // Still try to clear cookie and redirect to login.
            const cookieOptions = {
                path: '/',
                httpOnly: true,
                secure: req.app.get('env') === 'production' // Or false if always HTTP
            };
            res.clearCookie('sessionId', cookieOptions);
            return res.status(200).json({ message: 'No active session or already logged out.', redirectUrl: '/login.html' });
        }
    } catch (error) {
        // This outer catch handles unexpected errors, e.g., if req.session itself is problematic
        console.error('Critical error in /api/logout route:', error);
        return res.status(500).json({ message: 'Critical server error during logout.', details: error.message });
    }
});

// DEBUG ENDPOINT - Check what's actually in the database
app.get('/api/admin/raw-books', checkAdmin, async (req, res) => {
    try {
        const books = await Book.find({}).lean();
        console.log('📊 RAW BOOKS FROM DATABASE:');
        books.forEach((book, index) => {
            console.log(`📊 Book ${index + 1}:`);
            console.log(`   - Title: ${book.title}`);
            console.log(`   - CategoryId: ${book.categoryId} (type: ${typeof book.categoryId})`);
            console.log(`   - Full object:`, book);
        });
        res.json(books);
    } catch (error) {
        console.error('📊 Error fetching raw books:', error);
        res.status(500).json({ error: error.message });
    }
});

// DEBUG ENDPOINT - Check categories
app.get('/api/admin/raw-categories', checkAdmin, async (req, res) => {
    try {
        const categories = await Category.find({}).lean();
        console.log('📊 RAW CATEGORIES FROM DATABASE:');
        categories.forEach((cat, index) => {
            console.log(`📊 Category ${index + 1}:`);
            console.log(`   - Name: ${cat.name}`);
            console.log(`   - ID: ${cat._id} (type: ${typeof cat._id})`);
            console.log(`   - Full object:`, cat);
        });
        res.json(categories);
    } catch (error) {
        console.error('📊 Error fetching raw categories:', error);
        res.status(500).json({ error: error.message });
    }
});

// EMERGENCY DEBUG ENDPOINT - Test category assignment directly
app.post('/api/admin/test-book', checkAdmin, async (req, res) => {
    try {
        console.log('🔥 EMERGENCY DEBUG - RAW REQUEST BODY:', req.body);
        console.log('🔥 EMERGENCY DEBUG - RAW CATEGORY:', req.body.category);
        console.log('🔥 EMERGENCY DEBUG - CATEGORY TYPE:', typeof req.body.category);
        
        // Force a simple test book with hardcoded category
        const testBook = new Book({
            title: 'TEST BOOK',
            author: 'TEST AUTHOR',
            bookUrl: 'https://test.com',
            imageUrl: 'https://test.com/image.jpg',
            categoryId: req.body.category || 'FORCED_TEST_VALUE'
        });
        
        console.log('🔥 EMERGENCY DEBUG - BOOK BEFORE SAVE:', testBook);
        
        const savedBook = await testBook.save();
        
        console.log('🔥 EMERGENCY DEBUG - BOOK AFTER SAVE:', savedBook);
        console.log('🔥 EMERGENCY DEBUG - SAVED CATEGORY ID:', savedBook.categoryId);
        
        res.json({
            message: 'Test book created',
            book: savedBook,
            categoryIdFromSaved: savedBook.categoryId
        });
    } catch (error) {
        console.error('🔥 EMERGENCY DEBUG - ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

// MIGRATION: Update existing books to use new schema
app.post('/api/admin/migrate-books', checkAdmin, async (req, res) => {
    try {
        console.log('🔄 Starting book migration...');
        
        // Get all books
        const books = await Book.find({});
        console.log(`🔄 Found ${books.length} books to migrate`);
        
        let migrated = 0;
        for (const book of books) {
            let needsUpdate = false;
            const updates = {};
            
            // If book has old 'category' field, migrate to 'categoryId'
            if (book.category && !book.categoryId) {
                updates.categoryId = book.category.toString();
                updates.$unset = { category: 1 }; // Remove old field
                needsUpdate = true;
                console.log(`🔄 Migrating book "${book.title}" - category ${book.category} -> categoryId ${updates.categoryId}`);
            }
            
            // Remove any null categoryId fields
            if (book.categoryId === null) {
                updates.$unset = { ...updates.$unset, categoryId: 1 };
                needsUpdate = true;
                console.log(`🔄 Removing null categoryId from book "${book.title}"`);
            }
            
            if (needsUpdate) {
                await Book.findByIdAndUpdate(book._id, updates);
                migrated++;
            }
        }
        
        console.log(`🔄 Migration complete! Updated ${migrated} books`);
        res.json({ message: `Migration complete. Updated ${migrated} books.` });
    } catch (error) {
        console.error('🔄 Migration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// FORCE UPDATE: Manually set category for a book (for testing)
app.post('/api/admin/force-category/:bookId/:categoryId', checkAdmin, async (req, res) => {
    try {
        const { bookId, categoryId } = req.params;
        
        console.log(`🔧 FORCE UPDATE: Setting book ${bookId} to category ${categoryId}`);
        
        // Verify book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        // Force update
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { 
                categoryId: categoryId,
                $unset: { category: 1 } // Remove old field if exists
            },
            { new: true }
        );
        
        console.log(`🔧 FORCE UPDATE COMPLETE: Book "${updatedBook.title}" now has categoryId: ${updatedBook.categoryId}`);
        
        res.json({
            message: 'Category forced successfully',
            book: updatedBook,
            categoryName: category.name
        });
    } catch (error) {
        console.error('🔧 Force update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});