// login.js
function showLoginErrorPopup() {
  const overlay = document.getElementById("loginErrorOverlay");
  const button = document.getElementById("loginErrorBtn");

  overlay.classList.remove("hidden");
  button.focus();
}

document.getElementById("loginErrorBtn").addEventListener("click", () => {
  document.getElementById("loginErrorOverlay").classList.add("hidden");
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("/api/login.php", {
      method: "POST",
      // credentials: 'include', // uncomment if front-end & back-end are on different domains
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();

    if (result.status === "success") {
      // If household_id is null/undefined, redirect to household setup page first
      if (result.household_id == null) {
        window.location.href = "household.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      showLoginErrorPopup();
    }
  } catch (error) {
    console.error("Error:", error);
    showLoginErrorPopup();
  }
});
