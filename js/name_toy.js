const nameToyForm = document.getElementById("nameToyForm");
const skipToyButton = document.getElementById("skipToyButton");
const toyMessage = document.getElementById("toyMessage");

if (nameToyForm) {
  nameToyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const toyName = document.getElementById("toy_name").value.trim();

    try {
      const response = await fetch("/api/name_toy.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          name: toyName,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login.html";
        return;
      }

      const result = await response.json();

      if (result.status === "success") {
        toyMessage.textContent = "Spielzeugname gespeichert.";
        window.location.href = "/add_toy.html";
        return;
      }

      toyMessage.textContent = result.message || "Spielzeug konnte nicht gespeichert werden.";
    } catch (error) {
      console.error(error);
      toyMessage.textContent = "Es ist ein Fehler aufgetreten.";
    }
  });
}

if (skipToyButton) {
  skipToyButton.addEventListener("click", () => {
    window.location.href = "/index.html";
  });
}