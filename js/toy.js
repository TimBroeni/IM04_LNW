let pendingToyDeleteId = null;

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
    const toyEmptyStateElement = document.getElementById("toyEmptyState");
    if (toyListElement) {
      toyListElement.innerHTML = "";

      if ((result.toys || []).length === 0) {
        if (toyEmptyStateElement) {
          toyEmptyStateElement.classList.remove("hidden");
        }
        return;
      }

      if (toyEmptyStateElement) {
        toyEmptyStateElement.classList.add("hidden");
      }

      (result.toys || []).forEach((toy) => {
        const listItem = document.createElement("li");
        listItem.dataset.toyId = toy.id;

        const name = document.createElement("p");
        name.className = "toy_name";
        name.textContent = toy.name;

        const toy_usage_count = document.createElement("p");
        toy_usage_count.className = "toy_usage_count";
        toy_usage_count.textContent = `${toy.weekly_removals ?? 0} Nutzungen diese Woche`;

        const lastUsed = document.createElement("p");
        lastUsed.className = "toy_lastUsed";
        lastUsed.textContent = `Zuletzt verwendet ${formatElapsedTime(toy.timestamp)}`;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "toy_delete-btn";
        deleteButton.setAttribute("aria-label", `${toy.name} löschen`);

        const deleteIcon = document.createElement("img");
        deleteIcon.src = "/images/DEMO_toy_loeschen.png";
        deleteIcon.alt = "Löschen";

        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener("click", () => openDeleteToyPopup(toy.id));

        const updateButton = document.createElement("button");
        updateButton.type = "button";
        updateButton.className = "toy_update-btn";
        updateButton.setAttribute("aria-label", `${toy.name} bearbeiten`);

        const updateIcon = document.createElement("img");
        updateIcon.src = "/images/DEMO_toy_update.png";
        updateIcon.alt = "Bearbeiten";

        updateButton.appendChild(updateIcon);


        const status = document.createElement("p");
        status.className = "toy_status";
        status.textContent = toy.status || "Draussen";

        listItem.append(name, toy_usage_count, deleteButton, updateButton, status, lastUsed);
        toyListElement.appendChild(listItem);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function openDeleteToyPopup(toyId) {
  pendingToyDeleteId = toyId;

  const overlay = document.getElementById("deleteToyOverlay");
  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

function closeDeleteToyPopup() {
  pendingToyDeleteId = null;

  const overlay = document.getElementById("deleteToyOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}

async function deleteToy(toyId) {
  try {
    const response = await fetch("/api/toyUpdate.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toy_id: toyId }),
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const result = await response.json();

    if (result.status === "success") {
      await loadToyTotal();
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

const confirmDeleteToyBtn = document.getElementById("confirmDeleteToyBtn");
if (confirmDeleteToyBtn) {
  confirmDeleteToyBtn.addEventListener("click", async () => {
    if (pendingToyDeleteId == null) {
      closeDeleteToyPopup();
      return;
    }

    const toyId = pendingToyDeleteId;
    closeDeleteToyPopup();
    await deleteToy(toyId);
  });
}

const cancelDeleteToyBtn = document.getElementById("cancelDeleteToyBtn");
if (cancelDeleteToyBtn) {
  cancelDeleteToyBtn.addEventListener("click", closeDeleteToyPopup);
}

loadToyTotal();