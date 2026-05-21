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

      await deleteToyAndRedirect("toy.html");
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
        window.location.href = "/index.html";
        return;
      }
    } catch (error) {
      console.error(error);
    }

    await new Promise((resolve) => window.setTimeout(resolve, pollIntervalMs));
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

pollToyWeight();