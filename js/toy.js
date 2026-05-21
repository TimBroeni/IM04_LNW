async function loadToyTotal() {
  try {
    const response = await fetch("/api/toy.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const result = await response.json();

    const toysTotalElement = document.getElementById("toys_total");
    if (toysTotalElement) {
      toysTotalElement.textContent = result.toys_total ?? 0;
    }
  } catch (error) {
    console.error(error);
  }
}

loadToyTotal();