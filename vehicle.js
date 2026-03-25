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
            <div class="vehicle-icon"><i class="fas fa-car"></i></div>
            <div class="vehicle-details">
                <h3>${vehicle.year} ${vehicle.make} ${vehicle.model}</h3>
                <div class="vehicle-info">
                    <p><i class="fas fa-calendar"></i> Year: ${vehicle.year}</p>
                    <p><i class="fas fa-tag"></i> Make: ${vehicle.make}</p>
                    <p><i class="fas fa-cog"></i> Model: ${vehicle.model}</p>
                </div>
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
                <p>Found ${vehicles.length} vehicles</p>
            </div>
            <div class="vehicles-grid">
    `;
    
    vehicles.slice(0, 20).forEach((vehicle) => {
        const make = vehicle.Make_Name || searchTerm;
        const model = vehicle.Model_Name || "Unknown";
        const year = "2024";
        
        const isSaved = savedVehicles.some(item => item.make === make && item.model === model);
        
        html += `
            <div class="vehicle-card">
                <div class="vehicle-icon"><i class="fas fa-car"></i></div>
                <div class="vehicle-details">
                    <h3>${make} ${model}</h3>
                    <div class="vehicle-info">
                        <p><i class="fas fa-calendar"></i> Year: ${year}</p>
                        <p><i class="fas fa-tag"></i> Make: ${make}</p>
                        <p><i class="fas fa-cog"></i> Model: ${model}</p>
                    </div>
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