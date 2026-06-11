// Authentifizierungs-Check
// - Prüft beim Laden, ob der Nutzer noch angemeldet ist.
// - Speichert die user_id und leitet zu Login weiter, falls nicht angemeldet
// - Arbeitet mit auth.php und login.html
// - Wird auf allen geschützten Seiten eingebunden

let authUserId = 0;

async function checkAuth() {
  try {
    const response = await fetch("/api/auth.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return false;
    }
    
    const result = await response.json();

    authUserId = result.user_id;

    return true
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login.html";
    return false;
  }
}

// Check auth when page loads
window.addEventListener("load", checkAuth);
