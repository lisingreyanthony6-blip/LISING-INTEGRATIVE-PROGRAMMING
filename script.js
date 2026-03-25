function getUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

function protectPage() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

function signup(e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;
    const role = document.getElementById("signup-role").value;

    if (password !== confirm) {
        alert("Passwords do not match");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find((user) => user.email === email);
    if (exists) {
        alert("Email already registered");
        return;
    }

    const newUser = { name, email, password, role, address: "Not set", createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("isLoggedIn", "true");
    showNotification("Account created successfully!", "success");
    window.location.href = role === "admin" ? "admin.html" : "profile.html";
}

function login(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
        alert("Invalid email or password");
        return;
    }
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");
    showNotification("Login successful!", "success");
    window.location.href = user.role === "admin" ? "admin.html" : "profile.html";
}

function logout() {
    localStorage.setItem("isLoggedIn", "false");
    showNotification("Logged out successfully", "info");
    window.location.href = "login.html";
}

function loadProfile() {
    protectPage();
    const user = getUser();
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-address").textContent = user.address || "Not set";
    const roleBadge = document.getElementById("profile-role-badge");
    if (roleBadge) {
        roleBadge.className = `role-badge ${user.role}`;
        roleBadge.innerHTML = user.role === 'admin' ? '👑 Admin' : '👤 User';
    }
    const avatar = document.getElementById("profile-avatar");
    if (avatar) avatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
    if (user.role === "admin") {
        const adminBtn = document.getElementById("adminBtn");
        if (adminBtn) {
            adminBtn.style.display = "inline-flex";
            adminBtn.onclick = () => window.location.href = "admin.html";
        }
    }
}

function loadSettings() {
    protectPage();
    const user = getUser();
    document.getElementById("set-name").value = user.name;
    document.getElementById("set-email").value = user.email;
    document.getElementById("set-address").value = user.address || "";
}

function saveSettings(e) {
    e.preventDefault();
    const user = getUser();
    user.name = document.getElementById("set-name").value;
    user.email = document.getElementById("set-email").value;
    user.address = document.getElementById("set-address").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) users[userIndex] = { ...user };
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(user));
    showNotification("Profile updated successfully!", "success");
    window.location.href = "profile.html";
}

function changePassword(e) {
    e.preventDefault();
    const user = getUser();
    const current = document.getElementById("current-password").value;
    const newPass = document.getElementById("new-password").value;
    const confirm = document.getElementById("confirm-password").value;
    if (current !== user.password) {
        showNotification("Current password incorrect", "error");
        return;
    }
    if (newPass !== confirm) {
        showNotification("New passwords do not match", "error");
        return;
    }
    if (newPass.length < 6) {
        showNotification("Password must be at least 6 characters", "error");
        return;
    }
    user.password = newPass;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) users[userIndex].password = newPass;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(user));
    showNotification("Password updated successfully!", "success");
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
}

function loadAdmin() {
    protectPage();
    const user = getUser();
    if (user.role !== "admin") {
        showNotification("Access denied", "error");
        window.location.href = "profile.html";
        return;
    }
    const adminNameElement = document.getElementById("admin-name");
    if (adminNameElement) adminNameElement.textContent = user.name.split(' ')[0];
    updateAdminStats();
    const dateElement = document.getElementById("current-date");
    if (dateElement) {
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

function updateAdminStats() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let savedVehicles = JSON.parse(localStorage.getItem("savedVehicles")) || [];
    const totalUsers = document.getElementById("total-users");
    const totalAdmins = document.getElementById("total-admins");
    const totalVehicles = document.getElementById("total-vehicles");
    if (totalUsers) totalUsers.textContent = users.length;
    if (totalAdmins) totalAdmins.textContent = users.filter(u => u.role === 'admin').length;
    if (totalVehicles) totalVehicles.textContent = savedVehicles.length;
}

function loadUsers() {
    const table = document.getElementById("userTable");
    const statsDiv = document.getElementById("userStats");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    table.innerHTML = "";
    if (users.length === 0) {
        table.innerHTML = `<tr><td colspan="5" class="empty-table"><i class="fas fa-users-slash"></i><p>No users found</p></td></tr>`;
    } else {
        users.forEach((user, index) => {
            const roleIcon = user.role === 'admin' ? '👑' : '👤';
            const roleClass = user.role === 'admin' ? 'role-badge admin' : 'role-badge user';
            table.innerHTML += `
                <tr class="user-row">
                    <td><span class="user-id">#${index + 1}</span></td>
                    <td><div class="user-info"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}" class="user-avatar"><span>${user.name}</span></div></td>
                    <td>${user.email}</td>
                    <td><span class="${roleClass}">${roleIcon} ${user.role}</span></td>
                    <td><button onclick="deleteUser(${index})" class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button></td>
                </tr>
            `;
        });
    }
    if (statsDiv) {
        const adminCount = users.filter(u => u.role === 'admin').length;
        const userCount = users.filter(u => u.role === 'user').length;
        statsDiv.innerHTML = `<div class="stat-item"><i class="fas fa-users"></i><span>Total: ${users.length}</span></div><div class="stat-item"><i class="fas fa-crown"></i><span>Admins: ${adminCount}</span></div><div class="stat-item"><i class="fas fa-user"></i><span>Users: ${userCount}</span></div>`;
    }
}

function addUser(e) {
    e.preventDefault();
    const name = document.getElementById("new-name").value.trim();
    const email = document.getElementById("new-email").value.trim();
    const password = document.getElementById("new-password").value;
    const role = document.getElementById("new-role").value;
    if (name.length < 2) { showNotification("Name must be at least 2 characters", "error"); return; }
    if (password.length < 6) { showNotification("Password must be at least 6 characters", "error"); return; }
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.email === email)) { showNotification("Email already exists", "error"); return; }
    const newUser = { name, email, password, role, address: "Not set", createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    document.getElementById("new-name").value = "";
    document.getElementById("new-email").value = "";
    document.getElementById("new-password").value = "";
    showNotification("User added successfully!", "success");
    loadUsers();
    if (typeof updateAdminStats === 'function') updateAdminStats();
}

function deleteUser(index) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = getUser();
    const userToDelete = users[index];
    if (currentUser.email === userToDelete.email) { showNotification("You cannot delete your own account", "error"); return; }
    if (confirm(`Are you sure you want to delete ${userToDelete.name}?`)) {
        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));
        showNotification("User deleted successfully!", "success");
        loadUsers();
        if (typeof updateAdminStats === 'function') updateAdminStats();
    }
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