// ============================================
// USER MANAGEMENT SYSTEM
// ============================================

// Sample users database
let users = [
    { id: 1, name: "Ana", email: "ana@email.com", role: "user", password: "user123" },
    { id: 2, name: "Juan", email: "juan@email.com", role: "user", password: "user123" },
    { id: 3, name: "Admin User", email: "admin@example.com", role: "admin", password: "admin123" }
];

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Login function
function handleLogin(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Redirect based on role
        if (user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "profile.html";
        }
        return true;
    }
    return false;
}

// Check if user is logged in and is admin
function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = "login.html";
        return false;
    }
    if (user.role !== "admin") {
        alert("🔒 Access denied. Admin privileges required.");
        window.location.href = "profile.html";
        return false;
    }
    return true;
}

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = "index.html";
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// ============================================
// USER MANAGEMENT FUNCTIONS (ADMIN)
// ============================================

// Load users in manage-users.html
function loadUsers() {
    if (document.getElementById('userTableBody')) {
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';
        
        if (users.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 5;
            cell.style.textAlign = 'center';
            cell.style.padding = '30px';
            cell.style.color = '#888';
            cell.textContent = 'No users found. Add your first user above!';
            return;
        }
        
        users.forEach(user => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td class="action-buttons">
                    <button onclick="editUser(${user.id})" class="btn-edit">✎ Edit</button>
                    <button onclick="deleteUser(${user.id})" class="btn-delete">🗑 Delete</button>
                </td>
            `;
        });
    }
}

// Delete user
function deleteUser(id) {
    // Prevent deleting the main admin
    if (id === 3) {
        alert("⚠️ Cannot delete the main admin user!");
        return;
    }
    
    // Don't allow deleting yourself
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === id) {
        alert("⚠️ You cannot delete your own account!");
        return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(user => user.id !== id);
        loadUsers();
        updateUserCount();
        alert('✅ User deleted successfully!');
    }
}

// Edit user
function editUser(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editName').value = user.name;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editRole').value = user.role;
        document.getElementById('editModal').style.display = 'block';
    }
}

// Add new user (FIXED - works with manage-users.html)
function addUser(event) {
    if (event) {
        event.preventDefault();
    }
    
    // Get form elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const roleSelect = document.getElementById('role');
    const passwordInput = document.getElementById('password');
    
    // Check if elements exist (for manage-users.html)
    if (!nameInput || !emailInput || !roleSelect || !passwordInput) {
        console.log('Add user form not found on this page');
        return false;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    const password = passwordInput.value;
    
    // Validation
    if (!name || !email || !role || !password) {
        alert('❌ Please fill in all fields');
        return false;
    }
    
    if (name.length < 3) {
        alert('❌ Name must be at least 3 characters long');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Please enter a valid email address');
        return false;
    }
    
    if (password.length < 6) {
        alert('❌ Password must be at least 6 characters long');
        return false;
    }
    
    // Check if email already exists (case insensitive)
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        alert('❌ Email already exists!');
        return false;
    }
    
    // Generate new ID
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser = {
        id: newId,
        name: name,
        email: email,
        role: role,
        password: password
    };
    
    // Add to users array
    users.push(newUser);
    
    // Clear form
    nameInput.value = '';
    emailInput.value = '';
    roleSelect.value = 'user';
    passwordInput.value = '';
    
    // Update preview
    if (typeof updatePreview === 'function') {
        updatePreview();
    }
    
    // Reload the users table
    loadUsers();
    
    // Update user count
    updateUserCount();
    
    alert('✅ User added successfully!');
    return false;
}

// Update user
function updateUser() {
    const id = parseInt(document.getElementById('editUserId').value);
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const role = document.getElementById('editRole').value;
    
    // Validation
    if (!name || !email) {
        alert('❌ Please fill in all fields');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Please enter a valid email address');
        return;
    }
    
    // Check if email already exists (excluding current user)
    const emailExists = users.some(u => u.id !== id && u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
        alert('❌ Email already exists!');
        return;
    }
    
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], name, email, role };
        loadUsers();
        closeEditModal();
        updateUserCount();
        alert('✅ User updated successfully!');
    }
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update user count on dashboard
function updateUserCount() {
    const userCountElements = document.querySelectorAll('#userCount');
    userCountElements.forEach(el => {
        if (el) el.textContent = users.length;
    });
}

// Update preview in add user form (for manage-users.html)
function updatePreview() {
    const previewName = document.getElementById('previewName');
    const previewEmail = document.getElementById('previewEmail');
    const previewRole = document.getElementById('previewRole');
    
    if (previewName) {
        const nameInput = document.getElementById('name');
        previewName.textContent = nameInput ? nameInput.value || '—' : '—';
    }
    if (previewEmail) {
        const emailInput = document.getElementById('email');
        previewEmail.textContent = emailInput ? emailInput.value || '—' : '—';
    }
    if (previewRole) {
        const roleSelect = document.getElementById('role');
        if (roleSelect) {
            previewRole.textContent = roleSelect.options[roleSelect.selectedIndex]?.text || '—';
        }
    }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

// Validate login form
function validateLoginForm(email, password) {
    let errors = [];
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address");
    }
    
    // Password validation
    if (password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }
    
    return errors;
}

// Validate signup form
function validateSignupForm(name, email, password, confirmPassword) {
    let errors = [];
    
    // Name validation
    if (name.length < 3) {
        errors.push("Full name must be at least 3 characters");
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address");
    }
    
    // Password validation
    if (password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }
    
    // Confirm password
    if (password !== confirmPassword) {
        errors.push("Passwords do not match");
    }
    
    return errors;
}

// ============================================
// PAGE INITIALIZATION
// ============================================

// Initialize page based on current file
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Update navigation active state and visibility
    updateNavigation();
    
    // Check authentication for protected pages
    if (currentPage.includes('admin.html') || currentPage.includes('manage-users.html')) {
        checkAdminAccess();
    } else if (currentPage.includes('profile.html') || currentPage.includes('settings.html')) {
        checkAuth();
    }
    
    // Load users if on manage-users page
    if (currentPage.includes('manage-users.html')) {
        loadUsers();
        
        // Setup preview listeners for manage-users.html
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const roleSelect = document.getElementById('role');
        
        if (nameInput) nameInput.addEventListener('input', updatePreview);
        if (emailInput) emailInput.addEventListener('input', updatePreview);
        if (roleSelect) roleSelect.addEventListener('change', updatePreview);
        
        // Setup form submission
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addUser(e);
            });
        }
    }
    
    // Display user info on profile/settings pages
    displayUserInfo();
    
    // Update user count on admin dashboard
    updateUserCount();
    
    // Setup login form if on login page
    if (currentPage.includes('login.html')) {
        setupLoginForm();
    }
    
    // Setup signup form if on signup page
    if (currentPage.includes('signup.html')) {
        setupSignupForm();
    }
});

// Update navigation based on login state
function updateNavigation() {
    const user = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    // Update navbar for profile page
    if (currentPage === 'profile.html') {
        const navbar = document.querySelector('.navbar div:last-child');
        if (navbar) {
            navbar.innerHTML = `
                <a href="index.html" class="nav-btn">Home</a>
                <a href="settings.html" class="nav-btn">Settings</a>
                <a href="#" onclick="logout()" class="nav-btn">Logout</a>
            `;
        }
        
        // Update sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            let sidebarLinks = `
                <a href="index.html">🏠 Home</a>
                <a href="profile.html" class="active">👤 Profile</a>
                <a href="settings.html">⚙ Settings</a>
            `;
            
            // Add admin link only for admin users
            if (user && user.role === 'admin') {
                sidebarLinks += `<a href="admin.html">👑 Admin</a>`;
            }
            
            sidebarLinks += `<a href="#" onclick="logout()">🚪 Logout</a>`;
            sidebar.innerHTML = sidebarLinks;
        }
    }
    
    // Update navbar for settings page
    if (currentPage === 'settings.html') {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            let sidebarLinks = `
                <a href="index.html">🏠 Home</a>
                <a href="profile.html">👤 Profile</a>
                <a href="settings.html" class="active">⚙ Settings</a>
            `;
            
            // Add admin link only for admin users
            if (user && user.role === 'admin') {
                sidebarLinks += `<a href="admin.html">👑 Admin</a>`;
            }
            
            sidebarLinks += `<a href="#" onclick="logout()">🚪 Logout</a>`;
            sidebar.innerHTML = sidebarLinks;
        }
    }
}

// Display user info on profile/settings pages
function displayUserInfo() {
    const user = getCurrentUser();
    
    // Update profile page
    if (window.location.pathname.includes('profile.html')) {
        const nameElement = document.querySelector('.profile-card h3');
        const emailElement = document.querySelector('.profile-card p:first-of-type');
        
        if (nameElement && user) {
            nameElement.textContent = user.name;
        }
        if (emailElement && user) {
            emailElement.textContent = `Email: ${user.email}`;
        }
    }
    
    // Update admin dashboard
    if (window.location.pathname.includes('admin.html')) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && user) {
            userNameElement.textContent = user.name;
        }
    }
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Validate form
            const errors = validateLoginForm(email, password);
            
            if (errors.length > 0) {
                alert('❌ ' + errors.join('\n'));
                return;
            }
            
            // Attempt login
            if (handleLogin(email, password)) {
                // Login successful - redirect happens in handleLogin
            } else {
                alert('❌ Invalid email or password.\n\nTry:\nAdmin: admin@example.com / admin123\nUser: ana@email.com / user123');
            }
        });
    }
}

// Setup signup form
function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            
            // Validate form
            const errors = validateSignupForm(name, email, password, password);
            
            if (errors.length > 0) {
                alert('❌ ' + errors.join('\n'));
                return;
            }
            
            // Check if email already exists
            if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
                alert('❌ Email already exists!');
                return;
            }
            
            // Create new user
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            
            const newUser = {
                id: newId,
                name: name,
                email: email,
                role: 'user',
                password: password
            };
            
            users.push(newUser);
            alert('✅ Account created successfully! Please login.');
            window.location.href = 'login.html';
        });
    }
}

// Make functions globally available
window.addUser = addUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.updateUser = updateUser;
window.closeEditModal = closeEditModal;
window.logout = logout;
window.updatePreview = updatePreview;

// API endpoint
const API_BASE_URL = 'https://restcountries.com/v3.1';

// DOM elements
const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('result');
const errorContainer = document.getElementById('error');
const exampleButtons = document.querySelectorAll('.example-country');

// Event listeners
searchBtn.addEventListener('click', searchCountry);
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCountry();
    }
});

// Add event listeners to example buttons
exampleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const country = button.dataset.country;
        countryInput.value = country;
        searchCountry();
    });
});

// Main search function
async function searchCountry() {
    const countryName = countryInput.value.trim();
    
    // Validate input
    if (!countryName) {
        showError('Please enter a country name');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    // Clear previous results
    clearResults();
    
    try {
        // Fetch data from API
        const response = await fetch(`${API_BASE_URL}/name/${encodeURIComponent(countryName)}?fullText=true`);
        
        // Check if response is ok
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Country not found. Please check the spelling and try again.');
            } else {
                throw new Error('Failed to fetch country data. Please try again later.');
            }
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Check if data exists
        if (!data || data.length === 0) {
            throw new Error('No information found for this country.');
        }
        
        // Display the country data
        displayCountryData(data[0]);
        
    } catch (error) {
        // Handle errors
        showError(error.message);
    } finally {
        // Hide loading state
        setLoadingState(false);
    }
}

// Display country data in the UI
function displayCountryData(country) {
    // Create country card HTML
    const countryHTML = `
        <div class="country-card">
            <div class="country-flag">
                <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
            </div>
            <div class="country-info">
                <h2>${country.name.common}</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <h4>Official Name</h4>
                        <p>${country.name.official}</p>
                    </div>
                    <div class="info-item">
                        <h4>Capital</h4>
                        <p>${country.capital ? country.capital[0] : 'N/A'}</p>
                    </div>
                    <div class="info-item">
                        <h4>Population</h4>
                        <p>${country.population.toLocaleString()}</p>
                    </div>
                    <div class="info-item">
                        <h4>Region</h4>
                        <p>${country.region}</p>
                    </div>
                    <div class="info-item">
                        <h4>Subregion</h4>
                        <p>${country.subregion || 'N/A'}</p>
                    </div>
                    <div class="info-item">
                        <h4>Area</h4>
                        <p>${country.area.toLocaleString()} km²</p>
                    </div>
                    <div class="info-item">
                        <h4>Currency</h4>
                        <p>${getCurrency(country.currencies)}</p>
                    </div>
                    <div class="info-item">
                        <h4>Languages</h4>
                        <p>${getLanguages(country.languages)}</p>
                    </div>
                    <div class="info-item">
                        <h4>Time Zone</h4>
                        <p>${country.timezones[0]}</p>
                    </div>
                    <div class="info-item">
                        <h4>Continent</h4>
                        <p>${country.continents[0]}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Update result container
    resultContainer.innerHTML = countryHTML;
    resultContainer.classList.add('active');
}

// Helper function to get currency information
function getCurrency(currencies) {
    if (!currencies) return 'N/A';
    const currencyCode = Object.keys(currencies)[0];
    if (!currencyCode) return 'N/A';
    const currency = currencies[currencyCode];
    return `${currency.name} (${currency.symbol})`;
}

// Helper function to get languages
function getLanguages(languages) {
    if (!languages) return 'N/A';
    return Object.values(languages).join(', ');
}

// Show error message
function showError(message) {
    errorContainer.innerHTML = `
        <strong>Error:</strong> ${message}
    `;
    errorContainer.classList.add('active');
    
    // Hide result container
    resultContainer.classList.remove('active');
}

// Clear previous results
function clearResults() {
    resultContainer.innerHTML = '';
    errorContainer.innerHTML = '';
    errorContainer.classList.remove('active');
}

// Set loading state
function setLoadingState(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? 'Searching...' : 'Search';
    
    if (isLoading) {
        // Show loading spinner
        const loader = document.createElement('div');
        loader.className = 'loader active';
        loader.id = 'loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <p>Searching for country...</p>
        `;
        resultContainer.parentNode.insertBefore(loader, resultContainer);
    } else {
        // Remove loading spinner
        const loader = document.getElementById('loader');
        if (loader) {
            loader.remove();
        }
    }
}

// Initialize the app
function init() {
    // Load a default country on page load
    countryInput.value = 'Philippines';
    searchCountry();
}

// Call init when page loads
document.addEventListener('DOMContentLoaded', init);