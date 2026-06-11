// Haushalt-Beitrittsverwaltung
// - Nimmt Haushaltscode im Formular entgegen und sendet ihn an die API
// - Zeigt Erfolgs- oder Fehlermeldungen an
// - Leitet bei Erfolg zu household.html oder dashboard weiter
// - Arbeitet mit household.php und join_household.html

const joinHouseholdForm = document.getElementById("joinHouseholdForm");
const householdMessage = document.getElementById("householdMessage");

joinHouseholdForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const householdCode = document.getElementById("household_code").value.trim();

	try {
		const response = await fetch("/api/household.php", {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: "join",
				code: householdCode,
			}),
		});

		if (response.status === 401) {
			window.location.href = "/login.html";
			return;
		}

		const result = await response.json();

		if (result.status === "success") {
			householdMessage.textContent = "Du bist jetzt dem Haushalt beigetreten.";
			window.location.href = "/index.html";
			return;
		}

		householdMessage.textContent = result.message || "Haushalt konnte nicht beigetreten werden.";
	} catch (error) {
		console.error(error);
		householdMessage.textContent = "Es ist ein Fehler aufgetreten.";
	}
});
