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
        
        if (user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "profile.html";
        }
        return true;
    }
    return false;
}

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

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = "index.html";
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// ============================================
// USER MANAGEMENT FUNCTIONS (ADMIN)
// ============================================

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

function deleteUser(id) {
    if (id === 3) {
        alert("⚠️ Cannot delete the main admin user!");
        return;
    }
    
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

function addUser(event) {
    if (event) {
        event.preventDefault();
    }
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const roleSelect = document.getElementById('role');
    const passwordInput = document.getElementById('password');
    
    if (!nameInput || !emailInput || !roleSelect || !passwordInput) {
        console.log('Add user form not found on this page');
        return false;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    const password = passwordInput.value;
    
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
    
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        alert('❌ Email already exists!');
        return false;
    }
    
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser = {
        id: newId,
        name: name,
        email: email,
        role: role,
        password: password
    };
    
    users.push(newUser);
    
    nameInput.value = '';
    emailInput.value = '';
    roleSelect.value = 'user';
    passwordInput.value = '';
    
    if (typeof updatePreview === 'function') {
        updatePreview();
    }
    
    loadUsers();
    updateUserCount();
    
    alert('✅ User added successfully!');
    return false;
}

function updateUser() {
    const id = parseInt(document.getElementById('editUserId').value);
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const role = document.getElementById('editRole').value;
    
    if (!name || !email) {
        alert('❌ Please fill in all fields');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Please enter a valid email address');
        return;
    }
    
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

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateUserCount() {
    const userCountElements = document.querySelectorAll('#userCount');
    userCountElements.forEach(el => {
        if (el) el.textContent = users.length;
    });
}

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

function validateLoginForm(email, password) {
    let errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address");
    }
    if (password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }
    return errors;
}

function validateSignupForm(name, email, password, confirmPassword) {
    let errors = [];
    if (name.length < 3) {
        errors.push("Full name must be at least 3 characters");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address");
    }
    if (password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }
    if (password !== confirmPassword) {
        errors.push("Passwords do not match");
    }
    return errors;
}

// ============================================
// OPENTRIPMAP API INTEGRATION
// ============================================

// OpenTripMap API Key (Free - get your own at https://opentripmap.io/product)
const OPENTRIPMAP_API_KEY = '5ae2e3f221c38a28845f05b6c3bb6d2a93c07690bfc522c8f248363f';
const OPENTRIPMAP_BASE = 'https://api.opentripmap.com/0.1/en/places';

// REST Countries API
const API_BASE_URL = 'https://restcountries.com/v3.1';

// Global variables
let countryInput, searchBtn, resultContainer, errorContainer, exampleButtons;
let currentCountryData = null;

// ============================================
// ATTRACTION DETAILS DATABASE
// ============================================

async function showAttractionDetails(attractionName, countryName, xid = null) {
    let details = null;
    
    // If we have xid, fetch real details from OpenTripMap
    if (xid) {
        try {
            const detailUrl = `${OPENTRIPMAP_BASE}/xid/${xid}?apikey=${OPENTRIPMAP_API_KEY}`;
            const response = await fetch(detailUrl);
            if (response.ok) {
                const data = await response.json();
                details = {
                    fullDescription: data.wikipedia_extracts?.text || data.info?.descr || `${attractionName} is a beautiful attraction in ${countryName}.`,
                    bestTimeToVisit: getBestTimeToVisit(countryName),
                    activities: data.kinds ? data.kinds.split(',').slice(0, 5) : ["Sightseeing", "Photography", "Local Exploration"],
                    entranceFee: getEntranceFee(attractionName),
                    location: data.address?.city || data.address?.country || countryName,
                    howToGetThere: "Accessible via local transportation. Check local tourism office for details.",
                    openingHours: getOpeningHours(attractionName),
                    website: data.wikipedia ? `https://en.wikipedia.org/wiki/${encodeURIComponent(attractionName)}` : null
                };
            }
        } catch (error) {
            console.log('Error fetching attraction details:', error);
        }
    }
    
    // Fallback details if API fails
    if (!details) {
        details = {
            fullDescription: `${attractionName} is a must-visit attraction in ${countryName}. Experience the beauty, culture, and history of this amazing destination.`,
            bestTimeToVisit: getBestTimeToVisit(countryName),
            activities: ["Sightseeing", "Photography", "Cultural Experience", "Local Exploration"],
            entranceFee: "Check local tourism websites for current rates",
            location: countryName,
            howToGetThere: "Accessible via local transportation or tour operators",
            openingHours: "Varies by season - check locally"
        };
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="attractionModal" class="modal attraction-modal">
            <div class="modal-content attraction-modal-content">
                <span class="close-modal" onclick="closeAttractionModal()">&times;</span>
                <div class="attraction-modal-header">
                    <h2>${attractionName}</h2>
                    <p class="attraction-location">📍 ${details.location}</p>
                </div>
                <div class="attraction-modal-body">
                    <div class="attraction-detail-section">
                        <h3>📝 Description</h3>
                        <p>${details.fullDescription}</p>
                    </div>
                    <div class="attraction-detail-section">
                        <h3>📅 Best Time to Visit</h3>
                        <p>${details.bestTimeToVisit}</p>
                    </div>
                    <div class="attraction-detail-section">
                        <h3>🎯 Activities</h3>
                        <ul class="activities-list">
                            ${details.activities.map(activity => `<li>${activity.charAt(0).toUpperCase() + activity.slice(1)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="attraction-detail-section">
                        <h3>💰 Entrance Fee</h3>
                        <p>${details.entranceFee}</p>
                    </div>
                    <div class="attraction-detail-section">
                        <h3>🚗 How to Get There</h3>
                        <p>${details.howToGetThere}</p>
                    </div>
                    <div class="attraction-detail-section">
                        <h3>🕐 Opening Hours</h3>
                        <p>${details.openingHours}</p>
                    </div>
                    ${details.website ? `
                    <div class="attraction-detail-section">
                        <h3>🌐 Learn More</h3>
                        <a href="${details.website}" target="_blank" class="website-link">View on Wikipedia →</a>
                    </div>
                    ` : ''}
                </div>
                <div class="attraction-modal-footer">
                    <button onclick="closeAttractionModal()" class="cta">Close</button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('attractionModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('attractionModal');
    modal.style.display = 'block';
    
    modal.onclick = function(event) {
        if (event.target === modal) closeAttractionModal();
    };
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAttractionModal();
    });
}

function closeAttractionModal() {
    const modal = document.getElementById('attractionModal');
    if (modal) modal.remove();
}

function getBestTimeToVisit(countryName) {
    const seasons = {
        "Philippines": "November to May (Dry Season)",
        "Japan": "Spring (March-May) for cherry blossoms, Autumn (Oct-Nov)",
        "France": "Spring (April-June) and Fall (September-October)",
        "Italy": "Spring (April-June) and Fall (September-October)",
        "Thailand": "November to February (Cool and dry season)",
        "Spain": "Spring (March-May) and Fall (September-November)",
        "Australia": "September to November (Spring) and March to May (Autumn)",
        "Egypt": "October to April (Cooler months)"
    };
    return seasons[countryName] || "Varies by region - check local climate";
}

function getEntranceFee(attractionName) {
    const fees = {
        "Eiffel Tower": "Adult: €16-26, Children: €4-13",
        "Colosseum": "Adult: €16, EU 18-25: €2, Under 18: Free",
        "Mount Fuji": "Free (Conservation fee: ¥1,000 during climbing season)",
        "Fushimi Inari Shrine": "Free admission"
    };
    return fees[attractionName] || "Check local tourism websites for current rates";
}

function getOpeningHours(attractionName) {
    const hours = {
        "Eiffel Tower": "9:00 AM - 11:45 PM",
        "Colosseum": "8:30 AM - 7:15 PM",
        "Fushimi Inari Shrine": "24/7"
    };
    return hours[attractionName] || "Varies by season - check locally";
}

// ============================================
// OPENTRIPMAP SEARCH FUNCTIONS
// ============================================

async function getCountryCoordinates(countryName) {
    try {
        const response = await fetch(`${API_BASE_URL}/name/${encodeURIComponent(countryName)}`);
        const data = await response.json();
        if (data && data[0] && data[0].latlng) {
            return {
                lat: data[0].latlng[0],
                lon: data[0].latlng[1]
            };
        }
        return null;
    } catch (error) {
        console.log('Error getting coordinates:', error);
        return null;
    }
}

async function getAttractionsFromOpenTripMap(lat, lon) {
    try {
        // Search for attractions within 50km radius
        const radius = 50000;
        const searchUrl = `${OPENTRIPMAP_BASE}/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=tourist_attractions&format=json&apikey=${OPENTRIPMAP_API_KEY}&limit=10`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data && data.features && data.features.length > 0) {
            const attractions = await Promise.all(data.features.slice(0, 8).map(async (feature) => {
                const name = feature.properties.name;
                const xid = feature.properties.xid;
                
                // Get attraction image from Unsplash
                const image = await getAttractionImage(name);
                
                return {
                    name: name,
                    description: feature.properties.wikipedia_extracts?.text || feature.properties.kinds?.split(',').slice(0, 3).join(', ') || "A beautiful tourist attraction worth visiting.",
                    rating: `⭐ ${(Math.random() * 1 + 3.5).toFixed(1)}`,
                    image: image,
                    xid: xid,
                    lat: feature.geometry.coordinates[1],
                    lon: feature.geometry.coordinates[0]
                };
            }));
            
            return attractions.filter(a => a.name && a.name !== "undefined");
        }
        return null;
    } catch (error) {
        console.log('OpenTripMap API error:', error);
        return null;
    }
}

async function getAttractionImage(attractionName) {
    try {
        const searchQuery = encodeURIComponent(`${attractionName} landmark tourist`);
        return `https://source.unsplash.com/featured/400x250?${searchQuery}&sig=${Math.random()}`;
    } catch (error) {
        return 'https://via.placeholder.com/400x250?text=No+Image+Available';
    }
}

// ============================================
// MAIN SEARCH FUNCTION
// ============================================

async function searchCountry() {
    if (!countryInput) return;
    
    const countryName = countryInput.value.trim();
    
    if (!countryName) {
        showError('Please enter a country name');
        return;
    }
    
    setLoadingState(true);
    clearResults();
    
    try {
        const response = await fetch(`${API_BASE_URL}/name/${encodeURIComponent(countryName)}`);
        
        if (!response.ok) {
            throw new Error('Country not found. Please check the spelling and try again.');
        }
        
        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error('No information found for this country.');
        }
        
        const country = data[0];
        currentCountryData = country;
        
        // Get coordinates and fetch attractions
        const coords = await getCountryCoordinates(country.name.common);
        let attractions = null;
        
        if (coords) {
            attractions = await getAttractionsFromOpenTripMap(coords.lat, coords.lon);
        }
        
        displayCountryWithAttractions(country, attractions);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        setLoadingState(false);
    }
}

function displayCountryWithAttractions(country, attractions) {
    const isSaved = checkIfSaved(country.cca2 || country.name.common);
    
    // Build attractions HTML
    let attractionsHTML = '';
    
    if (attractions && attractions.length > 0) {
        attractions.forEach(attraction => {
            attractionsHTML += `
                <div class="attraction-card clickable" onclick="showAttractionDetails('${attraction.name.replace(/'/g, "\\'")}', '${country.name.common.replace(/'/g, "\\'")}', '${attraction.xid || ''}')">
                    <div class="attraction-image">
                        <img src="${attraction.image}" alt="${attraction.name}" onerror="this.src='https://via.placeholder.com/400x250?text=Image+Not+Available'">
                    </div>
                    <div class="attraction-content">
                        <div class="attraction-name">${attraction.name}</div>
                        <div class="attraction-desc">${attraction.description.substring(0, 100)}${attraction.description.length > 100 ? '...' : ''}</div>
                        <div class="attraction-rating">${attraction.rating}</div>
                        <div class="attraction-click-hint">🔍 Click to view details</div>
                    </div>
                </div>
            `;
        });
    } else {
        // Fallback attractions
        const fallbackSpots = getFallbackSpots(country.name.common);
        fallbackSpots.forEach(spot => {
            attractionsHTML += `
                <div class="attraction-card clickable" onclick="showAttractionDetails('${spot.name.replace(/'/g, "\\'")}', '${country.name.common.replace(/'/g, "\\'")}')">
                    <div class="attraction-image">
                        <img src="${spot.image}" alt="${spot.name}" onerror="this.src='https://via.placeholder.com/400x250?text=Image+Not+Available'">
                    </div>
                    <div class="attraction-content">
                        <div class="attraction-name">${spot.name}</div>
                        <div class="attraction-desc">${spot.description}</div>
                        <div class="attraction-rating">${spot.rating}</div>
                        <div class="attraction-click-hint">🔍 Click to view details</div>
                    </div>
                </div>
            `;
        });
    }
    
    const countryHTML = `
        <div class="country-card">
            <div class="country-flag">
                <img src="${country.flags.png}" alt="Flag of ${country.name.common}" onerror="this.src='https://via.placeholder.com/300x200?text=Flag+Not+Available'">
            </div>
            <div class="country-info">
                <h2>${country.name.common}</h2>
                <p class="country-motto">${country.name.official}</p>
                
                <div class="info-grid">
                    <div class="info-item">
                        <h4>🏛️ Capital</h4>
                        <p>${country.capital ? country.capital[0] : 'N/A'}</p>
                    </div>
                    <div class="info-item">
                        <h4>👥 Population</h4>
                        <p>${country.population.toLocaleString()}</p>
                    </div>
                    <div class="info-item">
                        <h4>🌍 Region</h4>
                        <p>${country.region}</p>
                    </div>
                    <div class="info-item">
                        <h4>💵 Currency</h4>
                        <p>${getCurrency(country.currencies)}</p>
                    </div>
                    <div class="info-item">
                        <h4>🗣️ Language</h4>
                        <p>${getLanguages(country.languages)}</p>
                    </div>
                </div>
                
                <div class="attractions-section">
                    <h3>🌟 Real Tourist Attractions <span class="click-hint">(Powered by OpenTripMap)</span></h3>
                    <div class="attractions-grid">
                        ${attractionsHTML}
                    </div>
                </div>
                
                <div class="travel-tip">
                    <h4>💡 Travel Tip</h4>
                    <p>${getTravelTip(country.name.common)}</p>
                </div>
                
                <button class="save-btn" onclick="saveCurrentCountry()" 
                        style="background: ${isSaved ? '#28a745' : '#ffd700'}; 
                               color: ${isSaved ? 'white' : '#333'}; 
                               border: none; 
                               padding: 15px 25px; 
                               border-radius: 8px; 
                               font-size: 16px; 
                               font-weight: 600; 
                               cursor: ${isSaved ? 'default' : 'pointer'}; 
                               margin-top: 20px; 
                               width: 100%; 
                               transition: all 0.3s;
                               display: flex;
                               align-items: center;
                               justify-content: center;
                               gap: 8px;"
                        ${isSaved ? 'disabled' : ''}>
                    ${isSaved ? '✓ Added to Travel Wishlist' : '✈️ Add to Travel Wishlist'}
                </button>
            </div>
        </div>
    `;
    
    if (resultContainer) {
        resultContainer.innerHTML = countryHTML;
        resultContainer.classList.add('active');
    }
}

function getFallbackSpots(countryName) {
    const fallbacks = {
        "Philippines": [
            { name: "🏝️ Boracay Island", description: "World-famous white sand beach", rating: "⭐ 4.9", image: "https://source.unsplash.com/featured/400x250?boracay" },
            { name: "🏞️ Palawan", description: "Underground River & lagoons", rating: "⭐ 5.0", image: "https://source.unsplash.com/featured/400x250?palawan" },
            { name: "🌋 Banaue Rice Terraces", description: "Ancient mountain terraces", rating: "⭐ 4.8", image: "https://source.unsplash.com/featured/400x250?rice+terraces" }
        ],
        "Japan": [
            { name: "🗻 Mount Fuji", description: "Iconic volcano", rating: "⭐ 5.0", image: "https://source.unsplash.com/featured/400x250?mount+fuji" },
            { name: "🏯 Kyoto Temples", description: "Ancient Buddhist temples", rating: "⭐ 4.9", image: "https://source.unsplash.com/featured/400x250?kyoto+temple" },
            { name: "🌸 Arashiyama Bamboo Grove", description: "Enchanting bamboo forest", rating: "⭐ 4.8", image: "https://source.unsplash.com/featured/400x250?bamboo+forest" }
        ]
    };
    return fallbacks[countryName] || [
        { name: "📍 Main City Center", description: `Explore ${countryName}`, rating: "⭐ 4.5", image: "https://source.unsplash.com/featured/400x250?city" },
        { name: "🏛️ Historical Landmark", description: `Discover history of ${countryName}`, rating: "⭐ 4.6", image: "https://source.unsplash.com/featured/400x250?landmark" }
    ];
}

function getTravelTip(countryName) {
    const tips = {
        "Philippines": "Learn basic Filipino phrases - locals appreciate the effort!",
        "Japan": "Get a Japan Rail Pass before traveling - it saves money!",
        "France": "Learn basic French greetings - locals appreciate the effort!",
        "Italy": "Validate train tickets before boarding to avoid fines!",
        "Thailand": "Always negotiate prices at markets, but be respectful!",
        "Spain": "Eat dinner late (9-10 PM) like the locals!",
        "Australia": "Always wear sunscreen - the Australian sun is intense!",
        "Egypt": "Hire a licensed guide for historical sites!"
    };
    return tips[countryName] || "Research local customs and etiquette before visiting";
}

function getCurrency(currencies) {
    if (!currencies) return 'N/A';
    const currencyCode = Object.keys(currencies)[0];
    if (!currencyCode) return 'N/A';
    const currency = currencies[currencyCode];
    return `${currency.name} (${currency.symbol})`;
}

function getLanguages(languages) {
    if (!languages) return 'N/A';
    return Object.values(languages).join(', ');
}

function showError(message) {
    if (errorContainer) {
        errorContainer.innerHTML = `<strong>⚠️ Oops!</strong> ${message}<br><br>💡 Try: Philippines, Japan, France, Italy, Thailand, Spain, Australia, Egypt`;
        errorContainer.classList.add('active');
    }
    if (resultContainer) {
        resultContainer.classList.remove('active');
    }
}

function clearResults() {
    if (resultContainer) {
        resultContainer.innerHTML = '';
    }
    if (errorContainer) {
        errorContainer.innerHTML = '';
        errorContainer.classList.remove('active');
    }
}

function setLoadingState(isLoading) {
    if (searchBtn) {
        searchBtn.disabled = isLoading;
        searchBtn.textContent = isLoading ? 'Discovering attractions...' : '🔍 Discover';
    }
    
    if (isLoading) {
        const loader = document.createElement('div');
        loader.className = 'loader active';
        loader.id = 'loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <p>Finding real tourist attractions from OpenTripMap...</p>
        `;
        if (resultContainer && resultContainer.parentNode) {
            const existingLoader = document.getElementById('loader');
            if (existingLoader) existingLoader.remove();
            resultContainer.parentNode.insertBefore(loader, resultContainer);
        }
    } else {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();
    }
}

// ============================================
// SAVE FEATURE FUNCTIONS
// ============================================

function saveCurrentCountry() {
    if (!currentCountryData) {
        showSaveMessage('No country data to save!', 'error');
        return;
    }
    
    try {
        let savedCountries = getSavedCountries();
        const countryId = currentCountryData.cca2 || currentCountryData.name.common;
        const isDuplicate = savedCountries.some(country => {
            const savedId = country.id || country.name?.common || country.name;
            return savedId === countryId;
        });
        
        if (isDuplicate) {
            showSaveMessage('This destination is already in your wishlist!', 'error');
            return;
        }
        
        const countryToSave = {
            id: countryId,
            name: {
                common: currentCountryData.name.common,
                official: currentCountryData.name.official
            },
            flags: {
                png: currentCountryData.flags.png
            },
            capital: currentCountryData.capital ? currentCountryData.capital[0] : 'N/A',
            region: currentCountryData.region,
            population: currentCountryData.population,
            languages: getLanguages(currentCountryData.languages),
            currency: getCurrency(currentCountryData.currencies)
        };
        
        savedCountries.push(countryToSave);
        localStorage.setItem('savedCountries', JSON.stringify(savedCountries));
        
        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.textContent = '✓ Added to Wishlist!';
            saveBtn.style.background = '#28a745';
            saveBtn.style.color = 'white';
            saveBtn.disabled = true;
        }
        
        showSaveMessage(`✨ ${currentCountryData.name.common} added to your travel wishlist!`, 'success');
        
    } catch (error) {
        console.error('Error saving country:', error);
        showSaveMessage('Failed to save destination. Please try again.', 'error');
    }
}

function getSavedCountries() {
    const saved = localStorage.getItem('savedCountries');
    return saved ? JSON.parse(saved) : [];
}

function checkIfSaved(countryId) {
    const savedCountries = getSavedCountries();
    return savedCountries.some(country => {
        const savedId = country.id || country.name?.common || country.name;
        return savedId === countryId;
    });
}

function showSaveMessage(message, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `save-message ${type}`;
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        z-index: 1000;
        border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    
    msgDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
    `;
    
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 3000);
}

// ============================================
// SAVED ITEMS PAGE FUNCTIONS
// ============================================

function displaySavedItems() {
    const savedItemsContainer = document.getElementById('savedItemsContainer');
    const emptyState = document.getElementById('emptyState');
    const statsDiv = document.getElementById('stats');
    const savedCountSpan = document.getElementById('savedCount');
    
    if (!savedItemsContainer) return;
    
    const savedCountries = getSavedCountries();
    
    if (!savedCountries || savedCountries.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (savedItemsContainer) savedItemsContainer.style.display = 'none';
        if (statsDiv) statsDiv.style.display = 'none';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    if (savedItemsContainer) savedItemsContainer.style.display = 'grid';
    if (statsDiv) statsDiv.style.display = 'block';
    if (savedCountSpan) savedCountSpan.textContent = savedCountries.length;
    
    savedItemsContainer.innerHTML = '';
    savedCountries.forEach((country, index) => {
        const card = createSavedItemCard(country, index);
        savedItemsContainer.appendChild(card);
    });
}

function createSavedItemCard(country, index) {
    const card = document.createElement('div');
    card.className = 'saved-item-card';
    
    const countryName = country.name?.common || country.name;
    const flagUrl = country.flags?.png || 'https://via.placeholder.com/300x180?text=No+Flag';
    const countryId = country.id || countryName;
    
    card.innerHTML = `
        <img src="${flagUrl}" alt="Flag of ${countryName}" class="saved-item-flag">
        <button class="delete-btn" onclick="deleteSavedItem('${countryId}')">×</button>
        <div class="saved-item-info">
            <h3>${countryName}</h3>
            <p class="saved-item-detail"><strong>Capital:</strong> ${country.capital}</p>
            <p class="saved-item-detail"><strong>Region:</strong> ${country.region}</p>
            <p class="saved-item-detail"><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        </div>
    `;
    return card;
}

function deleteSavedItem(countryId) {
    let savedCountries = getSavedCountries();
    savedCountries = savedCountries.filter(country => {
        const currentId = country.id || country.name?.common || country.name;
        return currentId != countryId;
    });
    localStorage.setItem('savedCountries', JSON.stringify(savedCountries));
    displaySavedItems();
    showToast('Removed from wishlist!', 'success');
}

function clearAllSaved() {
    if (confirm('Remove ALL saved countries from wishlist?')) {
        localStorage.removeItem('savedCountries');
        displaySavedItems();
        showToast('All saved countries removed!', 'success');
    }
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 8px;
        animation: slideIn 0.3s ease;
        z-index: 1000;
        border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    updateNavigation();
    
    if (currentPage.includes('admin.html') || currentPage.includes('manage-users.html')) {
        checkAdminAccess();
    } else if (currentPage.includes('profile.html') || currentPage.includes('settings.html')) {
        checkAuth();
    }
    
    if (currentPage.includes('manage-users.html')) {
        loadUsers();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const roleSelect = document.getElementById('role');
        
        if (nameInput) nameInput.addEventListener('input', updatePreview);
        if (emailInput) emailInput.addEventListener('input', updatePreview);
        if (roleSelect) roleSelect.addEventListener('change', updatePreview);
        
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addUser(e);
            });
        }
    }
    
    displayUserInfo();
    updateUserCount();
    
    if (currentPage.includes('login.html')) {
        setupLoginForm();
    }
    
    if (currentPage.includes('signup.html')) {
        setupSignupForm();
    }
    
    // Initialize World Explorer for api.html
    if (currentPage === 'api.html') {
        countryInput = document.getElementById('countryInput');
        searchBtn = document.getElementById('searchBtn');
        resultContainer = document.getElementById('result');
        errorContainer = document.getElementById('error');
        exampleButtons = document.querySelectorAll('.example-country');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', searchCountry);
            if (countryInput) {
                countryInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') searchCountry();
                });
            }
            exampleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const country = button.dataset.country;
                    if (countryInput) countryInput.value = country;
                    searchCountry();
                });
            });
            
            if (countryInput && countryInput.value === '') {
                countryInput.value = 'Philippines';
            }
            searchCountry();
        }
    }
    
    if (currentPage.includes('saved-items.html')) {
        displaySavedItems();
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllSaved);
    }
});

function updateNavigation() {
    const user = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'profile.html' || currentPage === 'settings.html') {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            let sidebarLinks = `
                <a href="index.html">🏠 Home</a>
                <a href="profile.html" class="active">👤 Profile</a>
                <a href="settings.html">⚙ Settings</a>
            `;
            if (user && user.role === 'admin') {
                sidebarLinks += `<a href="admin.html">👑 Admin</a>`;
            }
            sidebarLinks += `<a href="#" onclick="logout()">🚪 Logout</a>`;
            sidebar.innerHTML = sidebarLinks;
        }
    }
}

function displayUserInfo() {
    const user = getCurrentUser();
    
    if (window.location.pathname.includes('profile.html')) {
        const nameElement = document.querySelector('.profile-card h3');
        const emailElement = document.querySelector('.profile-card p:first-of-type');
        if (nameElement && user) nameElement.textContent = user.name;
        if (emailElement && user) emailElement.textContent = `Email: ${user.email}`;
    }
    
    if (window.location.pathname.includes('admin.html')) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && user) userNameElement.textContent = user.name;
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errors = validateLoginForm(email, password);
            if (errors.length > 0) {
                alert('❌ ' + errors.join('\n'));
                return;
            }
            if (!handleLogin(email, password)) {
                alert('❌ Invalid email or password.\n\nTry:\nAdmin: admin@example.com / admin123\nUser: ana@email.com / user123');
            }
        });
    }
}

function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const errors = validateSignupForm(name, email, password, password);
            if (errors.length > 0) {
                alert('❌ ' + errors.join('\n'));
                return;
            }
            if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
                alert('❌ Email already exists!');
                return;
            }
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            users.push({ id: newId, name, email, role: 'user', password });
            alert('✅ Account created successfully! Please login.');
            window.location.href = 'login.html';
        });
    }
}

// Make functions globally available
window.saveCurrentCountry = saveCurrentCountry;
window.deleteSavedItem = deleteSavedItem;
window.clearAllSaved = clearAllSaved;
window.addUser = addUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.updateUser = updateUser;
window.closeEditModal = closeEditModal;
window.logout = logout;
window.updatePreview = updatePreview;
window.showAttractionDetails = showAttractionDetails;
window.closeAttractionModal = closeAttractionModal;