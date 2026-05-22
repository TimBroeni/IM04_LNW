let pendingMemberRemovalId = null;

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
			memberItem.dataset.memberId = member.id;

			const memberName = document.createElement("p");
			memberName.textContent = `${member.firstname || ""} ${member.lastname || ""}`.trim();

			const memberEmail = document.createElement("p");
			memberEmail.textContent = member.email || "";

			const removeButton = document.createElement("button");
			removeButton.type = "button";
			removeButton.className = "household-remove-btn";
			removeButton.textContent = "Entfernen";
			removeButton.addEventListener("click", () => openRemoveMemberPopup(member.id));

			memberItem.append(memberName, memberEmail, removeButton);
			householdMembersList.appendChild(memberItem);
		});
	} catch (error) {
		console.error(error);
	}
}

function openRemoveMemberPopup(memberId) {
	pendingMemberRemovalId = memberId;

	const overlay = document.getElementById("removeMemberOverlay");
	if (overlay) {
		overlay.classList.remove("hidden");
	}
}

function closeRemoveMemberPopup() {
	pendingMemberRemovalId = null;

	const overlay = document.getElementById("removeMemberOverlay");
	if (overlay) {
		overlay.classList.add("hidden");
	}
}

async function removeHouseholdMember(memberId) {
	try {
		const response = await fetch("/api/settings.php", {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: "remove_member",
				member_id: memberId,
			}),
		});

		if (response.status === 401) {
			window.location.href = "/login.html";
			return;
		}

		const result = await response.json();

		if (result.status === "success") {
			await loadHouseholdName();
		}
	} catch (error) {
		console.error(error);
	}
}

const confirmRemoveMemberBtn = document.getElementById("confirmRemoveMemberBtn");
if (confirmRemoveMemberBtn) {
	confirmRemoveMemberBtn.addEventListener("click", async () => {
		if (pendingMemberRemovalId == null) {
			closeRemoveMemberPopup();
			return;
		}

		const memberId = pendingMemberRemovalId;
		closeRemoveMemberPopup();
		await removeHouseholdMember(memberId);
	});
}

const cancelRemoveMemberBtn = document.getElementById("cancelRemoveMemberBtn");
if (cancelRemoveMemberBtn) {
	cancelRemoveMemberBtn.addEventListener("click", closeRemoveMemberPopup);
}

loadHouseholdName();
