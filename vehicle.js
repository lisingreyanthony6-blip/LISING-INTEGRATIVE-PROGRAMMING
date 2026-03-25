// ==================== HELPER FUNCTIONS ====================
function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

function showNotification(message, type = "info") {
    const existingNotif = document.querySelector(".notification");
    if (existingNotif) existingNotif.remove();
    
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    let icon = type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle";
    notification.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease forwards";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateSavedCount() {
    const savedVehicles = JSON.parse(localStorage.getItem('savedVehicles')) || [];
    const badge = document.getElementById('saved-count-badge');
    if (badge) badge.textContent = savedVehicles.length;
}

// ==================== VEHICLE IMAGE FETCHER ====================
let currentImageInterval = null;
let currentImageIndex = 0;

function fetchVehicleImages(make, model) {
    return new Promise((resolve) => {
        // Using Unsplash Source API for vehicle images (free, no API key needed)
        // We'll create multiple image URLs for the same vehicle
        const searchTerm = `${make} ${model} car`;
        const images = [
            `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&1`,
            `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&2`,
            `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&3`,
            `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&4`,
            `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&5`
        ];
        resolve(images);
    });
}

function startImageSlideshow(images, containerId) {
    // Stop any existing slideshow
    if (currentImageInterval) {
        clearInterval(currentImageInterval);
        currentImageInterval = null;
    }
    
    currentImageIndex = 0;
    const imgElement = document.getElementById(containerId);
    
    if (!imgElement) return;
    
    // Set first image
    imgElement.src = images[0];
    imgElement.onerror = () => {
        imgElement.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
    };
    
    // Change image every 3 seconds (10 seconds total = 3-4 images)
    let counter = 0;
    currentImageInterval = setInterval(() => {
        counter++;
        currentImageIndex = (currentImageIndex + 1) % images.length;
        imgElement.src = images[currentImageIndex];
        imgElement.onerror = () => {
            imgElement.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
        };
        
        // Stop after 10 seconds (approximately 3-4 changes)
        if (counter >= 3) {
            clearInterval(currentImageInterval);
            currentImageInterval = null;
        }
    }, 3000);
}

function stopSlideshow() {
    if (currentImageInterval) {
        clearInterval(currentImageInterval);
        currentImageInterval = null;
    }
}

// ==================== VEHICLE FUN FACTS ====================
function getVehicleFact(make, model) {
    const facts = {
        'Toyota': ['Toyota was originally a textile company!', 'The Toyota Corolla is the best-selling car of all time.', 'Toyota has over 5,000 patents for hybrid technology.'],
        'Honda': ['Honda started as a motorcycle company in 1946.', 'The Honda Civic has been in production since 1972.', 'Honda is the world\'s largest engine manufacturer.'],
        'Ford': ['Ford introduced the assembly line in 1913.', 'The Ford Mustang sold 1 million units in its first 2 years.', 'Ford is the second-largest US automaker.'],
        'Chevrolet': ['Chevrolet was founded by Louis Chevrolet and William Durant.', 'The Chevy Suburban is the longest-running nameplate.', 'Chevrolet sold over 100 million vehicles worldwide.'],
        'BMW': ['BMW started as an aircraft engine company.', 'The BMW logo represents a spinning propeller.', 'BMW stands for Bayerische Motoren Werke.'],
        'Mercedes-Benz': ['Mercedes-Benz invented the first automobile in 1886.', 'The three-pointed star represents land, sea, and air.', 'Mercedes-Benz has over 100,000 employees worldwide.'],
        'default': ['Cars have over 30,000 parts on average.', 'The first car could only go 10 mph.', 'Modern cars have over 100 computers inside.']
    };
    
    const makeFacts = facts[make] || facts['default'];
    return makeFacts[Math.floor(Math.random() * makeFacts.length)];
}

// ==================== SAVE VEHICLE FEATURE ====================
function saveVehicle(vehicleData) {
    let savedVehicles = JSON.parse(localStorage.getItem('savedVehicles')) || [];
    
    const exists = savedVehicles.some(item => 
        item.make === vehicleData.make && item.model === vehicleData.model && item.year === vehicleData.year
    );
    
    if (exists) {
        showNotification(`${vehicleData.year} ${vehicleData.make} ${vehicleData.model} is already in your garage!`, "error");
        return;
    }
    
    vehicleData.savedAt = new Date().toISOString();
    savedVehicles.push(vehicleData);
    localStorage.setItem('savedVehicles', JSON.stringify(savedVehicles));
    
    showNotification(`${vehicleData.year} ${vehicleData.make} ${vehicleData.model} added to your garage! 🚗`, "success");
    updateSavedCount();
}

function loadSavedVehicles() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }
    
    const container = document.getElementById('saved-vehicles-container');
    if (!container) return;
    
    const savedVehicles = JSON.parse(localStorage.getItem('savedVehicles')) || [];
    
    if (savedVehicles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-garage"></i>
                <h3>Your garage is empty</h3>
                <p>Go to Vehicle Search and save your favorite cars!</p>
                <a href="api.html" class="btn">Search Vehicles</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = savedVehicles.map((vehicle, index) => `
        <div class="vehicle-card">
            <div class="vehicle-image-container">
                <img id="saved-img-${index}" src="https://source.unsplash.com/featured/300x200?${vehicle.make}+${vehicle.model}+car" 
                     alt="${vehicle.make} ${vehicle.model}" 
                     class="vehicle-image"
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <button onclick="previewVehicleImage('${vehicle.make}', '${vehicle.model}', 'saved-img-${index}')" class="preview-btn-small">
                    <i class="fas fa-play"></i> Preview (10s)
                </button>
            </div>
            <div class="vehicle-details">
                <h3>${vehicle.year} ${vehicle.make} ${vehicle.model}</h3>
                <div class="vehicle-info">
                    <p><i class="fas fa-calendar"></i> Year: ${vehicle.year}</p>
                    <p><i class="fas fa-tag"></i> Make: ${vehicle.make}</p>
                    <p><i class="fas fa-cog"></i> Model: ${vehicle.model}</p>
                </div>
                <p class="vehicle-fact"><i class="fas fa-lightbulb"></i> ${getVehicleFact(vehicle.make, vehicle.model)}</p>
                <p class="saved-date"><i class="fas fa-clock"></i> Added: ${new Date(vehicle.savedAt).toLocaleDateString()}</p>
                <button onclick="removeSavedVehicle(${index})" class="delete-btn"><i class="fas fa-trash"></i> Remove</button>
            </div>
        </div>
    `).join('');
}

function removeSavedVehicle(index) {
    let savedVehicles = JSON.parse(localStorage.getItem('savedVehicles')) || [];
    
    if (confirm(`Remove "${savedVehicles[index].year} ${savedVehicles[index].make} ${savedVehicles[index].model}" from your garage?`)) {
        savedVehicles.splice(index, 1);
        localStorage.setItem('savedVehicles', JSON.stringify(savedVehicles));
        showNotification('Vehicle removed from garage', "info");
        loadSavedVehicles();
        updateSavedCount();
    }
}

// ==================== PREVIEW VEHICLE IMAGES (10 SECONDS) ====================
async function previewVehicleImage(make, model, imgElementId) {
    const imgElement = document.getElementById(imgElementId);
    if (!imgElement) return;
    
    showNotification(`Showing preview for ${make} ${model} for 10 seconds!`, "info");
    
    // Generate multiple images for slideshow
    const searchTerm = `${make} ${model} car`;
    const images = [
        `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&1`,
        `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&2`,
        `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&3`,
        `https://source.unsplash.com/featured/400x300?${encodeURIComponent(searchTerm)}&4`
    ];
    
    let index = 0;
    imgElement.src = images[0];
    imgElement.onerror = () => {
        imgElement.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
    };
    
    // Change image every 2.5 seconds for 10 seconds (4 images)
    const interval = setInterval(() => {
        index++;
        if (index < images.length) {
            imgElement.src = images[index];
            imgElement.onerror = () => {
                imgElement.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            };
        }
    }, 2500);
    
    // Stop after 10 seconds
    setTimeout(() => {
        clearInterval(interval);
        // Restore original image
        imgElement.src = `https://source.unsplash.com/featured/300x200?${searchTerm}`;
        imgElement.onerror = () => {
            imgElement.src = 'https://via.placeholder.com/300x200?text=No+Image';
        };
        showNotification(`Preview finished!`, "info");
    }, 10000);
}

// ==================== NHTSA vPIC API SEARCH ====================
function searchVehicle() {
    const searchTerm = document.getElementById("vehicleInput").value.trim();
    const result = document.getElementById("result");
    
    if (searchTerm === "") {
        result.innerHTML = `<div class="api-error"><i class="fas fa-exclamation-circle"></i><p>Please enter a vehicle make or model.</p></div>`;
        return;
    }
    
    result.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching for "${searchTerm}"...</div>`;
    
    fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(searchTerm)}?format=json`)
        .then(response => response.json())
        .then(data => {
            if (data.Results && data.Results.length > 0) {
                displayVehicleResults(data.Results, searchTerm);
            } else {
                result.innerHTML = `<div class="api-error"><i class="fas fa-exclamation-triangle"></i><p>No vehicles found for "${searchTerm}".</p><small>Try: Toyota, Honda, Ford, BMW</small></div>`;
            }
        })
        .catch(error => {
            result.innerHTML = `<div class="api-error"><i class="fas fa-exclamation-triangle"></i><p>Error searching for vehicles.</p><small>Please try again later.</small></div>`;
        });
}

function searchByMake(make) {
    document.getElementById("vehicleInput").value = make;
    searchVehicle();
}

function displayVehicleResults(vehicles, searchTerm) {
    const result = document.getElementById("result");
    const savedVehicles = JSON.parse(localStorage.getItem('savedVehicles')) || [];
    
    let html = `
        <div class="vehicles-results">
            <div class="results-header">
                <h2><i class="fas fa-search"></i> Results for "${searchTerm}"</h2>
                <p>Found ${vehicles.length} vehicles • Click preview to see images for 10 seconds!</p>
            </div>
            <div class="vehicles-grid">
    `;
    
    vehicles.slice(0, 20).forEach((vehicle, index) => {
        const make = vehicle.Make_Name || searchTerm;
        const model = vehicle.Model_Name || "Unknown";
        const year = "2024";
        const uniqueId = `img-${Date.now()}-${index}`;
        
        const isSaved = savedVehicles.some(item => item.make === make && item.model === model);
        
        html += `
            <div class="vehicle-card">
                <div class="vehicle-image-container">
                    <img id="${uniqueId}" src="https://source.unsplash.com/featured/300x200?${encodeURIComponent(make)}+${encodeURIComponent(model)}+car" 
                         alt="${make} ${model}" 
                         class="vehicle-image"
                         onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    <button onclick="previewVehicleImage('${make}', '${model}', '${uniqueId}')" class="preview-btn-small">
                        <i class="fas fa-play"></i> Preview (10s)
                    </button>
                </div>
                <div class="vehicle-details">
                    <h3>${make} ${model}</h3>
                    <div class="vehicle-info">
                        <p><i class="fas fa-calendar"></i> Year: ${year}</p>
                        <p><i class="fas fa-tag"></i> Make: ${make}</p>
                        <p><i class="fas fa-cog"></i> Model: ${model}</p>
                    </div>
                    <p class="vehicle-fact"><i class="fas fa-lightbulb"></i> ${getVehicleFact(make)}</p>
                    <button onclick='saveVehicle(${JSON.stringify({
                        make: make,
                        model: model,
                        year: year
                    })})' class="save-btn-small" ${isSaved ? 'disabled' : ''}>
                        <i class="fas ${isSaved ? 'fa-check' : 'fa-bookmark'}"></i>
                        ${isSaved ? 'In Garage' : 'Save to Garage'}
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `</div></div>`;
    result.innerHTML = html;
}

// ==================== PAGE INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('api.html') || window.location.pathname.includes('saved-vehicles.html')) {
        if (!isLoggedIn()) {
            window.location.href = "login.html";
            return;
        }
    }
    
    const input = document.getElementById('vehicleInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchVehicle();
        });
    }
    
    updateSavedCount();
    
    if (window.location.pathname.includes('saved-vehicles.html')) {
        loadSavedVehicles();
    }
    
    // Load URL parameter if exists
    const urlParams = new URLSearchParams(window.location.search);
    const make = urlParams.get('make');
    if (make && document.getElementById('vehicleInput')) {
        document.getElementById('vehicleInput').value = make;
        searchVehicle();
    }
});