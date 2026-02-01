// Vercel Serverless Function Handler
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const nodemailer = require('nodemailer');

// Create Express app
const app = express();

// Global MongoDB connection (cached between function calls)
let cachedConnection = null;

// Connect to MongoDB with caching for serverless
async function connectToDatabase() {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log('Using cached database connection');
        return cachedConnection;
    }

    try {
        console.log('Creating new database connection...');
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        // Optimized connection options for serverless
        const options = {
            bufferCommands: false,
            maxPoolSize: 1, // Maintain up to 1 socket connection
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        };

        cachedConnection = await mongoose.connect(mongoUri, options);
        console.log('✅ Connected to MongoDB successfully');
        return cachedConnection;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

// Middleware
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Simple session middleware for serverless
app.use((req, res, next) => {
    // For serverless, we'll use a simple token-based auth instead of sessions
    // You can enhance this with JWT or similar
    req.session = {};
    next();
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await connectToDatabase();
        res.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Your existing schemas (simplified for this example)
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    bookUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    categoryId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    isAdmin: Boolean,
    avatarSeed: { type: String, default: 'default' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

// Models
let Book, User, Category;

// Initialize models only once
if (!Book) {
    Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
    User = mongoose.models.User || mongoose.model('User', userSchema);
    Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
}

// Example API routes
app.get('/api/books', async (req, res) => {
    try {
        await connectToDatabase();
        const books = await Book.find().limit(50); // Limit for performance
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        await connectToDatabase();
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export for Vercel
module.exports = app;
