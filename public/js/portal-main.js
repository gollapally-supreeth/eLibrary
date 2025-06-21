document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = '/api'; // Assuming your API routes are prefixed with /api
    let allBooks = [];
    let allCategories = [];
    let userFavorites = []; // Store as array of book IDs

    // --- DOM Elements ---
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggleMobile = document.querySelector('.sidebar-toggle-mobile');
    const desktopSidebarCollapseBtn = document.getElementById('desktopSidebarCollapseBtn'); // Get the new button
    const mainContent = document.querySelector('.main-content');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const searchInput = document.getElementById('searchInput');
    const themeToggle = document.querySelector('.theme-toggle');
    const logoutButton = document.getElementById('logoutButton');
    const loadingOverlay = document.getElementById('loadingOverlay');

    const dashboardGrid = document.querySelector('#dashboard .dashboard-grid');
    const featuredBooksGrid = document.getElementById('featuredBooksGrid');
    const allBooksGrid = document.getElementById('allBooksGrid');
    const categoriesList = document.getElementById('categoriesList');
    const favoriteBooksGrid = document.getElementById('favoriteBooksGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const userAvatar = document.getElementById('userAvatar');

    // --- Profile Section Elements ---
    const profileSection = document.getElementById('profile');
    const profileLargeAvatar = document.getElementById('profileLargeAvatar');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn'); // Use ID for clarity
    const profileUsernameDisplay = document.getElementById('profileUsernameDisplay');
    const profileEmailDisplay = document.getElementById('profileEmailDisplay');

    // --- Avatar Modal Elements ---
    const avatarModal = document.getElementById('avatarModal');
    const closeAvatarModalBtn = document.getElementById('closeAvatarModalBtn');
    const avatarSelectionGrid = document.getElementById('avatarSelectionGrid');
    const cancelAvatarChangeBtn = document.getElementById('cancelAvatarChangeBtn');
    const saveAvatarChangeBtn = document.getElementById('saveAvatarChangeBtn');
    let selectedAvatarSeed = null;
    const AVATAR_OPTIONS = [
        'Gizmo', 'Pixel', 'Bear', 'Mittens', 'Leo', 'Coco', 
        'Shadow', 'Zoe', 'Max', 'Ruby', 'Oscar', 'Sadie',
        'Toby', 'Cleo', 'Buddy', 'Nala', 'Rocky', 'Luna',
        'Oliver', 'Milo', 'Simba', 'Tiger', 'Charlie', 'Lucy'
    ]; // Example seeds, expanded list

    // --- State ---
    let currentSection = 'dashboard';
    let isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    let currentTheme = localStorage.getItem('theme') || 'light';    // --- API Functions ---
    const fetchData = async (endpoint, options = {}) => {
        showLoading();
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            showNotification(`Error fetching data: ${error.message}`, 'error');
            return null;
        } finally {
            hideLoading();
        }
    };

    // --- Rendering Functions ---
    const renderBookCard = (book) => {
        const isFavorited = userFavorites.includes(book._id);
        // Handle both old and new data structures
        const categoryName = book.category_name || (book.category ? book.category.name : 'Uncategorized');
        return `
            <div class="book-card" data-book-id="${book._id}">
                <div class="book-cover-container">
                    <img src="${book.imageUrl || 'assets/default-book.jpg'}" alt="${book.title}" class="book-cover" loading="lazy">
                    <i class="fas fa-heart favorite-icon ${isFavorited ? 'favorited' : ''}" data-book-id="${book._id}" aria-label="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}"></i>
                </div>
                <div class="book-details">
                    <h4 class="book-title" title="${book.title}">${book.title}</h4>
                    <p class="book-author">By ${book.author}</p>
                    <span class="book-category-tag">${categoryName}</span>
                </div>
            </div>
        `;
    };

    const renderBooks = (container, booksToRender) => {
        if (!container) return;
        if (!booksToRender || booksToRender.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-book-reader"></i><p>No books match your criteria.</p></div>';
            return;
        }        container.innerHTML = booksToRender.map(renderBookCard).join('');
        
        // Enhanced animation with better performance
        gsap.fromTo(container.querySelectorAll('.book-card'), 
            { 
                opacity: 0, 
                y: 30,
                scale: 0.9,
                rotationX: -15
            },
            { 
                opacity: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                duration: 0.6,
                stagger: 0.06,
                ease: 'power2.out'
            }
        );
    };    const renderCategoryCard = (category) => {
        const bookCount = category.book_count || 0;
        const bookText = bookCount === 1 ? 'book' : 'books';
        return `
            <div class="category-card" data-category-id="${category._id}" tabindex="0" role="button" aria-label="View ${category.name} category with ${bookCount} ${bookText}">
                <i class="fas fa-folder" aria-hidden="true"></i>
                <h4>${category.name}</h4>
                <p class="book-count">${bookCount} ${bookText}</p>
            </div>
        `;
    };const renderCategories = (container, categoriesToRender) => {
        if (!container) return;
        if (!categoriesToRender || categoriesToRender.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-tags"></i><p>No categories available at the moment.</p></div>';
            return;
        }
        container.innerHTML = categoriesToRender.map(renderCategoryCard).join('');
        
        // Enhanced category card animation
        gsap.fromTo(container.querySelectorAll('.category-card'), 
            { 
                opacity: 0, 
                scale: 0.8,
                y: 20,
                rotationY: -15
            },
            { 
                opacity: 1, 
                scale: 1,
                y: 0,
                rotationY: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'back.out(1.3)'
            }
        );
    };

    const renderDashboardStats = () => {
        if (!dashboardGrid) return;
        const stats = [
            { title: 'Total Books', value: allBooks.length, icon: 'fa-book-open', colorClass: 'books' },
            { title: 'Categories', value: allCategories.length, icon: 'fa-sitemap', colorClass: 'categories' },
            { title: 'My Favorites', value: userFavorites.length, icon: 'fa-heart-circle-check', colorClass: 'favorites' },
        ];
        dashboardGrid.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-card-icon ${stat.colorClass}"><i class="fas ${stat.icon}"></i></div>
                <div class="stat-card-info">
                    <h4>${stat.title}</h4>
                    <p>${stat.value}</p>
                </div>
            </div>
        `).join('');
        gsap.from(dashboardGrid.querySelectorAll('.stat-card'), { 
            opacity: 0, 
            x: -35, // Increased initial X offset
            scale: 0.95,
            duration: 0.45,
            stagger: 0.1,
            ease: 'power3.out' 
        });
    };

    const populateCategoryFilter = () => {
        if (!categoryFilter) return;
        categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset
        allCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat._id;
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });
    };

    // --- UI Interaction Functions ---
    const toggleSidebar = () => {
        isSidebarCollapsed = !isSidebarCollapsed;
        sidebar.classList.toggle('collapsed', isSidebarCollapsed);
        localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        // Main content padding adjustment is now handled by margin and width in CSS for fixed sidebar
        // window.dispatchEvent(new Event('resize')); // May not be needed if layout is pure CSS
    };
    
    const openMobileSidebar = () => {
        sidebar.classList.add('open');
    };

    const closeMobileSidebar = () => {
        sidebar.classList.remove('open');
    };

    const switchSection = (sectionId) => {
        currentSection = sectionId;
        contentSections.forEach(section => section.classList.remove('active'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
            gsap.fromTo(activeSection, 
                {opacity: 0, y: 30, scale: 0.97}, // Adjusted initial state
                {opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out'} // Slightly longer duration
            );
        }
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');
        
        // Load data for section if needed
        if (sectionId === 'books') loadAllBooks();
        if (sectionId === 'categories') loadCategories();
        if (sectionId === 'favorites') loadFavorites();
        if (sectionId === 'dashboard') {
            renderDashboardStats();
            loadFeaturedBooks();
        }
        if (sectionId === 'profile') { // ADDED: Load profile data when switching to profile section
            loadUserProfileData();
        }
        // Close mobile sidebar on navigation
        if (window.innerWidth <= 1024) closeMobileSidebar();
    };

    const applyTheme = (theme) => {
        document.body.classList.toggle('theme-dark', theme === 'dark');
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    };

    const toggleTheme = () => {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = (event) => {
        if (event) event.preventDefault(); // Prevent default link navigation
        // Clear any client-side session/user data if necessary
        localStorage.clear(); // Example: clear local storage
        window.location.href = '/login.html'; // Directly redirect to login page
    };

    const showLoading = () => loadingOverlay?.classList.add('visible');
    const hideLoading = () => loadingOverlay?.classList.remove('visible');

    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        gsap.set(notification, { className: 'custom-notification ' + type + ' visible' }); 

        gsap.fromTo(notification, 
            { x: '120%', opacity: 0, scale: 0.9 }, 
            { x: '0%', opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' } // Added scale and adjusted ease
        );
        setTimeout(() => {
            gsap.to(notification, { 
                opacity: 0, 
                x: '120%', 
                scale: 0.9,
                duration: 0.4, 
                ease: 'power2.in',
                onComplete: () => notification.remove() 
            });
        }, 3800); // Slightly longer display time
    };    // --- Data Loading and Filtering ---
    const loadInitialData = async () => {
        showLoading();
        try {
            // Fetch in parallel
            const [booksData, categoriesData, userData] = await Promise.all([
                fetchData('books'),
                fetchData('categories'),
                fetchData('user/profile')
            ]);

            allBooks = booksData || [];
            allCategories = categoriesData || [];
            
            // Load user profile data immediately
            if (userData) {
                updateUserProfile(userData);
                userFavorites = userData.favorites || [];
                // Update localStorage to match server data
                localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
            } else {
                // Fallback to localStorage for favorites if no user data
                userFavorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
            }            renderDashboardStats();
            loadFeaturedBooks();
            populateCategoryFilter();
            switchSection(currentSection); // Display initial section

        } catch (error) {
            console.error('Error loading initial data:', error);
            showNotification('Could not load initial portal data.', 'error');
        } finally {
            hideLoading();
        }
    };

    const loadFeaturedBooks = () => {
        // Simple logic: first 4 books, or could be a dedicated API endpoint
        const featured = allBooks.slice(0, 4);
        renderBooks(featuredBooksGrid, featured);
    };

    const loadAllBooks = (filterParams = {}) => {
        let booksToDisplay = [...allBooks];
        const searchTerm = (searchInput.value || '').toLowerCase();
        const categoryId = filterParams.categoryId || categoryFilter.value;
        const sortBy = filterParams.sortBy || sortFilter.value;        // Search
        if (searchTerm) {
            booksToDisplay = booksToDisplay.filter(book => 
                book.title.toLowerCase().includes(searchTerm) || 
                book.author.toLowerCase().includes(searchTerm)
            );
        }

        // Category Filter
        if (categoryId && categoryId !== 'all') {
            booksToDisplay = booksToDisplay.filter(book => 
                (book.categoryId && book.categoryId === categoryId) ||
                (book.category && book.category._id === categoryId)
            );
        }

        // Sorting
        switch (sortBy) {
            case 'title_asc': booksToDisplay.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'title_desc': booksToDisplay.sort((a, b) => b.title.localeCompare(a.title)); break;
            case 'author_asc': booksToDisplay.sort((a, b) => a.author.localeCompare(b.author)); break;
            case 'recent': booksToDisplay.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break; // Assuming createdAt exists
        }
        renderBooks(allBooksGrid, booksToDisplay);
    };    const loadCategories = () => {
        renderCategories(categoriesList, allCategories);
    };

    const loadFavorites = () => {
        const favoriteBookDetails = allBooks.filter(book => userFavorites.includes(book._id));
        renderBooks(favoriteBooksGrid, favoriteBookDetails);
        renderDashboardStats(); // Update favorite count on dashboard
    };

    const toggleFavorite = async (bookId) => {
        const isFavorited = userFavorites.includes(bookId);
        
        try {
            if (isFavorited) {
                // Remove from favorites
                const response = await fetchData(`user/favorites/${bookId}`, { method: 'DELETE' });
                if (response) {
                    userFavorites = userFavorites.filter(id => id !== bookId);
                    showNotification('Removed from favorites', 'info');
                }
            } else {
                // Add to favorites
                const response = await fetchData(`user/favorites/${bookId}`, { method: 'POST' });
                if (response) {
                    userFavorites.push(bookId);
                    showNotification('Added to favorites', 'success');
                }
            }
            
            // Also update localStorage as backup
            localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
            
            // Update heart icon on all instances of this book card
            document.querySelectorAll(`.favorite-icon[data-book-id="${bookId}"]`).forEach(icon => {
                icon.classList.toggle('favorited', userFavorites.includes(bookId));
            });
            
            if (currentSection === 'favorites') loadFavorites(); // Refresh if on favorites page
            renderDashboardStats(); // Update favorite count on dashboard
            
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showNotification('Error updating favorites', 'error');
        }
    };    // --- Profile Section Logic ---
    // --- User Profile Functions ---
    const updateUserProfile = (userData) => {
        if (!userData) return;
        
        // Update profile section
        if (profileUsernameDisplay) profileUsernameDisplay.textContent = userData.username;
        if (profileEmailDisplay) profileEmailDisplay.textContent = userData.email;
        
        // Update avatar with user's saved avatarSeed or fallback to username
        const currentAvatarSeed = userData.avatarSeed || userData.username || 'User';
        
        const avatarUrl = `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(currentAvatarSeed)}`;
        
        // Update all avatar instances
        if (profileLargeAvatar) profileLargeAvatar.src = avatarUrl;
        if (userAvatar) {
            const mainUserAvatarImg = userAvatar.querySelector('img');
            if (mainUserAvatarImg) mainUserAvatarImg.src = avatarUrl;
        }
    };

    const loadUserProfileData = async () => {
        if (!profileSection) return;

        const userData = await fetchData('user/profile');

        if (userData) {
            if(profileUsernameDisplay) profileUsernameDisplay.textContent = userData.username;
            if(profileEmailDisplay) profileEmailDisplay.textContent = userData.email;
            const currentAvatarSeed = userData.avatarSeed || userData.username || 'User';
            const avatarUrl = `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(currentAvatarSeed)}`; // Changed to avataaars
            if(profileLargeAvatar) profileLargeAvatar.src = avatarUrl;
            const mainUserAvatarImg = userAvatar?.querySelector('img');
            if(mainUserAvatarImg) mainUserAvatarImg.src = avatarUrl;

        } else {
            showNotification('Could not load user profile data.', 'error');
            if(profileUsernameDisplay) profileUsernameDisplay.textContent = 'N/A';
            if(profileEmailDisplay) profileEmailDisplay.textContent = 'N/A';
            const defaultAvatarUrl = `https://api.dicebear.com/6.x/avataaars/svg?seed=Error`; // Changed to avataaars
            if(profileLargeAvatar) profileLargeAvatar.src = defaultAvatarUrl;
            const mainUserAvatarImg = userAvatar?.querySelector('img');
            if(mainUserAvatarImg) mainUserAvatarImg.src = defaultAvatarUrl;        }
    };

    // --- Avatar Modal Logic ---
    const openAvatarModal = () => {
        console.log('Opening avatar modal...'); // Debug log
        
        // Basic validation
        if (!avatarModal || !avatarSelectionGrid) {
            console.error('Modal elements not found!');
            return;
        }
        
        // Clear previous options
        avatarSelectionGrid.innerHTML = '';
        
        // Get current seed
        let currentSeedFromServer = 'User';
        if (profileLargeAvatar && profileLargeAvatar.src) {
            const urlParts = profileLargeAvatar.src.split('seed=');
            if (urlParts.length > 1) {
                currentSeedFromServer = decodeURIComponent(urlParts[1].split('&')[0]);
            }
        }
        selectedAvatarSeed = currentSeedFromServer;

        // Create avatar options
        AVATAR_OPTIONS.forEach((seed, index) => {
            const avatarOptionDiv = document.createElement('div');
            avatarOptionDiv.className = 'avatar-option';
            avatarOptionDiv.dataset.seed = seed;
            avatarOptionDiv.style.setProperty('--i', index);
            
            const img = document.createElement('img');
            img.src = `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
            img.alt = `Avatar for ${seed}`;
            img.loading = 'lazy';
            avatarOptionDiv.appendChild(img);
            
            if (seed === selectedAvatarSeed) {
                avatarOptionDiv.classList.add('selected');
            }
            
            avatarOptionDiv.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option.selected').forEach(el => el.classList.remove('selected'));
                avatarOptionDiv.classList.add('selected');
                selectedAvatarSeed = seed;
            });
            
            avatarSelectionGrid.appendChild(avatarOptionDiv);
        });
        
        // Show modal
        console.log('Showing modal...'); // Debug log
        avatarModal.style.display = 'flex';
        avatarModal.classList.add('visible');
        console.log('Modal should be visible now'); // Debug log
    };

    const closeAvatarModal = () => {
        avatarModal.classList.remove('visible');
        
        // Hide modal after transition completes
        setTimeout(() => {
            if (!avatarModal.classList.contains('visible')) {
                avatarModal.style.display = 'none';
            }
        }, 400); // Match the CSS transition duration
    };

    const handleSaveAvatar = async () => {
        if (!selectedAvatarSeed) {
            showNotification('Please select an avatar.', 'warning');
            return;
        }
        showLoading();
        const result = await fetchData('user/profile/avatar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarSeed: selectedAvatarSeed })
        });
        hideLoading();
        if (result && result.avatarSeed) {
            showNotification(result.message || 'Avatar updated successfully!', 'success');
            const newAvatarUrl = `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(result.avatarSeed)}`; // Changed to avataaars
            if(profileLargeAvatar) profileLargeAvatar.src = newAvatarUrl;
            const mainUserAvatarImg = userAvatar?.querySelector('img');
            if(mainUserAvatarImg) mainUserAvatarImg.src = newAvatarUrl;
            closeAvatarModal();
        } else {
            showNotification(result?.message || 'Failed to update avatar.', 'error');
        }
    };

    // --- Event Listeners ---
    const setupEventListeners = () => {
        // Sidebar toggle for desktop (persisted)
        if(desktopSidebarCollapseBtn) { // Use the new button
            desktopSidebarCollapseBtn.addEventListener('click', toggleSidebar);
        }

        // Mobile sidebar toggle
        sidebarToggleMobile.addEventListener('click', openMobileSidebar);
        // Close mobile sidebar when clicking on main content or a nav link
        mainContent.addEventListener('click', closeMobileSidebar);
        document.addEventListener('click', (event) => {
            if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
                if (!sidebar.contains(event.target) && !sidebarToggleMobile.contains(event.target)) {
                    closeMobileSidebar();
                }
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchSection(link.dataset.section);
                if (window.innerWidth <= 1024) closeMobileSidebar(); // Close mobile sidebar on nav
            });
        });

        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || searchInput.value.length > 2 || searchInput.value.length === 0) {
                if (currentSection !== 'books') switchSection('books');
                loadAllBooks();
            }
        });

        themeToggle.addEventListener('click', toggleTheme);
        logoutButton.addEventListener('click', handleLogout);

        [categoryFilter, sortFilter].forEach(filter => {
            filter?.addEventListener('change', () => loadAllBooks());
        });

        // Event delegation for dynamic content (book cards, category cards)
        document.body.addEventListener('click', (e) => {
            // Favorite toggle
            if (e.target.classList.contains('favorite-icon')) {
                e.stopPropagation();
                const bookId = e.target.dataset.bookId;
                toggleFavorite(bookId);
            }
            // Book card click (navigate to book details or open - TBD)
            else if (e.target.closest('.book-card')) {
                const bookCard = e.target.closest('.book-card');
                const bookId = bookCard.dataset.bookId;
                const book = allBooks.find(b => b._id === bookId);
                if (book && book.bookUrl) {
                    window.open(book.bookUrl, '_blank');
                    // TODO: Add to reading history
                    showNotification(`Opening ${book.title}...`, 'success');
                } else {
                    showNotification('Book link not available.', 'warning');
                }
            }
            // Category card click
            else if (e.target.closest('.category-card')) {
                const categoryCard = e.target.closest('.category-card');
                const categoryId = categoryCard.dataset.categoryId;
                switchSection('books');
                categoryFilter.value = categoryId;
                loadAllBooks({ categoryId });
            }
        });        // Profile Section Event Listeners
        if (profileSection) {
            if (changeAvatarBtn) {
                console.log('Change avatar button found, adding event listener...'); // Debug log
                changeAvatarBtn.addEventListener('click', () => {
                    console.log('Change avatar button clicked!'); // Debug log
                    openAvatarModal();
                });
            } else {
                console.error('Change avatar button not found!'); // Debug log
            }
        } else {
            console.error('Profile section not found!'); // Debug log
        }

        // Avatar Modal Listeners
        if (avatarModal) {
            closeAvatarModalBtn.addEventListener('click', closeAvatarModal);
            cancelAvatarChangeBtn.addEventListener('click', closeAvatarModal);
            saveAvatarChangeBtn.addEventListener('click', handleSaveAvatar);
            avatarModal.addEventListener('click', (event) => {
                if (event.target === avatarModal) {
                    closeAvatarModal();
                }
            });
        }

        // Debug: Check if modal elements exist
        console.log('Avatar modal element:', avatarModal);
        console.log('Avatar selection grid element:', avatarSelectionGrid);
        console.log('Change avatar button element:', changeAvatarBtn);
        console.log('Profile section element:', profileSection);

        // Add keyboard support for category cards
        document.body.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.classList.contains('category-card')) {
                    e.preventDefault();
                    const categoryId = e.target.dataset.categoryId;
                    switchSection('books');
                    categoryFilter.value = categoryId;
                    loadAllBooks({ categoryId });
                }
            }
        });
    };

    // --- Initialization ---
    const init = () => {
        // Apply initial sidebar state for desktop
        if (window.innerWidth > 1024) {
            sidebar.classList.toggle('collapsed', isSidebarCollapsed);
        }
        
        applyTheme(currentTheme);
        setupEventListeners();
        loadInitialData(); // This calls switchSection for the default section.
        // loadUserProfileData(); // REMOVED: Unconditional call to load profile data
        
        // Check auth status - redirect if not logged in
        fetch('/api/auth/status') 
            .then(res => res.json())            .then(auth => {
                if (!auth.authenticated) {
                    window.location.href = '/login.html';
                }
            }).catch(() => window.location.href = '/login.html');
    };

    init();
});
