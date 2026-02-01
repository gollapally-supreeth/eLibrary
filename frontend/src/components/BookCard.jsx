import React from 'react';

const BookCard = ({ book, isFavorited, onToggleFavorite }) => {
    return (
        <div className="book-card">
            <div className="book-cover-container">
                <img src={book.imageUrl || '/assets/book-placeholder.svg'} alt={book.title} className="book-cover" />
                <button
                    className={`favorite-icon ${isFavorited ? 'favorited' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(book._id || book.id);
                    }}
                >
                    <i className="fas fa-heart"></i>
                </button>
            </div>
            <div className="book-details">
                <h4 className="book-title">{book.title}</h4>
                <p className="book-author">{book.author}</p>
                <div className="book-category-tag">
                    {book.category_name || book.category?.name || 'Reading'}
                </div>
            </div>
        </div>
    );
};

export default BookCard;
