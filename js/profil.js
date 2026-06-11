// Profilseite-Verwaltung
// - Lädt Nutzerdaten in Formularfelder und speichert Änderungen
// - Zeigt Erfolgs- und Fehler-Popups nach dem Update an
// - Leitet nach erfolgreicher Änderung zu Einstellungen weiter
// - Arbeitet mit profilUpdate.php, profil.html, logout.js und settings.html

function showSuccessPopup() {
  const overlay = document.getElementById("successOverlay");
  const button = document.getElementById("popupContinueBtn");

  overlay.classList.remove("hidden");
  button.focus();
}

function showErrorPopup(message) {
  const overlay = document.getElementById("errorOverlay");
  const messageElement = document.getElementById("profileErrorTitle");
  const button = document.getElementById("errorContinueBtn");

  messageElement.textContent = message;
  overlay.classList.remove("hidden");
  button.focus();
}

function hideErrorPopup() {
  document.getElementById("errorOverlay").classList.add("hidden");
}

document.getElementById("popupContinueBtn").addEventListener("click", () => {
  window.location.href = "settings.html";
});

document.getElementById("errorContinueBtn").addEventListener("click", hideErrorPopup);

window.addEventListener("load", async function () {
  const user = await userData();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.querySelector("#email").value = user.email || "";
  document.querySelector("#firstname").value = user.firstname || "";
  document.querySelector("#lastname").value = user.lastname || "";
})

document.getElementById("profilForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const firstname = document.getElementById("firstname").value.trim();
  const lastname = document.getElementById("lastname").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("/api/profilUpdate.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, firstname, lastname, password }),
    });
    const result = await response.json();
    console.log("Update response:", result);

    if (result.status === "success") {
      const updatedUser = await userData();
      if (updatedUser) {
        document.getElementById("email").value = updatedUser.email || "";
        document.getElementById("firstname").value = updatedUser.firstname || "";
        document.getElementById("lastname").value = updatedUser.lastname || "";
      }
      document.getElementById("password").value = "";
      showSuccessPopup();
    } else {
      showErrorPopup(result.message || "Profile update failed.");
    }

  } catch (error) {
    console.error("Error:", error);
    showErrorPopup("Something went wrong!");
  }
});

  
