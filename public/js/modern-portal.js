/**
 * eLibrary Modern User Portal 2025
 * Main JavaScript for enhanced functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the user portal
    initPortal();
});

/**
 * Initialize all portal components and features
 */
function initPortal() {
    // Set up sidebar collapse functionality
    setupSidebar();
    
    // Initialize navigation and tab switching
    setupNavigation();
    
    // Set up dark mode toggle
    setupDarkMode();
    
    // Initialize book interactions
    setupBookInteractions();
    
    // Set up global search
    setupSearch();
    
    // Initialize UI components
    initUIComponents();
    
    // Set up notifications system
    setupNotifications();
    
    // Mobile menu handling
    setupMobileMenu();
    
    // Load user profile data
    loadUserProfile();
    
    // Initialize stats and charts
    initDashboardStats();
    
    // Set up book filtering and sorting
    setupBookFiltering();
}

/**
 * Sidebar collapse functionality
 */
function setupSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    // Load sidebar state from localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed) {
        dashboardContainer.classList.add('sidebar-collapsed');
    }
    
    // Toggle sidebar on button click
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            dashboardContainer.classList.toggle('sidebar-collapsed');
            
            // Save state to localStorage
            const isCollapsed = dashboardContainer.classList.contains('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
    }
}

/**
 * Mobile menu functionality
 */
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            dashboardContainer.classList.toggle('sidebar-expanded');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            // If we're on mobile size and sidebar is expanded
            if (window.innerWidth <= 1024 && 
                dashboardContainer.classList.contains('sidebar-expanded') &&
                !event.target.closest('.sidebar') && 
                !event.target.closest('.mobile-menu-toggle')) {
                
                dashboardContainer.classList.remove('sidebar-expanded');
            }
        });
    }
}

/**
 * Setup navigation between sections
 */
function setupNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.sidebar-menu li a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section ID from the href
            const targetId = this.getAttribute('href').substring(1);
            navigateToSection(targetId);
            
            // Activate the current nav item
            document.querySelectorAll('.sidebar-menu li').forEach(item => {
                item.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // Close mobile sidebar after navigation
            if (window.innerWidth <= 1024) {
                document.querySelector('.dashboard-container').classList.remove('sidebar-expanded');
            }
        });
    });
    
    // Check URL hash on page load
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        navigateToSection(targetId);
        
        // Activate the matching nav item
        const activeNavItem = document.querySelector(`.sidebar-menu li a[href="#${targetId}"]`)?.parentElement;
        if (activeNavItem) {
            document.querySelectorAll('.sidebar-menu li').forEach(item => {
                item.classList.remove('active');
            });
            activeNavItem.classList.add('active');
        }
    }
}

/**
 * Navigate to a specific section
 * @param {string} sectionId - The ID of the section to navigate to
 */
function navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update URL hash without scrolling
        history.replaceState(null, null, `#${sectionId}`);
        
        // Animate in the content with GSAP if available
        if (window.gsap) {
            gsap.fromTo(
                targetSection, 
                { opacity: 0, y: 20 }, 
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
        
        // Refresh any dynamic content in the section
        refreshSectionContent(sectionId);
    }
}

/**
 * Refresh the content of a specific section
 * @param {string} sectionId - The ID of the section to refresh
 */
function refreshSectionContent(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            // Refresh dashboard items
            loadFeaturedBooks();
            loadRecentBooks();
            break;
        case 'books':
            // Refresh books catalog
            loadAllBooks();
            break;
        case 'favorites':
            // Refresh favorites
            loadFavoriteBooks();
            break;
        case 'history':
            // Refresh reading history
            loadReadingHistory();
            break;
        case 'profile':
            // Refresh profile data
            loadUserProfile();
            break;
    }
}

/**
 * Set up dark mode functionality
 */
function setupDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        document.body.classList.add('theme-dark');
        if (themeToggle) themeToggle.checked = true;
    }
    
    // Set up theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('theme-dark');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('theme-dark');
                localStorage.setItem('darkMode', 'false');
            }
            
            // Animate theme change with GSAP if available
            if (window.gsap) {
                gsap.to('body', {
                    backgroundColor: document.body.classList.contains('theme-dark') ? 
                        getComputedStyle(document.documentElement).getPropertyValue('--bg-primary') : 
                        getComputedStyle(document.documentElement).getPropertyValue('--bg-primary'),
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    }
}

/**
 * Setup book interactions (favorite, read, etc.)
 */
function setupBookInteractions() {
    // Delegate event listeners for book cards
    document.addEventListener('click', function(e) {
        // Favorite button click
        if (e.target.closest('.favorite-btn')) {
            e.preventDefault();
            const bookCard = e.target.closest('.book-card');
            if (bookCard) {
                const bookId = bookCard.dataset.bookId;
                toggleFavorite(bookId);
            }
        }
        
        // Book card click (open details)
        else if (e.target.closest('.book-card') && !e.target.closest('.action-btn')) {
            e.preventDefault();
            const bookCard = e.target.closest('.book-card');
            if (bookCard) {
                const bookId = bookCard.dataset.bookId;
                openBookDetails(bookId);
            }
        }
        
        // Read button click
        else if (e.target.closest('.read-btn')) {
            e.preventDefault();
            const bookCard = e.target.closest('.book-card');
            if (bookCard) {
                const bookId = bookCard.dataset.bookId;
                readBook(bookId);
            }
        }
    });
}

/**
 * Toggle book favorite state
 * @param {string} bookId - The ID of the book to toggle
 */
function toggleFavorite(bookId) {
    if (!bookId) return;
    
    // Check if book is already in favorites
    const favoriteBooks = new Set(JSON.parse(localStorage.getItem('favoriteBooks') || '[]'));
    const isFavorite = favoriteBooks.has(bookId);
    
    // Toggle favorite status
    if (isFavorite) {
        favoriteBooks.delete(bookId);
        showNotification('Removed from favorites', 'info');
    } else {
        favoriteBooks.add(bookId);
        showNotification('Added to favorites', 'success');
    }
    
    // Update UI
    document.querySelectorAll(`.book-card[data-book-id="${bookId}"] .favorite-btn`).forEach(btn => {
        if (isFavorite) {
            btn.classList.remove('active');
        } else {
            btn.classList.add('active');
            
            // Add heart animation with GSAP if available
            if (window.gsap) {
                gsap.timeline()
                    .to(btn, { scale: 0.5, duration: 0.15, ease: "power2.in" })
                    .to(btn, { scale: 1.2, duration: 0.2, ease: "back.out(1.7)" })
                    .to(btn, { scale: 1, duration: 0.15, ease: "power2.out" });
            }
        }
    });
    
    // Save to localStorage
    localStorage.setItem('favoriteBooks', JSON.stringify([...favoriteBooks]));
    
    // Update favorites count in profile
    const favoritesCount = document.getElementById('favoritesCount');
    if (favoritesCount) {
        favoritesCount.textContent = favoriteBooks.size;
    }
    
    // Refresh favorites section if it's active
    if (document.querySelector('#favorites.active')) {
        loadFavoriteBooks();
    }
}

/**
 * Open book details modal
 * @param {string} bookId - The ID of the book to display
 */
function openBookDetails(bookId) {
    if (!bookId) return;
    
    // Find the book in our data
    const book = findBookById(bookId);
    if (!book) return;
    
    // Populate modal with book details
    const modal = document.getElementById('bookModal');
    if (modal) {
        document.getElementById('modalBookTitle').textContent = book.title;
        document.getElementById('modalBookAuthor').textContent = book.author;
        document.getElementById('modalBookCategory').textContent = book.category;
        document.getElementById('modalBookDescription').innerHTML = book.description || 'No description available.';
        document.getElementById('modalBookImage').src = book.imageUrl || 'assets/default-book.jpg';
        
        // Set favorite button state
        const isFavorite = (JSON.parse(localStorage.getItem('favoriteBooks') || '[]')).includes(bookId);
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (isFavorite) {
            favoriteBtn.classList.add('active');
        } else {
            favoriteBtn.classList.remove('active');
        }
        
        // Store current book ID for actions
        modal.dataset.bookId = bookId;
        
        // Open modal with animation
        openModal('bookModal');
    }
}

/**
 * Read a book
 * @param {string} bookId - The ID of the book to read
 */
function readBook(bookId) {
    if (!bookId) return;
    
    // Record reading history
    const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    
    // Check if book is already in history
    const existingIndex = readingHistory.findIndex(item => item.bookId === bookId);
    if (existingIndex !== -1) {
        // Update existing record
        readingHistory[existingIndex].lastRead = new Date().toISOString();
        readingHistory[existingIndex].readCount = (readingHistory[existingIndex].readCount || 0) + 1;
    } else {
        // Add new record
        readingHistory.push({
            bookId,
            firstRead: new Date().toISOString(),
            lastRead: new Date().toISOString(),
            readCount: 1
        });
    }
    
    // Save updated history
    localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
    
    // Show notification
    showNotification('Book opened for reading', 'success');
    
    // In a real app, redirect to the reader page or open reader view
    // For this example, just show a message
    console.log(`Opening book ${bookId} for reading`);
}

/**
 * Setup global search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        if (query.length < 2) return;
        
        // Debounce search for performance
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            searchBooks(query);
        }, 300);
    });
}

/**
 * Search for books
 * @param {string} query - The search query
 */
function searchBooks(query) {
    // In a real app, this would call an API
    console.log(`Searching for: ${query}`);
    
    // Show search results
    navigateToSection('books');
    
    // Update UI to show we're searching
    document.getElementById('searchQueryText').textContent = query;
    
    // For demo, just filter the books we have
    const filteredBooks = DEMO_BOOKS.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) || 
        book.category.toLowerCase().includes(query)
    );
    
    // Display results
    renderBooks('allBooks', filteredBooks);
}

/**
 * Initialize UI components
 */
function initUIComponents() {
    // Initialize tooltips
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-content';
        tooltip.textContent = el.dataset.tooltip;
        el.classList.add('tooltip');
        el.appendChild(tooltip);
    });
    
    // Initialize modals
    document.querySelectorAll('[data-dismiss="modal"]').forEach(el => {
        el.addEventListener('click', function() {
            const modalId = this.closest('.modal-backdrop').id;
            closeModal(modalId);
        });
    });
    
    // Initialize ripple effect for buttons
    document.querySelectorAll('.btn-ripple').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Initialize tabs
    document.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Activate tab
            document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Set up notifications system
 */
function setupNotifications() {
    // Create notifications container if it doesn't exist
    if (!document.getElementById('notifications-container')) {
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.style.position = 'fixed';
        container.style.top = '1rem';
        container.style.right = '1rem';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '0.5rem';
        document.body.appendChild(container);
    }
}

/**
 * Show a notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    notification.style.transition = 'all 0.3s ease';
    
    // Add icon
    const icon = document.createElement('div');
    icon.className = 'alert-icon';
    
    switch (type) {
        case 'success':
            icon.innerHTML = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon.innerHTML = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.appendChild(icon);
    
    // Add content
    const content = document.createElement('div');
    content.className = 'alert-content';
    content.textContent = message;
    notification.appendChild(content);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-dismiss';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    notification.appendChild(closeBtn);
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(50px)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Open a modal
 * @param {string} modalId - The ID of the modal to open
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('show');
    
    // Add animation with GSAP if available
    if (window.gsap) {
        gsap.fromTo(
            modal.querySelector('.modal-dialog'), 
            { opacity: 0, y: 20, scale: 0.95 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.4)" }
        );
    }
}

/**
 * Close a modal
 * @param {string} modalId - The ID of the modal to close
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Animate with GSAP if available
    if (window.gsap) {
        gsap.to(modal.querySelector('.modal-dialog'), {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                modal.classList.remove('show');
            }
        });
    } else {
        modal.classList.remove('show');
    }
}

/**
 * Set up book filtering and sorting
 */
function setupBookFiltering() {
    // Category filter change
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('change', function() {
            const section = this.dataset.section;
            const category = this.value;
            filterBooksByCategory(section, category);
        });
    });
    
    // Sort filter change
    document.querySelectorAll('.sort-filter').forEach(filter => {
        filter.addEventListener('change', function() {
            const section = this.dataset.section;
            const sortBy = this.value;
            sortBooks(section, sortBy);
        });
    });
}

/**
 * Filter books by category
 * @param {string} sectionId - The ID of the section containing the books
 * @param {string} category - The category to filter by
 */
function filterBooksByCategory(sectionId, category) {
    let books;
    
    // Get the appropriate books based on section
    switch (sectionId) {
        case 'allBooks':
            books = DEMO_BOOKS;
            break;
        case 'favoriteBooks':
            books = getFavoriteBooks();
            break;
        case 'recentBooks':
            books = getRecentBooks();
            break;
        case 'featuredBooks':
            books = getFeaturedBooks();
            break;
        default:
            return;
    }
    
    // Apply category filter if selected
    if (category) {
        books = books.filter(book => book.category === category);
    }
    
    // Render filtered books
    renderBooks(sectionId, books);
}

/**
 * Sort books
 * @param {string} sectionId - The ID of the section containing the books
 * @param {string} sortBy - The sort criteria
 */
function sortBooks(sectionId, sortBy) {
    let books;
    
    // Get the appropriate books based on section
    switch (sectionId) {
        case 'allBooks':
            books = DEMO_BOOKS;
            break;
        case 'favoriteBooks':
            books = getFavoriteBooks();
            break;
        case 'recentBooks':
            books = getRecentBooks();
            break;
        case 'featuredBooks':
            books = getFeaturedBooks();
            break;
        default:
            return;
    }
    
    // Apply category filter if one is selected
    const categoryFilter = document.querySelector(`.category-filter[data-section="${sectionId}"]`);
    if (categoryFilter && categoryFilter.value) {
        books = books.filter(book => book.category === categoryFilter.value);
    }
    
    // Apply sorting
    switch (sortBy) {
        case 'title':
            books.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'author':
            books.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'newest':
            books.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
            break;
        case 'oldest':
            books.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));
            break;
    }
    
    // Render sorted books
    renderBooks(sectionId, books);
}

/**
 * Initialize dashboard statistics and charts
 */
function initDashboardStats() {
    // Update stats counts
    updateStatCounts();
    
    // Initialize charts if chart.js is available
    if (window.Chart) {
        initDashboardCharts();
    }
}

/**
 * Update statistics counters
 */
function updateStatCounts() {
    // Books read count
    const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    const booksReadCount = document.getElementById('booksReadCount');
    if (booksReadCount) {
        booksReadCount.textContent = readingHistory.length;
    }
    
    // Favorites count
    const favoriteBooks = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
    const favoritesCount = document.getElementById('favoritesCount');
    if (favoritesCount) {
        favoritesCount.textContent = favoriteBooks.length;
    }
    
    // Total books count
    const totalBooksCount = document.getElementById('totalBooksCount');
    if (totalBooksCount) {
        totalBooksCount.textContent = DEMO_BOOKS.length;
    }
    
    // Reading time
    const totalReadingTime = document.getElementById('totalReadingTime');
    if (totalReadingTime) {
        // In a real app, this would be tracked
        totalReadingTime.textContent = '23h 45m';
    }
}

/**
 * Load user profile data
 */
function loadUserProfile() {
    // In a real app, this would fetch from an API
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        memberSince: '2023-06-15',
        role: 'Premium Member'
    };
    
    // Update UI elements
    document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = user.name;
    });
    
    document.querySelectorAll('.user-role').forEach(el => {
        el.textContent = user.role;
    });
    
    // Profile specific fields
    const profileUsername = document.getElementById('profileUsername');
    if (profileUsername) profileUsername.value = user.name;
    
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.value = user.email;
    
    const memberSince = document.getElementById('memberSince');
    if (memberSince) {
        const date = new Date(user.memberSince);
        memberSince.textContent = date.toLocaleDateString();
    }
    
    // Profile image
    const profileImage = document.querySelectorAll('.profile-img');
    profileImage.forEach(img => {
        img.src = `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`;
    });
}

/**
 * Helper function to find a book by ID
 * @param {string} bookId - The ID of the book to find
 * @return {object|null} The book object or null if not found
 */
function findBookById(bookId) {
    return DEMO_BOOKS.find(book => book.id === bookId) || null;
}

// Placeholder for book loading functions
// In a real app these would fetch from an API
function loadFeaturedBooks() {
    const featuredBooks = getFeaturedBooks();
    renderBooks('featuredBooks', featuredBooks);
}

function loadRecentBooks() {
    const recentBooks = getRecentBooks();
    renderBooks('recentBooks', recentBooks);
}

function loadAllBooks() {
    renderBooks('allBooks', DEMO_BOOKS);
}

function loadFavoriteBooks() {
    const favoriteBooks = getFavoriteBooks();
    renderBooks('favoriteBooks', favoriteBooks);
}

function loadReadingHistory() {
    const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    
    // Get book details for each history item
    const historyWithDetails = readingHistory.map(historyItem => {
        const book = findBookById(historyItem.bookId);
        return { ...historyItem, book };
    }).filter(item => item.book); // Remove any items with missing books
    
    // Sort by most recently read
    historyWithDetails.sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead));
    
    // Render recently opened books (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyOpened = historyWithDetails.filter(item => 
        new Date(item.lastRead) >= sevenDaysAgo
    );
    
    renderHistoryBooks('recentlyOpenedBooks', recentlyOpened);
    
    // Render full history
    renderHistoryTimeline('historyBooks', historyWithDetails);
    
    // Update stats
    const totalBooksRead = document.getElementById('totalBooksRead');
    if (totalBooksRead) {
        totalBooksRead.textContent = historyWithDetails.length;
    }
    
    const lastReadTime = document.getElementById('lastReadTime');
    if (lastReadTime && historyWithDetails.length > 0) {
        const lastRead = new Date(historyWithDetails[0].lastRead);
        lastReadTime.textContent = lastRead.toLocaleDateString();
    }
}

// Mock data - In a real app this would come from an API
const DEMO_BOOKS = [
    {
        id: 'book1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        publishedDate: '1925-04-10',
        description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
        imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'book2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        publishedDate: '1960-07-11',
        description: 'The story of racial inequality and moral growth seen through the eyes of a young girl in the American South.',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'book3',
        title: 'The Hitchhiker\'s Guide to the Galaxy',
        author: 'Douglas Adams',
        category: 'Science Fiction',
        publishedDate: '1979-10-12',
        description: 'The comedic adventures of Arthur Dent following the destruction of Earth.',
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'book4',
        title: '1984',
        author: 'George Orwell',
        category: 'Science Fiction',
        publishedDate: '1949-06-08',
        description: 'A dystopian novel set in Airstrip One, a province of the superstate Oceania.',
        imageUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'book5',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        category: 'Romance',
        publishedDate: '1813-01-28',
        description: 'The story of Elizabeth Bennet and her complicated relationship with the proud Mr. Darcy.',
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'book6',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        category: 'Fantasy',
        publishedDate: '1937-09-21',
        description: 'The adventures of Bilbo Baggins as he journeys to the Lonely Mountain.',
        imageUrl: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'book7',
        title: 'Harry Potter and the Philosopher\'s Stone',
        author: 'J.K. Rowling',
        category: 'Fantasy',
        publishedDate: '1997-06-26',
        description: 'The story of a young wizard, Harry Potter, and his adventures at Hogwarts School of Witchcraft and Wizardry.',
        imageUrl: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'book8',
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        category: 'Fantasy',
        publishedDate: '1954-07-29',
        description: 'The epic quest to destroy the One Ring and defeat the Dark Lord Sauron.',
        imageUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
    }
];

// Helper functions to get different book sets
function getFeaturedBooks() {
    // In a real app, this might be curated or based on an algorithm
    return DEMO_BOOKS.slice(0, 4);
}

function getRecentBooks() {
    // In a real app, this would be recent additions to the catalog
    return DEMO_BOOKS.slice(-4).reverse();
}

function getFavoriteBooks() {
    const favoriteIds = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
    return DEMO_BOOKS.filter(book => favoriteIds.includes(book.id));
}

/**
 * Render a list of books in a container
 * @param {string} containerId - The ID of the container to render books in
 * @param {Array} books - The array of books to render
 */
function renderBooks(containerId, books) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear loading animation if any
    container.innerHTML = '';
    
    // Check if we have books
    if (!books || books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No books found</p>
            </div>
        `;
        return;
    }
    
    // Get favorite books for highlighting
    const favoriteBooks = JSON.parse(localStorage.getItem('favoriteBooks') || '[]');
    
    // Create book cards
    books.forEach(book => {
        const isFavorite = favoriteBooks.includes(book.id);
        const card = document.createElement('div');
        card.className = 'book-card';
        card.dataset.bookId = book.id;
        
        card.innerHTML = `
            <div class="book-cover-container">
                <img src="${book.imageUrl || 'assets/default-book.jpg'}" alt="${book.title}" class="book-cover">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="book-details">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <span class="book-category">${book.category}</span>
                <div class="book-actions">
                    <button class="action-btn primary read-btn">
                        <i class="fas fa-book-open"></i> Read
                    </button>
                    <button class="action-btn details-btn">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;
        
        // Add to container
        container.appendChild(card);
    });
    
    // If GSAP is available, animate the books in
    if (window.gsap) {
        gsap.fromTo(
            container.querySelectorAll('.book-card'),
            { opacity: 0, y: 20, scale: 0.95 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.5, 
                stagger: 0.1,
                ease: "back.out(1.2)" 
            }
        );
    }
}

/**
 * Render books in the reading history section
 * @param {string} containerId - The ID of the container to render in
 * @param {Array} historyItems - The array of history items with book details
 */
function renderHistoryBooks(containerId, historyItems) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Check if we have history items
    if (!historyItems || historyItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No reading history found</p>
            </div>
        `;
        return;
    }
    
    // Create book cards for history
    historyItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.dataset.bookId = item.book.id;
        
        const lastReadDate = new Date(item.lastRead);
        
        card.innerHTML = `
            <div class="book-cover-container">
                <img src="${item.book.imageUrl || 'assets/default-book.jpg'}" alt="${item.book.title}" class="book-cover">
            </div>
            <div class="book-details">
                <h3 class="book-title">${item.book.title}</h3>
                <p class="book-author">${item.book.author}</p>
                <div class="history-info">
                    <p class="last-read">Last read: ${lastReadDate.toLocaleDateString()}</p>
                    <p class="read-count">Read ${item.readCount} time${item.readCount > 1 ? 's' : ''}</p>
                </div>
                <div class="book-actions">
                    <button class="action-btn primary read-btn">
                        <i class="fas fa-book-open"></i> Continue Reading
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Render reading history as a timeline
 * @param {string} containerId - The ID of the container to render in
 * @param {Array} historyItems - The array of history items with book details
 */
function renderHistoryTimeline(containerId, historyItems) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Check if we have history items
    if (!historyItems || historyItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No reading history found</p>
            </div>
        `;
        return;
    }
    
    // Group history by month/year
    const groupedHistory = groupHistoryByMonth(historyItems);
    
    // Create timeline
    const timeline = document.createElement('div');
    timeline.className = 'history-timeline';
    
    // Create timeline items for each month
    Object.entries(groupedHistory).forEach(([monthYear, items]) => {
        const timelineGroup = document.createElement('div');
        timelineGroup.className = 'timeline-group';
        
        const groupHeader = document.createElement('div');
        groupHeader.className = 'timeline-header';
        groupHeader.innerHTML = `<h4>${monthYear}</h4>`;
        timelineGroup.appendChild(groupHeader);
        
        // Add items for this month
        items.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            const lastReadDate = new Date(item.lastRead);
            
            timelineItem.innerHTML = `
                <div class="timeline-date">
                    <span class="date">${lastReadDate.getDate()}</span>
                    <span class="month">${lastReadDate.toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div class="timeline-content">
                    <div class="book-info">
                        <img src="${item.book.imageUrl || 'assets/default-book.jpg'}" alt="${item.book.title}" class="mini-cover">
                        <div>
                            <h5>${item.book.title}</h5>
                            <p>${item.book.author}</p>
                            <p class="read-count">Read ${item.readCount} time${item.readCount > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button class="action-btn sm read-btn" data-book-id="${item.book.id}">
                        <i class="fas fa-book-open"></i> Read Again
                    </button>
                </div>
            `;
            
            timelineGroup.appendChild(timelineItem);
        });
        
        timeline.appendChild(timelineGroup);
    });
    
    container.appendChild(timeline);
}

/**
 * Group history items by month and year
 * @param {Array} historyItems - The array of history items
 * @return {Object} An object with month/year keys and arrays of items as values
 */
function groupHistoryByMonth(historyItems) {
    const grouped = {};
    
    historyItems.forEach(item => {
        const date = new Date(item.lastRead);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        if (!grouped[monthYear]) {
            grouped[monthYear] = [];
        }
        
        grouped[monthYear].push(item);
    });
    
    return grouped;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initPortal();
});
