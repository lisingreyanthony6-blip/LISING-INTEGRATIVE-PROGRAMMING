// ===============================
// AUTHENTICATION PROTECTION SYSTEM
// ===============================

// Profile page access protection
if (
  window.location.pathname.includes("profile.html") &&
  !localStorage.getItem("userName")
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
// LOGIN SYSTEM
// ===============================
const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.querySelector("#loginName").value.trim();
    const password = document.querySelector("#loginPassword").value.trim();

    if (name.length < 3) {
      alert("Name must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    localStorage.setItem("userName", name);

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

    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);

    alert("Registration successful!");

    window.location.href = "profile.html";
  });
}

// ===============================
// REAL-TIME INPUT VALIDATION STYLE
// ===============================

const inputs = document.querySelectorAll("input");

inputs.forEach((input) => {
  input.addEventListener("input", function () {
    if (this.value.length < 3) {
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

if (profileName) {
  profileName.value = localStorage.getItem("userName") || "";
}

if (profilePassword) {
  profilePassword.value = localStorage.getItem("userPassword") || "";
}

// ===============================
// LOGOUT SYSTEM
// ===============================
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    window.location.href = "index.html";
  }
}
