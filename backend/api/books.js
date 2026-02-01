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

// Book Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    bookUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    categoryId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

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

        if (req.method === 'GET') {
            const { page = 1, limit = 20, category, search } = req.query;
            const skip = (page - 1) * limit;
            
            let query = {};
            
            if (category && category !== 'all') {
                query.categoryId = category;
            }
            
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } }
                ];
            }

            const books = await Book.find(query)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });
                
            const total = await Book.countDocuments(query);

            res.status(200).json({
                books,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } else if (req.method === 'POST') {
            const { title, author, bookUrl, imageUrl, categoryId } = req.body;
            
            if (!title || !author || !bookUrl || !imageUrl) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const book = new Book({
                title,
                author,
                bookUrl,
                imageUrl,
                categoryId
            });

            await book.save();
            res.status(201).json(book);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Books API error:', error);
        res.status(500).json({ error: error.message });
    }
}
