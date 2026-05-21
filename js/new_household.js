const createHouseholdForm = document.getElementById("createHouseholdForm");
const householdMessage = document.getElementById("householdMessage");

createHouseholdForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const householdName = document.getElementById("household_name").value.trim();

    try {
    const response = await fetch("/api/household.php", {
        method: "POST",
        credentials: "include",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        action: "create",
        household_name: householdName,
        }),
    });

    if (response.status === 401) {
        window.location.href = "/login.html";
        return;
    }

    const result = await response.json();

    if (result.status === "success") {
        householdMessage.textContent = `Haushalt erstellt. Code: ${result.code}`;
        window.location.href = "/index.html";
        return;
    }

    householdMessage.textContent = result.message || "Haushalt konnte nicht erstellt werden.";
    } catch (error) {
    console.error(error);
    householdMessage.textContent = "Es ist ein Fehler aufgetreten.";
    }
});