// Logout-Verwaltung
// - Öffnet ein Bestätigungs-Popup beim Logout-Button
// - Führt die Abmeldung durch und löscht die Sitzung
// - Leitet zur Login-Seite weiter
// - Arbeitet mit logout.php, settings.html und profil.html

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
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
const logoutOverlay = document.getElementById("logoutOverlay");

function openLogoutPopup() {
  if (logoutOverlay) {
    logoutOverlay.classList.remove("hidden");
  }
}

function closeLogoutPopup() {
  if (logoutOverlay) {
    logoutOverlay.classList.add("hidden");
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (event) => {
    event.preventDefault();

    if (confirmLogoutBtn && logoutOverlay) {
      openLogoutPopup();
      return;
    }

    performLogout();
  });
}

if (confirmLogoutBtn) {
  confirmLogoutBtn.addEventListener("click", async () => {
    closeLogoutPopup();
    await performLogout();
  });
}

if (cancelLogoutBtn) {
  cancelLogoutBtn.addEventListener("click", closeLogoutPopup);
}
