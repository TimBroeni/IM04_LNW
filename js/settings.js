let pendingMemberRemovalId = null;
let pendingBoxRemovalId = null;
let logoutRequested = false;

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
		const householdCodeElement = document.getElementById("householdCode");
		const boxListElement = document.getElementById("boxList");
		const householdMembersList = document.getElementById("householdMembersList");

		if (!householdNameElement) {
			return;
		}

		householdNameElement.textContent = result.household_name || "Dein Zuhause";
		if (householdCodeElement) {
			householdCodeElement.textContent = result.household_code || "-";
		}

		if (boxListElement) {
			boxListElement.innerHTML = "";

			(result.boxes || []).forEach((box) => {
				const boxItem = document.createElement("li");
				boxItem.dataset.boxId = box.id;

				const boxName = document.createElement("p");
				boxName.textContent = box.name || "Unbenannte Kiste";

				const boxSerialnumber = document.createElement("p");
				boxSerialnumber.textContent = `Seriennummer: ${box.serialnumber || "-"}`;

				const removeBoxButton = document.createElement("button");
				removeBoxButton.type = "button";
				removeBoxButton.className = "household-remove-btn";
				removeBoxButton.textContent = "Entfernen";
				removeBoxButton.addEventListener("click", () => openRemoveBoxPopup(box.id));

				boxItem.append(boxName, boxSerialnumber, removeBoxButton);
				boxListElement.appendChild(boxItem);
			});
		}

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

function openRemoveBoxPopup(boxId) {
	pendingBoxRemovalId = boxId;

	const overlay = document.getElementById("removeBoxOverlay");
	if (overlay) {
		overlay.classList.remove("hidden");
	}
}

function closeRemoveBoxPopup() {
	pendingBoxRemovalId = null;

	const overlay = document.getElementById("removeBoxOverlay");
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

async function removeBox(boxId) {
	try {
		const response = await fetch("/api/settings.php", {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: "remove_box",
				box_id: boxId,
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

const confirmRemoveBoxBtn = document.getElementById("confirmRemoveBoxBtn");
if (confirmRemoveBoxBtn) {
	confirmRemoveBoxBtn.addEventListener("click", async () => {
		if (pendingBoxRemovalId == null) {
			closeRemoveBoxPopup();
			return;
		}

		const boxId = pendingBoxRemovalId;
		closeRemoveBoxPopup();
		await removeBox(boxId);
	});
}

const cancelRemoveBoxBtn = document.getElementById("cancelRemoveBoxBtn");
if (cancelRemoveBoxBtn) {
	cancelRemoveBoxBtn.addEventListener("click", closeRemoveBoxPopup);
}

function openLogoutPopup() {
	const overlay = document.getElementById("logoutOverlay");
	if (overlay) {
		overlay.classList.remove("hidden");
	}
}

function closeLogoutPopup() {
	const overlay = document.getElementById("logoutOverlay");
	if (overlay) {
		overlay.classList.add("hidden");
	}
	logoutRequested = false;
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
	logoutBtn.addEventListener("click", (event) => {
		event.preventDefault();
		openLogoutPopup();
	});
}

const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
if (cancelLogoutBtn) {
	cancelLogoutBtn.addEventListener("click", closeLogoutPopup);
}

const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
if (confirmLogoutBtn) {
	confirmLogoutBtn.addEventListener("click", () => {
		logoutRequested = true;
		closeLogoutPopup();
		window.dispatchEvent(new Event("settingsLogoutConfirmed"));
	});
}

loadHouseholdName();
