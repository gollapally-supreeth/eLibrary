const mongoose = require('mongoose');

// MongoDB connection with caching
let cachedConnection = null;

async function connectToDatabase() {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        const options = {
            bufferCommands: false,
            maxPoolSize: 1,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };

        cachedConnection = await mongoose.connect(mongoUri, options);
        return cachedConnection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Schema definitions
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
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Health check endpoint
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectToDatabase();
        
        const stats = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ 
            status: 'error', 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
