const backToNameButton = document.getElementById("backToNameButton");
const skipToDashboardButton = document.getElementById("skipToDashboardButton");
const toyMessage = document.getElementById("toyMessage");

async function deleteToyAndRedirect(targetUrl) {
  try {
    const response = await fetch("/api/name_toy.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
      }),
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    window.location.href = targetUrl;
  } catch (error) {
    console.error(error);
    if (toyMessage) {
      toyMessage.textContent = "Es ist ein Fehler aufgetreten.";
    }
  }
}

if (backToNameButton) {
  backToNameButton.addEventListener("click", () => {
    deleteToyAndRedirect("/name_toy.html");
  });
}

if (skipToDashboardButton) {
  skipToDashboardButton.addEventListener("click", () => {
    deleteToyAndRedirect("/index.html");
  });
}