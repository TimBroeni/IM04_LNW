// Spielzeugübersicht und -verwaltung
// - Lädt Spielzeugliste mit Nutzungsdaten aus der API
// - Zeigt Nutzungschart der letzten 7 Tage an
// - Verwaltet Dialoge zum Löschen und Umbenennen von Spielzeugen
// - Arbeitet mit toy.php, toyUpdate.php und toys.html

let pendingToyDeleteId = null;
let pendingToyUpdateId = null;

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

    renderUsageChart(result.toys || []);

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
        lastUsed.textContent = `seit ${formatElapsedTime(toy.timestamp)}`;

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
        updateButton.addEventListener("click", () => openUpdateToyPopup(toy.id, toy.name));


        const status = document.createElement("p");
        status.className = "toy_status";
        status.textContent = toy.status || "Draussen";
        if (status.textContent === "In Kiste") {
          status.classList.add("toy_status--in-box");
        }

        listItem.append(name, toy_usage_count, deleteButton, updateButton, status, lastUsed);
        toyListElement.appendChild(listItem);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function renderUsageChart(toys) {
  const chartList = document.getElementById("toyUsageChartList");
  const emptyState = document.getElementById("toyUsageEmptyState");

  if (!chartList) {
    return;
  }

  chartList.innerHTML = "";

  if (!Array.isArray(toys) || toys.length === 0) {
    if (emptyState) {
      emptyState.classList.remove("hidden");
    }
    return;
  }

  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  const highestUsageCount = Math.max(...toys.map((toy) => Number(toy.usage_count) || 0), 0);

  toys.forEach((toy, index) => {
    const usageCount = Number(toy.usage_count) || 0;
    const percentage = highestUsageCount > 0
      ? (usageCount / highestUsageCount) * 100
      : index === 0
        ? 100
        : 0;

    const entry = document.createElement("div");
    entry.className = "chart_entry";

    const header = document.createElement("div");
    header.className = "chart_entry-header";

    const name = document.createElement("span");
    name.className = "chart_toyName";
    name.textContent = toy.name;

    const usage = document.createElement("span");
    usage.className = "chart_usage";
    usage.textContent = `${usageCount}x`;

    const bar = document.createElement("div");
    bar.className = "chart_bar";

    const fill = document.createElement("div");
    fill.className = "chart_bar_fill";
    fill.style.width = `${Math.max(0, Math.min(100, percentage)).toFixed(1)}%`;

    bar.appendChild(fill);
    header.append(name, usage);
    entry.append(header, bar);
    chartList.appendChild(entry);
  });
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

function openUpdateToyPopup(toyId, toyName) {
  pendingToyUpdateId = toyId;

  const overlay = document.getElementById("updateToyOverlay");
  const input = document.getElementById("updateToyNameInput");

  if (input) {
    input.value = toyName || "";
  }

  if (overlay) {
    overlay.classList.remove("hidden");
  }

  if (input) {
    input.focus();
  }
}

function closeUpdateToyPopup() {
  pendingToyUpdateId = null;

  const overlay = document.getElementById("updateToyOverlay");
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

async function updateToyName(toyId, toyName) {
  try {
    const response = await fetch("/api/toyUpdate.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "update_name",
        toy_id: toyId,
        name: toyName,
      }),
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
    return ">1min";
  }

  const elapsedMinutes = Math.floor((Date.now() / 1000 - Number(timestamp)) / 60);

  if (elapsedMinutes < 1) {
    return ">1min";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}min`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours}h`;
  }

  const elapsedDays = Math.round(elapsedHours / 24);
  return `${elapsedDays}d`;
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

const confirmUpdateToyBtn = document.getElementById("confirmUpdateToyBtn");
if (confirmUpdateToyBtn) {
  confirmUpdateToyBtn.addEventListener("click", async () => {
    const input = document.getElementById("updateToyNameInput");
    const toyName = input ? input.value.trim() : "";

    if (pendingToyUpdateId == null || toyName === "") {
      return;
    }

    const toyId = pendingToyUpdateId;
    closeUpdateToyPopup();
    await updateToyName(toyId, toyName);
  });
}

const cancelUpdateToyBtn = document.getElementById("cancelUpdateToyBtn");
if (cancelUpdateToyBtn) {
  cancelUpdateToyBtn.addEventListener("click", closeUpdateToyPopup);
}

loadToyTotal();