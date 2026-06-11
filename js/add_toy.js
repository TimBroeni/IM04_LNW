// Spielzeug Hinzufügen
// - Zeigt die Anweisung, das Spielzeug in die Kiste zu legen
// - Bietet Zurück- und Später-Optionen an
// - Zeigt Erfolgs-Popup und navigiert weiter
// - Arbeitet mit name_toy.php, add_toy.html und dashboard

const backToNameButton = document.getElementById("backToNameButton");
const skipToDashboardButton = document.getElementById("skipToDashboardButton");
const toyMessage = document.getElementById("toyMessage");
const toyAddedOverlay = document.getElementById("toyAddedOverlay");
const continueToyAddedBtn = document.getElementById("continueToyAddedBtn");

function openToyAddedPopup() {
  if (toyAddedOverlay) {
    toyAddedOverlay.classList.remove("hidden");
  }

  if (continueToyAddedBtn) {
    continueToyAddedBtn.focus();
  }
}

function closeToyAddedPopup() {
  if (toyAddedOverlay) {
    toyAddedOverlay.classList.add("hidden");
  }
}

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

async function pollToyWeight() {
  const pollIntervalMs = 1000;
  const timeoutMs = 15000;
  const startedAt = Date.now();
  let pollingActive = true;

  if (toyMessage) {
    toyMessage.textContent = "Warte auf das Gewicht des Spielzeugs ...";
  }

  while (pollingActive) {
    const elapsed = Date.now() - startedAt;

    if (elapsed >= timeoutMs) {
      pollingActive = false;

      if (toyMessage) {
        toyMessage.textContent = "Das Spielzeug wurde nicht rechtzeitig erkannt. Du wirst weitergeleitet.";
      }

      await deleteToyAndRedirect("toys.html");
      return;
    }

    try {
      const response = await fetch("/api/name_toy.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "status",
        }),
      });

      if (!pollingActive) {
        return;
      }

      if (response.status === 401) {
        pollingActive = false;
        window.location.href = "/login.html";
        return;
      }

      const result = await response.json();

      if (!pollingActive) {
        return;
      }

      if (
        result.status === "success" &&
        Number(result.add_mode) === 0 &&
        Number(result.weight) > 0
      ) {
        pollingActive = false;
        openToyAddedPopup();
        return;
      }
    } catch (error) {
      console.error(error);
    }

    await new Promise((resolve) => window.setTimeout(resolve, pollIntervalMs));
  }
}

if (continueToyAddedBtn) {
  continueToyAddedBtn.addEventListener("click", () => {
    closeToyAddedPopup();
    window.location.href = "/index.html";
  });
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

pollToyWeight();