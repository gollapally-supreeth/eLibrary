function mapBookResponse(book) {
    if (!book) return null;
    return {
        ...book,
        id: book._id.toString(),
        category: { name: book.category_name || 'Uncategorized' },
        category_name: book.category_name || 'Uncategorized'
    };
}

module.exports = { mapBookResponse };
