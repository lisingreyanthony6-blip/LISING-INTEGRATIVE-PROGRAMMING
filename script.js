// ===============================
// AUTHENTICATION PROTECTION SYSTEM
// ===============================

// Profile page access protection
if (
  window.location.pathname.includes("profile.html") &&
  !localStorage.getItem("currentUser")
) {
  alert("Please login first.");
  window.location.href = "login.html";
}

// ===============================
// EMAIL VALIDATOR
// ===============================
function validateEmail(email) {
  return /^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(email);
}

// ===============================
// GET USERS FROM LOCALSTORAGE
// ===============================
function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}

// ===============================
// SAVE USERS TO LOCALSTORAGE
// ===============================
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// ===============================
// LOGIN SYSTEM (UPDATED FOR EMAIL LOGIN)
// ===============================
const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.querySelector("#loginEmail").value.trim();
    const password = document.querySelector("#loginPassword").value.trim();

    // Basic validation
    if (email.length < 3) {
      alert("Email must be at least 3 characters.");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // Get all users
    const users = getUsers();
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      alert("Account not found or incorrect password. Please sign up first or try again.");
      return;
    }

    // Set current user session
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Login successful
    alert("Login successful!");
    window.location.href = "profile.html";
  });
}

// ===============================
// SIGNUP SYSTEM
// ===============================
const signupForm = document.querySelector("#signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.querySelector("#signupName").value.trim();
    const email = document.querySelector("#signupEmail").value.trim();
    const password = document.querySelector("#signupPassword").value.trim();

    // Validation
    if (name.length < 3) {
      alert("Full name must be at least 3 characters.");
      return;
    }

    if (!validateEmail(email)) {
      alert("Invalid email format.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // Get existing users
    const users = getUsers();
    
    // Check if user already exists
    const userExists = users.some(u => u.name === name || u.email === email);
    
    if (userExists) {
      alert("An account with this name or email already exists. Please choose a different name or login.");
      return;
    }

    // Create new user
    const newUser = {
      name: name,
      email: email,
      password: password
    };

    // Add to users array
    users.push(newUser);
    saveUsers(users);

    // Set as current user
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    alert("Registration successful! Welcome to your profile.");
    
    // Go directly to profile page after signup
    window.location.href = "profile.html";
  });
}

// ===============================
// REAL-TIME INPUT VALIDATION STYLE
// ===============================

const inputs = document.querySelectorAll("input");

inputs.forEach((input) => {
  input.addEventListener("input", function () {
    if (this.value.length < 3 && this.type !== "email") {
      this.style.border = "1px solid red";
    } else if (this.type === "email" && !validateEmail(this.value) && this.value.length > 0) {
      this.style.border = "1px solid red";
    } else {
      this.style.border = "1px solid green";
    }
  });
});

// ===============================
// PROFILE DATA DISPLAY
// ===============================
const profileName = document.querySelector("#profileName");
const profilePassword = document.querySelector("#profilePassword");
const profileEmail = document.querySelector("#profileEmail");

// Get current user
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

if (profileName) {
  profileName.value = currentUser.name || "";
}

if (profilePassword) {
  profilePassword.value = currentUser.password || "";
}

if (profileEmail) {
  profileEmail.value = currentUser.email || "";
}

// ===============================
// LOGOUT SYSTEM
// ===============================
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  }
}