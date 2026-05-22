// logout.js
async function performLogout() {
  try {
    const response = await fetch("/api/logout.php", {
      method: "POST",
      credentials: "include",
    });

    const result = await response.json();

    if (result.status === "success") {
      window.location.href = "/login.html";
    } else {
      console.error("Logout failed");
      alert("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("Something went wrong during logout!");
  }
}

const logoutBtn = document.getElementById("logoutBtn");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

if (confirmLogoutBtn) {
  confirmLogoutBtn.addEventListener("click", performLogout);
} else if (logoutBtn) {
  logoutBtn.addEventListener("click", performLogout);
}
