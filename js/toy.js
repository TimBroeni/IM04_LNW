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

    const toyListElement = document.getElementById("toyList");
    if (toyListElement) {
      toyListElement.innerHTML = "";

      (result.toys || []).forEach((toy) => {
        const listItem = document.createElement("li");

        const name = document.createElement("p");
        name.className = "toy_name";
        name.textContent = toy.name;

        const usage = document.createElement("p");
        usage.className = "toy_usage";

        const usageCount = document.createElement("span");
        usageCount.className = "toy_usage_count";
        usageCount.textContent = formatElapsedTime(toy.timestamp);

        const usageTail = document.createElement("span");
        usageTail.textContent = ` ${toy.status === "In Kiste" ? "In Kiste" : "Draussen"}`;

        usage.append(usageCount, usageTail);

        const status = document.createElement("p");
        status.className = "toy_status";
        status.textContent = toy.status || "Draussen";

        listItem.append(name, usage, status);
        toyListElement.appendChild(listItem);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function formatElapsedTime(timestamp) {
  if (!timestamp || Number(timestamp) <= 0) {
    return "seit >1min";
  }

  const elapsedMinutes = Math.floor((Date.now() / 1000 - Number(timestamp)) / 60);

  if (elapsedMinutes < 1) {
    return "seit >1min";
  }

  if (elapsedMinutes < 60) {
    return `seit ${elapsedMinutes}min`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `seit ${elapsedHours}h`;
  }

  const elapsedDays = Math.round(elapsedHours / 24);
  return `seit ${elapsedDays}d`;
}

loadToyTotal();