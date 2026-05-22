async function loadHouseholdName() {
	try {
		const response = await fetch("/api/settings.php", {
			credentials: "include",
		});

		if (response.status === 401) {
			window.location.href = "/login.html";
			return;
		}

		const result = await response.json();
		const householdNameElement = document.getElementById("householdName");
		const householdMembersList = document.getElementById("householdMembersList");

		if (!householdNameElement) {
			return;
		}

		householdNameElement.textContent = result.household_name || "Dein Zuhause";

		if (!householdMembersList) {
			return;
		}

		householdMembersList.innerHTML = "";

		(result.household_members || []).forEach((member) => {
			const memberItem = document.createElement("li");

			const memberName = document.createElement("p");
			memberName.textContent = `${member.firstname || ""} ${member.lastname || ""}`.trim();

			const memberEmail = document.createElement("p");
			memberEmail.textContent = member.email || "";

			memberItem.append(memberName, memberEmail);
			householdMembersList.appendChild(memberItem);
		});
	} catch (error) {
		console.error(error);
	}
}

loadHouseholdName();
