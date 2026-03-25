<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vehicle Search - CarFinder</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header>
        <div class="logo"><i class="fas fa-car"></i> CarFinder</div>
        <nav>
            <a href="profile.html" class="nav-btn"><i class="fas fa-user"></i> Profile</a>
            <a href="admin.html" class="nav-btn"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            <a href="saved-vehicles.html" class="nav-btn" style="background: #ffd369; color: #1f1c2c;">
                <i class="fas fa-garage"></i> Garage <span id="saved-count-badge" style="background: #1f1c2c; color: #ffd369; padding: 2px 8px; border-radius: 20px; margin-left: 5px;">0</span>
            </a>
            <button onclick="logout()" class="nav-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
        </nav>
    </header>

    <main class="api-container">
        <div class="api-card">
            <h2><i class="fas fa-search"></i> Search Vehicles</h2>
            <p>Search for vehicles by make, model, or year</p>
            
            <div class="api-search">
                <input type="text" id="vehicleInput" placeholder="Search by make or model (ex: Toyota, Honda Civic, Ford)" onkeypress="if(event.key === 'Enter') searchVehicle()">
                <button onclick="searchVehicle()" class="btn"><i class="fas fa-search"></i> Search</button>
            </div>

            <div class="search-tags">
                <button onclick="searchByMake('Toyota')" class="tag-btn">Toyota</button>
                <button onclick="searchByMake('Honda')" class="tag-btn">Honda</button>
                <button onclick="searchByMake('Ford')" class="tag-btn">Ford</button>
                <button onclick="searchByMake('Chevrolet')" class="tag-btn">Chevrolet</button>
                <button onclick="searchByMake('BMW')" class="tag-btn">BMW</button>
                <button onclick="searchByMake('Mercedes-Benz')" class="tag-btn">Mercedes</button>
            </div>

            <div id="result" class="api-result">
                <div class="welcome-message">
                    <i class="fas fa-car-side"></i>
                    <h3>Welcome to CarFinder!</h3>
                    <p>Search for any vehicle to get started.</p>
                    <small>Try: Toyota Camry, Honda Civic, Ford Mustang</small>
                </div>
            </div>
        </div>
    </main>

    <script src="script.js"></script>
    <script src="vehicle.js"></script>
</body>
</html>