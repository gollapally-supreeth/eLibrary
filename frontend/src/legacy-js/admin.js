document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');
    const themeToggle = document.getElementById('themeToggle');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const headerTitle = document.getElementById('headerTitle');
    const userProfile = document.querySelector('.user-profile');
    const profileDropdown = document.querySelector('.profile-dropdown');

    // Global variables
    let totalBookCount = 0;

    // --- Initial Setup ---
    // Hide loading overlay
    setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }, 300); // Simulate loading time

    // Theme Initialization
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    if (themeToggle) themeToggle.checked = currentTheme === 'dark';

    // Sidebar State Initialization
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebar) sidebar.classList.toggle('collapsed', isSidebarCollapsed);
    if (mainContent) mainContent.classList.toggle('sidebar-collapsed', isSidebarCollapsed);
    if (window.innerWidth <= 992 && !isSidebarCollapsed) { // On mobile, ensure sidebar is closed initially unless it was collapsed
        if(sidebar) sidebar.classList.remove('open');
    }

    // --- Event Listeners ---
    // Sidebar Toggle
    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 992) { // Mobile behavior: overlay
                sidebar.classList.toggle('open');
            } else { // Desktop behavior: collapse/expand
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('sidebar-collapsed');
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            }
        });
    }
    
    // Close mobile sidebar when clicking outside
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 992 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', themeToggle.checked);
            localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
            updateChartThemes(); // Update charts on theme change
        });
    }

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            contentSections.forEach(s => s.classList.remove('active'));
            const activeSection = document.getElementById(sectionId);
            if (activeSection) activeSection.classList.add('active');
            
            if (headerTitle && link.querySelector('span')) {
                headerTitle.textContent = link.querySelector('span').textContent;
            }

            // Load data when switching to sections
            if (sectionId === 'users-section') {
                loadDataForTable('users');
            } else if (sectionId === 'books-section') {
                loadDataForTable('books');
                loadDataForTable('categories'); // Load categories for filter
            } else if (sectionId === 'categories-section') {
                loadDataForTable('categories');
            }

            // Close mobile sidebar on navigation
            if (window.innerWidth <= 992 && sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });

    // User Profile Dropdown
    if (userProfile && profileDropdown) {
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling to document
            userProfile.classList.toggle('open');
        });
        document.addEventListener('click', () => { // Close dropdown if clicked outside
            if (userProfile.classList.contains('open')) {
                userProfile.classList.remove('open');
            }
        });
        // Prevent dropdown from closing when clicking inside it
        profileDropdown.addEventListener('click', (e) => e.stopPropagation()); 
    }

    // --- Data Fetching and Rendering (Placeholder - to be implemented) ---
    // Enhanced fetch function with better error handling for admin operations
    const fetchData = async (endpoint, options = {}) => {
        try {
            let url = `/api/admin${endpoint}`;
            
            // Handle query parameters for GET requests
            if (options.params && Object.keys(options.params).length > 0) {
                const queryString = new URLSearchParams(options.params).toString();
                url += `?${queryString}`;
            }
            
            const config = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };
            
            // Add body for POST/PUT requests
            if (options.body) {
                config.body = options.body;
            }

            const response = await fetch(url, config);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: response.statusText };
                }
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            // Don't show notification for GET requests to avoid spam
            if (options.method && options.method !== 'GET') {
                showNotification(`Failed to ${options.method} ${endpoint}. ${error.message}`, 'error');
            }
            throw error; // Re-throw to allow caller to handle
        }
    };

    // --- CRUD Operations & Modals (Placeholder - to be implemented) ---
    const formModal = document.getElementById('formModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalText = document.getElementById('confirmModalText');
    const confirmModalConfirmBtn = document.getElementById('confirmModalConfirmBtn');
    const confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');
    
    let currentEditId = null;
    let currentResourceType = ''; // 'users', 'books', 'categories'

    const openModal = async (type, resource = null) => {
        currentResourceType = type;
        currentEditId = resource ? resource.id : null;
        let formHtml = '';
        let title = '';

        switch (type) {
            case 'users':
                title = resource ? 'Edit User' : 'Add New User';
                // Map backend isAdmin field to frontend role field
                const userRole = resource ? (resource.isAdmin ? 'admin' : 'user') : 'user';
                formHtml = `
                    <form id="userForm">
                        <input type="hidden" name="id" value="${resource?.id || ''}">
                        <div class="form-group">
                            <label for="username">Username *</label>
                            <input type="text" id="username" name="username" value="${resource?.username || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input type="email" id="email" name="email" value="${resource?.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password ${resource ? '(Leave blank to keep current)' : '*'}</label>
                            <input type="password" id="password" name="password" ${!resource ? 'required' : ''} 
                                   placeholder="${resource ? 'Enter new password or leave blank' : 'Enter password'}">
                        </div>
                        <div class="form-group">
                            <label for="role">Role *</label>
                            <select id="role" name="role" required>
                                <option value="user" ${userRole === 'user' ? 'selected' : ''}>User</option>
                                <option value="admin" ${userRole === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary close-modal-btn-form">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-${resource ? 'save' : 'plus'}"></i>
                                ${resource ? 'Save Changes' : 'Add User'}
                            </button>
                        </div>
                    </form>
                `;
                break;
            case 'books':
                title = resource ? 'Edit Book' : 'Add New Book';
                // Always fetch fresh categories from the API
                
                try {
                    const categories = await fetchData('/categories');
                    
                    if (!categories || categories.length === 0) {
                        showNotification('No categories available. Please create categories first.', 'warning');
                        return;
                    }
                    
                    const categoryOptions = categories.map(cat => {
                        // Use _id if id is not available
                        const categoryId = cat.id || cat._id;
                        const isSelected = resource?.category_id === categoryId;
                        return `<option value="${categoryId}" ${isSelected ? 'selected' : ''}>${cat.name}</option>`;
                    }).join('');
                    
                    formHtml = `
                        <form id="bookForm">
                            <input type="hidden" name="id" value="${resource?.id || ''}">
                            <div class="form-group">
                                <label for="title">Title *</label>
                                <input type="text" id="title" name="title" value="${resource?.title || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="author">Author *</label>
                                <input type="text" id="author" name="author" value="${resource?.author || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="category_id">Category *</label>
                                <select id="category_id" name="category_id" required>
                                    <option value="">Select Category</option>
                                    ${categoryOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="cover_image_url">Cover Image URL *</label>
                                <input type="url" id="cover_image_url" name="cover_image_url" value="${resource?.cover_image_url || resource?.imageUrl || ''}" required>
                                <img src="${resource?.cover_image_url || resource?.imageUrl || ''}" class="image-preview" style="display: ${resource?.cover_image_url || resource?.imageUrl ? 'block' : 'none'}; max-width: 100px; margin-top: 10px;">
                            </div>
                             <div class="form-group">
                                <label for="book_url">Book File URL (e.g., PDF) *</label>
                                <input type="url" id="book_url" name="book_url" value="${resource?.book_url || resource?.bookUrl || ''}" required>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary close-modal-btn-form">Cancel</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-${resource ? 'save' : 'plus'}"></i>
                                    ${resource ? 'Save Changes' : 'Add Book'}
                                </button>
                            </div>
                        </form>
                    `;
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    showNotification('Failed to load categories. Please try again.', 'error');
                    return;
                }
                break;
            case 'categories':
                title = resource ? 'Edit Category' : 'Add New Category';
                formHtml = `
                    <form id="categoryForm">
                        <input type="hidden" name="id" value="${resource?.id || ''}">
                        <div class="form-group">
                            <label for="name">Category Name</label>
                            <input type="text" id="name" name="name" value="${resource?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description">${resource?.description || ''}</textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary close-modal-btn-form">Cancel</button>
                            <button type="submit" class="btn btn-primary">${resource ? 'Save Changes' : 'Add Category'}</button>
                        </div>
                    </form>
                `;
                break;
        }

        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = formHtml;
        if (formModal) formModal.classList.add('active');

        // Attach event listener to the new form
        const form = modalBody.querySelector('form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
            
            // Handle image preview for book form
            if (type === 'books') {
                const imageUrlInput = form.querySelector('#cover_image_url');
                const imagePreview = form.querySelector('.image-preview');
                if (imageUrlInput && imagePreview) {
                    imageUrlInput.addEventListener('input', () => {
                        if (imageUrlInput.value) {
                            imagePreview.src = imageUrlInput.value;
                            imagePreview.style.display = 'block';
                        } else {
                            imagePreview.style.display = 'none';
                        }
                    });
                }
            }
        }
        // Attach listeners to cancel buttons within the form
        modalBody.querySelectorAll('.close-modal-btn-form').forEach(btn => {
            btn.addEventListener('click', () => closeModal(formModal));
        });
    };

    const openDeleteConfirmModal = (type, id, name) => {
        console.log('Opening delete confirmation modal:', { type, id, name });
        
        currentResourceType = type;
        currentEditId = id;
        
        if (confirmModalTitle) {
            confirmModalTitle.textContent = `Delete ${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1)}`;
        }
        
        if (confirmModalText) {
            const itemName = name || 'this item';
            confirmModalText.textContent = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
        }
        
        if (confirmModal) {
            confirmModal.classList.add('active');
            console.log('Delete confirmation modal opened');
        } else {
            console.error('Confirm modal element not found');
        }
    };

    const closeModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.remove('active');
            console.log('Modal closed');
        }
    };

    // Modal close event listeners
    if (closeModalBtn && formModal) {
        closeModalBtn.addEventListener('click', () => closeModal(formModal));
    }
    
    if (confirmModalCancelBtn && confirmModal) {
        confirmModalCancelBtn.addEventListener('click', () => closeModal(confirmModal));
    }
    
    // Close modal on backdrop click
    [formModal, confirmModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal(modal);
                }
            });
        }
    });

    // --- Dashboard Stats & Real-time Data ---
    const loadDashboardStats = async () => {
        try {
            // Add loading visual feedback
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => card.classList.add('loading'));
            
            const stats = await fetchData('/stats');
            if (stats) {
                // Update the stat cards with real-time data
                const totalUsersElement = document.getElementById('totalUsersStat');
                const totalBooksElement = document.getElementById('totalBooksStat');
                const totalCategoriesElement = document.getElementById('totalCategoriesStat');
                
                // Remove loading state
                statCards.forEach(card => card.classList.remove('loading'));
                
                if (totalUsersElement) {
                    updateStatElement(totalUsersElement, stats.totalUsers || 0);
                }
                
                if (totalBooksElement) {
                    updateStatElement(totalBooksElement, stats.totalBooks || 0);
                }
                
                if (totalCategoriesElement) {
                    updateStatElement(totalCategoriesElement, stats.totalCategories || 0);
                }
                
                // Update last refreshed time
                const lastUpdated = new Date().toLocaleTimeString();
                console.log(`Dashboard stats updated at ${lastUpdated}`);
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            showNotification('Failed to load dashboard statistics', 'error');
            // Remove loading state on error
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => card.classList.remove('loading'));
        }
    };

    // Helper function to animate stat updates
    const updateStatElement = (element, newValue) => {
        const currentValue = parseInt(element.textContent) || 0;
        const statCard = element.closest('.stat-card');
        
        if (currentValue !== newValue) {
            // Add updating class for visual feedback
            statCard.classList.add('updating');
            
            // Animate the number change
            const duration = 500;
            const steps = 20;
            const increment = (newValue - currentValue) / steps;
            let current = currentValue;
            let step = 0;
            
            const timer = setInterval(() => {
                step++;
                current += increment;
                
                if (step >= steps) {
                    current = newValue;
                    clearInterval(timer);
                    // Remove updating class after animation
                    setTimeout(() => statCard.classList.remove('updating'), 200);
                }
                
                element.textContent = Math.round(current);
            }, duration / steps);
        }
    };

    // Refresh stats every 30 seconds for real-time updates
    const startStatsRefresh = () => {
        loadDashboardStats(); // Load immediately
        setInterval(loadDashboardStats, 30000); // Refresh every 30 seconds
    };

    // --- Enhanced Form Submit with Stats Refresh ---
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Show loading state on submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;

        try {
            // Enhanced validation for user form
            if (currentResourceType === 'users') {
                if (!currentEditId && !data.password) {
                    showNotification('Password is required for new users.', 'error');
                    return;
                }
                if (!data.username.trim()) {
                    showNotification('Username is required.', 'error');
                    return;
                }
                if (!data.email.trim()) {
                    showNotification('Email is required.', 'error');
                    return;
                }
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.email)) {
                    showNotification('Please enter a valid email address.', 'error');
                    return;
                }
            }

            // Enhanced validation for book form
            if (currentResourceType === 'books') {
                if (!data.title || !data.title.trim()) {
                    showNotification('Book title is required.', 'error');
                    return;
                }
                if (!data.author || !data.author.trim()) {
                    showNotification('Book author is required.', 'error');
                    return;
                }
                if (!data.book_url || !data.book_url.trim()) {
                    showNotification('Book URL is required.', 'error');
                    return;
                }
                if (!data.cover_image_url || !data.cover_image_url.trim()) {
                    showNotification('Cover image URL is required.', 'error');
                    return;
                }
                if (!data.category_id || data.category_id.trim() === '') {
                    showNotification('Please select a category for the book.', 'error');
                    return;
                }
            }

            // Remove empty password for updates
            if (currentResourceType === 'users' && currentEditId && !data.password) {
                delete data.password;
            }

            // --- FIELD MAPPING FOR BACKEND COMPATIBILITY ---
            if (currentResourceType === 'users') {
                data.isAdmin = data.role === 'admin';
                delete data.role;
                // Trim whitespace from fields
                data.username = data.username.trim();
                data.email = data.email.trim().toLowerCase();
            }
            if (currentResourceType === 'books') {
                data.bookUrl = data.book_url;
                data.imageUrl = data.cover_image_url;
                
                // Only map category if we have a valid value
                if (data.category_id && data.category_id.trim() !== '' && data.category_id !== 'undefined') {
                    data.category = data.category_id.trim();
                }
                
                delete data.book_url;
                delete data.cover_image_url;
                delete data.category_id;
            }

            const endpoint = `/${currentResourceType}${currentEditId ? '/' + currentEditId : ''}`;
            const method = currentEditId ? 'PUT' : 'POST';

            const result = await fetchData(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (result) {
                const action = currentEditId ? 'updated' : 'added';
                const resourceName = currentResourceType.slice(0, -1);
                showNotification(`${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} ${action} successfully!`, 'success');
                closeModal(formModal);
                
                // Refresh relevant table and stats
                await loadDataForTable(currentResourceType);
                loadDashboardStats();
            }
        } catch (error) {
            console.error(`Error submitting form for ${currentResourceType}:`, error);
            showNotification(`An error occurred: ${error.message}`, 'error');
        } finally {
            // Restore submit button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    };

    // --- Enhanced Delete with Proper Validation ---
    if (confirmModalConfirmBtn) {
        confirmModalConfirmBtn.addEventListener('click', async () => {
            console.log('Confirm button clicked');
            console.log('Current state:', { currentResourceType, currentEditId });
            
            // Handle logout confirmation
            if (currentResourceType === 'logout') {
                console.log('Logout confirmed');
                closeModal(confirmModal);
                await performLogout();
                return;
            }
            
            // Enhanced validation for deletion
            if (!currentResourceType || !currentEditId || currentEditId === 'undefined' || currentEditId === '') {
                console.error('Invalid deletion state:', { currentResourceType, currentEditId });
                showNotification('Invalid item selected for deletion.', 'error');
                closeModal(confirmModal);
                return;
            }
            
            // Show loading state on confirm button
            const originalText = confirmModalConfirmBtn.innerHTML;
            confirmModalConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            confirmModalConfirmBtn.disabled = true;
            
            try {
                const endpoint = `/${currentResourceType}/${currentEditId}`;
                console.log(`Attempting to delete: ${endpoint}`);
                
                const result = await fetchData(endpoint, { method: 'DELETE' });
                console.log('Delete result:', result);
                
                if (result) {
                    const resourceName = currentResourceType.slice(0, -1);
                    showNotification(`${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} deleted successfully!`, 'success');
                    closeModal(confirmModal);
                    
                    // Refresh table and stats
                    console.log('Refreshing table and stats after deletion');
                    await loadDataForTable(currentResourceType);
                    loadDashboardStats();
                    
                    console.log(`${resourceName} deleted successfully`);
                } else {
                    console.error('Delete operation returned no result');
                    showNotification('Delete operation failed - no response from server', 'error');
                }
            } catch (error) {
                console.error(`Error deleting ${currentResourceType}:`, error);
                showNotification(`An error occurred during deletion: ${error.message}`, 'error');
            } finally {
                // Restore button state
                confirmModalConfirmBtn.innerHTML = originalText;
                confirmModalConfirmBtn.disabled = false;
                console.log('Delete button state restored');
            }
        });
    } else {
        console.error('confirmModalConfirmBtn not found');
    }

    // --- Table Rendering and Data Loading ---
    // Enhanced table rendering with visual feedback
    const renderTable = (resourceType, data, columns) => {
        const tableBody = document.querySelector(`#${resourceType}Table tbody`);
        if (!tableBody) return;
        
        // Add fade-out effect before clearing
        tableBody.style.opacity = '0.5';
        
        setTimeout(() => {
            tableBody.innerHTML = ''; // Clear existing rows

            if (!data || data.length === 0) {
                const colSpan = columns.length;
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="${colSpan}" style="text-align:center; padding: 20px; color: var(--text-secondary);">
                            <i class="fas fa-info-circle"></i> No ${resourceType} found.
                        </td>
                    </tr>`;
            } else {
                data.forEach((item, index) => {
                    const row = tableBody.insertRow();
                    row.style.opacity = '0';
                    row.style.transform = 'translateY(10px)';
                    
                    columns.forEach(col => {
                        const cell = row.insertCell();
                        if (col.render) {
                            cell.innerHTML = col.render(item);
                        } else {
                            // Handle the value properly - 0 is a valid value, only show '-' for null/undefined
                            const value = item[col.key];
                            cell.textContent = (value !== undefined && value !== null) ? value : '-';
                        }
                    });
                    
                    // Animate row appearance
                    setTimeout(() => {
                        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        row.style.opacity = '1';
                        row.style.transform = 'translateY(0)';
                    }, index * 50);
                });
            }
            
            // Restore table opacity
            tableBody.style.opacity = '1';
        }, 150);
    };

    const userColumns = [
        { key: 'id', label: 'ID' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'created_at', label: 'Joined Date', render: (item) => new Date(item.created_at).toLocaleDateString() },
        { key: 'actions', label: 'Actions', render: (item) => `
            <div class="action-btns">
                <button class="edit-btn" data-id="${item.id}" data-type="users" title="Edit User"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${item.id}" data-name="${item.username}" data-type="users" title="Delete User"><i class="fas fa-trash-alt"></i></button>
            </div>`
        }
    ];

    const bookColumns = [
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author' },
        { key: 'category_name', label: 'Category' }, // Assuming category_name is joined or fetched
        { key: 'actions', label: 'Actions', render: (item) => `
            <div class="action-btns">
                <button class="edit-btn" data-id="${item.id}" data-type="books" title="Edit Book"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${item.id}" data-name="${item.title}" data-type="books" title="Delete Book"><i class="fas fa-trash-alt"></i></button>
            </div>`
        }
    ];

    const categoryColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { key: 'book_count', label: 'Book Count' }, // Assuming this comes from API
        { key: 'actions', label: 'Actions', render: (item) => `
            <div class="action-btns">
                <button class="edit-btn" data-id="${item.id}" data-type="categories" title="Edit Category"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${item.id}" data-name="${item.name}" data-type="categories" title="Delete Category"><i class="fas fa-trash-alt"></i></button>
            </div>`
        }
    ];

    const loadDataForTable = async (resourceType, filters = {}) => {
        try {
            // Build query parameters for filtering and searching
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.role) params.role = filters.role;
            if (filters.category) params.category = filters.category;
            
            const data = await fetchData(`/${resourceType}`, { method: 'GET', params });
            
            if (data) {
                let columns;
                switch (resourceType) {
                    case 'users': 
                        columns = userColumns; 
                        break;
                    case 'books': 
                        columns = bookColumns; 
                        // Check if any filters are applied
                        const hasFilters = filters.search || filters.category;
                        if (!hasFilters) {
                            // Store total count when no filters are applied
                            totalBookCount = data.length;
                            updateBookCount(data.length, false);
                        } else {
                            // Show filtered count while keeping total count
                            updateBookCount(data.length, true);
                            // Make sure total count is still displayed
                            const bookCountElement = document.getElementById('totalBooksCount');
                            if (bookCountElement) {
                                bookCountElement.textContent = totalBookCount;
                            }
                        }
                        break;
                    case 'categories': 
                        columns = categoryColumns; 
                        localStorage.setItem('categoriesData', JSON.stringify(data)); // Save for book form dropdown
                        populateCategoryFilter(data); // Populate book filter
                        
                        // Debug: Check if book_count is in the data
                        console.log('Categories data received:', data);
                        if (data.length > 0) {
                            console.log('First category sample:', data[0]);
                            console.log('Has book_count field:', 'book_count' in data[0]);
                        }
                        break;
                }
                renderTable(resourceType, data, columns);
            }
        } catch (error) {
            console.error(`Error loading ${resourceType} data:`, error);
            showNotification(`Failed to load ${resourceType} data`, 'error');
        }
    };

    // Event delegation for table action buttons
    document.querySelector('.page-content').addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const id = target.dataset.id;
        const type = target.dataset.type;
        const name = target.dataset.name;

        console.log('Button clicked:', { 
            id, 
            type, 
            name, 
            classList: target.classList.toString(),
            hasEditClass: target.classList.contains('edit-btn'),
            hasDeleteClass: target.classList.contains('delete-btn')
        });

        if (target.classList.contains('edit-btn')) {
            // Fetch the single item data to pre-fill the form
            console.log(`Fetching ${type} with ID: ${id} for editing`);
            fetchData(`/${type}/${id}`)
                .then(async itemData => {
                    if (itemData) {
                        console.log('Item data for editing:', itemData);
                        await openModal(type, itemData);
                    }
                })
                .catch(error => {
                    console.error('Error fetching item for edit:', error);
                    showNotification('Failed to load item for editing', 'error');
                });
        } else if (target.classList.contains('delete-btn')) {
            console.log(`Opening delete confirmation for ${type} with ID: ${id}, name: ${name}`);
            openDeleteConfirmModal(type, id, name);
        } else {
            console.log('Button click not handled - no matching class found');
        }
    });

    // Add button listeners with async support
    document.getElementById('addUserBtn')?.addEventListener('click', async () => await openModal('users'));
    document.getElementById('addBookBtn')?.addEventListener('click', async () => await openModal('books'));
    document.getElementById('addCategoryBtn')?.addEventListener('click', async () => await openModal('categories'));

    // --- Enhanced Filters with Real-time Search --- 
    const setupFilters = () => {
        // User Filters with debounced search
        const userSearchInput = document.getElementById('userSearchInput');
        const userRoleFilter = document.getElementById('userRoleFilter');
        
        let userSearchTimeout;
        
        if (userSearchInput) {
            userSearchInput.addEventListener('input', (e) => {
                clearTimeout(userSearchTimeout);
                userSearchTimeout = setTimeout(() => {
                    const searchValue = e.target.value.trim();
                    const roleValue = userRoleFilter ? userRoleFilter.value : '';
                    loadDataForTable('users', { search: searchValue, role: roleValue });
                }, 300); // Debounce for 300ms
            });
        }
        
        if (userRoleFilter) {
            userRoleFilter.addEventListener('change', (e) => {
                const searchValue = userSearchInput ? userSearchInput.value.trim() : '';
                const roleValue = e.target.value;
                loadDataForTable('users', { search: searchValue, role: roleValue });
            });
        }

        // Book Filters with debounced search
        const bookSearchInput = document.getElementById('bookSearchInput');
        const bookCategoryFilter = document.getElementById('bookCategoryFilter');
        
        let bookSearchTimeout;
        
        if (bookSearchInput) {
            bookSearchInput.addEventListener('input', (e) => {
                clearTimeout(bookSearchTimeout);
                bookSearchTimeout = setTimeout(() => {
                    const searchValue = e.target.value.trim();
                    const categoryValue = bookCategoryFilter ? bookCategoryFilter.value : '';
                    loadDataForTable('books', { search: searchValue, category: categoryValue });
                }, 300);
            });
        }
        
        if (bookCategoryFilter) {
            bookCategoryFilter.addEventListener('change', (e) => {
                const searchValue = bookSearchInput ? bookSearchInput.value.trim() : '';
                const categoryValue = e.target.value;
                loadDataForTable('books', { search: searchValue, category: categoryValue });
            });
        }
        
        // Category Filters
        const categorySearchInput = document.getElementById('categorySearchInput');
        let categorySearchTimeout;
        
        if (categorySearchInput) {
            categorySearchInput.addEventListener('input', (e) => {
                clearTimeout(categorySearchTimeout);
                categorySearchTimeout = setTimeout(() => {
                    const searchValue = e.target.value.trim();
                    loadDataForTable('categories', { search: searchValue });
                }, 300);
            });
        }
    };

    const populateCategoryFilter = (categories) => {
        const filterSelect = document.getElementById('bookCategoryFilter');
        if (!filterSelect) return;
        
        // Clear existing options except "All Categories"
        while (filterSelect.children.length > 1) {
            filterSelect.removeChild(filterSelect.lastChild);
        }
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id || cat._id; // Handle both id and _id
            option.textContent = cat.name;
            filterSelect.appendChild(option);
        });
    };

    // Update book count display
    const updateBookCount = (count, isFiltered = false) => {
        const bookCountElement = document.getElementById('totalBooksCount');
        const filteredCountElement = document.getElementById('filteredBooksCount');
        const filteredContainer = document.getElementById('filteredBooksContainer');
        
        if (isFiltered) {
            // Show filtered count
            if (filteredCountElement) {
                filteredCountElement.textContent = count;
            }
            if (filteredContainer) {
                filteredContainer.style.display = 'flex';
            }
        } else {
            // Update total count and hide filtered count
            if (bookCountElement) {
                bookCountElement.textContent = count;
            }
            if (filteredContainer) {
                filteredContainer.style.display = 'none';
            }
        }
    };

    // --- Notifications ---
    const notificationToast = document.getElementById('notification-toast');
    const toastIcon = notificationToast?.querySelector('.toast-icon i');
    const toastMessage = notificationToast?.querySelector('.toast-message');
    let toastTimeout;

    const showNotification = (message, type = 'success') => {
        if (!notificationToast || !toastIcon || !toastMessage) return;

        clearTimeout(toastTimeout);

        toastMessage.textContent = message;
        notificationToast.className = 'notification-toast'; // Reset classes
        notificationToast.classList.add(type); // error, success, warning
        
        if (type === 'success') toastIcon.className = 'fas fa-check-circle';
        else if (type === 'error') toastIcon.className = 'fas fa-times-circle';
        else if (type === 'warning') toastIcon.className = 'fas fa-exclamation-triangle';
        else toastIcon.className = 'fas fa-info-circle';

        notificationToast.classList.add('show');
        toastTimeout = setTimeout(() => {
            notificationToast.classList.remove('show');
        }, 4000);
    };

    // --- Initial Data Load with Real-time Stats ---
    const initialLoad = () => {
        console.log('Initializing admin dashboard...');
        startStatsRefresh(); // Start real-time stats updates
        
        // Load all data tables
        loadDataForTable('users');
        loadDataForTable('books');
        loadDataForTable('categories'); // This will also populate book category filter
        
        setupFilters();
        console.log('Admin dashboard initialized successfully');
    };

    initialLoad();

    // --- LOGOUT FUNCTIONALITY ---
    const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();
            console.log('Logout button clicked');
            
            // Use the existing confirmation modal for logout
            if (confirmModal && confirmModalTitle && confirmModalText) {
                currentResourceType = 'logout'; // Special type for logout
                currentEditId = null;
                
                confirmModalTitle.textContent = 'Confirm Logout';
                confirmModalText.textContent = 'Are you sure you want to logout? You will be redirected to the login page.';
                confirmModal.classList.add('active');
                
                console.log('Logout confirmation modal opened');
            } else {
                // Fallback to basic confirm if modal not available
                const confirmLogout = confirm('Are you sure you want to logout?');
                if (confirmLogout) {
                    await performLogout();
                }
            }
        });
        
        console.log('Logout button functionality initialized');
    } else {
        console.error('Logout button not found');
    }
    
    // Function to perform the actual logout
    const performLogout = async () => {
        console.log('Performing logout...');
        
        try {
            console.log('Sending logout request...');
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Include cookies/session
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Logout successful:', result);
                
                // Show success message
                showNotification('Logged out successfully', 'success');
                
                // Clear any local storage
                localStorage.removeItem('categoriesData');
                
                // Small delay before redirect for better UX
                setTimeout(() => {
                    console.log('Redirecting to login page...');
                    window.location.href = '/login.html';
                }, 1000);
                
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Logout failed' }));
                throw new Error(errorData.message || 'Logout failed');
            }
            
        } catch (error) {
            console.error('Logout error:', error);
            showNotification(`Logout failed: ${error.message}`, 'error');
        }
    };
});
