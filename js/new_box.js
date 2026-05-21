const newBoxForm = document.getElementById("newBoxForm");
const boxMessage = document.getElementById("boxMessage");

if (newBoxForm) {
	newBoxForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const serialnumber = document.getElementById("box_serialnumber").value.trim();
		const boxName = document.getElementById("box_name").value.trim();

		try {
			const response = await fetch("/api/new_box.php", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "create",
					serialnumber,
					name: boxName,
				}),
			});

			if (response.status === 401) {
				window.location.href = "/login.html";
				return;
			}

			const result = await response.json();

			if (result.status === "success") {
				window.location.href = "/name_toy.html";
				return;
			}

			boxMessage.textContent = result.message || "Die Kiste konnte nicht gespeichert werden.";
		} catch (error) {
			console.error(error);
			boxMessage.textContent = "Es ist ein Fehler aufgetreten.";
		}
	});
}
