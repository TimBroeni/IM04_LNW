
async function loadProfile() {
  try {
    const user = await userData();
    if (!user) {
      return;
    }
    document.querySelector("#firstname").textContent = user.firstname || "";

  } catch (error) {
    console.error(error)
  }
}

function updateDashboardClear(allToysSorted) {
  const dashboardClear = document.querySelector("#dashboardClear");

  if (!dashboardClear) {
    return;
  }

  dashboardClear.classList.toggle("hidden", !allToysSorted);
}

async function loadToyCount() {
  try {
    const response = await fetch("/api/toy.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const result = await response.json();
    const toyCountElement = document.querySelector("#toyCount");

    if (toyCountElement) {
      toyCountElement.textContent = result.toys_total ?? 0;
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadBoxCount() {
  try {
    const response = await fetch("/api/dashboard.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const result = await response.json();
    const boxCountElement = document.querySelector("#boxCount");

    if (boxCountElement) {
      boxCountElement.textContent = result.boxes_total ?? 0;
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadToySortedCount() {
  try {
    const response = await fetch("/api/dashboard.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const result = await response.json();
    const toySortedElement = document.querySelector("#toySorted");

    if (toySortedElement) {
      toySortedElement.textContent = result.toys_sorted ?? 0;
    }

    updateDashboardClear(Boolean(result.all_toys_sorted));
  } catch (error) {
    console.error(error);
  }
}

function formatMissingTime(timestamp) {
  if (!timestamp) {
    return "gerade eben";
  }

  const secondsMissing = Math.max(0, Math.floor(Date.now() / 1000) - Number(timestamp));
  const minutesMissing = Math.floor(secondsMissing / 60);

  if (minutesMissing < 60) {
    return minutesMissing === 1 ? "1 Minute" : `${minutesMissing} Minuten`;
  }

  const hoursMissing = Math.round(minutesMissing / 60);

  if (hoursMissing < 24) {
    return hoursMissing === 1 ? "1 Stunde" : `${hoursMissing} Stunden`;
  }

  const daysMissing = Math.round(hoursMissing / 24);
  return daysMissing === 1 ? "1 Tag" : `${daysMissing} Tage`;
}

async function loadOutsideToys() {
  try {
    const response = await fetch("/api/dashboard.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const result = await response.json();
    const outsideToysContainer = document.querySelector("#toy_out");
    const allClearElement = document.querySelector("#allClear");
    const outsideToysHeading = document.querySelector("#outsideToysHeading");

    if (!outsideToysContainer) {
      return;
    }

    if (!result.outside_toys || result.outside_toys.length === 0) {
      outsideToysContainer.innerHTML = "";
      if (outsideToysHeading) {
        outsideToysHeading.classList.add("hidden");
      }
      if (allClearElement) {
        allClearElement.style.display = "block";
      }
      return;
    }

    if (outsideToysHeading) {
      outsideToysHeading.classList.remove("hidden");
    }

    if (allClearElement) {
      allClearElement.style.display = "none";
    }

    outsideToysContainer.innerHTML = "";

    result.outside_toys.forEach((toy) => {
      const toyCard = document.createElement("article");
      toyCard.className = "toy-out-card";

      const title = document.createElement("p");
      title.className = "toy-out-title";
      title.textContent = toy.name;

      const subtitle = document.createElement("p");
      subtitle.className = "out-since";
      subtitle.textContent = `${formatMissingTime(toy.timestamp)}`;

      toyCard.append(title, subtitle);
      outsideToysContainer.appendChild(toyCard);
    });
  } catch (error) {
    console.error(error);
  }
}

loadProfile();
loadToyCount();
loadBoxCount();
loadToySortedCount();
loadOutsideToys();