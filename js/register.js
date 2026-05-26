// register.js
function showSuccessPopup() {
    const overlay = document.getElementById("successOverlay");
    const button = document.getElementById("popupContinueBtn");

    overlay.classList.remove("hidden");
    button.focus();
}

function showErrorPopup(message) {
  const overlay = document.getElementById("errorOverlay");
  const messageElement = document.getElementById("registerErrorTitle");
  const button = document.getElementById("errorContinueBtn");

  messageElement.textContent = message;
  overlay.classList.remove("hidden");
  button.focus();
}

function hideErrorPopup() {
  document.getElementById("errorOverlay").classList.add("hidden");
}

document
    .getElementById("popupContinueBtn")
    .addEventListener("click", () => {
        window.location.href = "login.html";
    });

document.getElementById("errorContinueBtn").addEventListener("click", hideErrorPopup);

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const firstname = document.getElementById("firstname").value.trim();
  const lastname = document.getElementById("lastname").value.trim();

  try {
    const response = await fetch("api/register.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, firstname, lastname }),
    });
    const result = await response.json();

    if (result.status === "success") {
      showSuccessPopup();
    } else {
      showErrorPopup(result.message || "Registration failed.");
    }
  } catch (error) {
    console.error("Error:", error);
    showErrorPopup("Something went wrong!");
  }
});
