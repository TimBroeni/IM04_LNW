// profil.js

window.addEventListener("load", async function () {
  const user = await userData();
  if (!user) {
    alert("Failed to load user data. Please try again.");
    return;
  }

  document.querySelector("#firstname").value = user.firstname || "";
  document.querySelector("#lastname").value = user.lastname || "";
})

document.getElementById("profilForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstname = document.getElementById("firstname").value.trim();
  const lastname = document.getElementById("lastname").value.trim();

  try {
    const response = await fetch("/api/profilUpdate.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstname, lastname }),
    });
    const result = await response.json();
    console.log("Update response:", result);

    if (result.status === "success") {
      const updatedUser = await userData();
      if (updatedUser) {
        document.getElementById("firstname").value = updatedUser.firstname || "";
        document.getElementById("lastname").value = updatedUser.lastname || "";
      }
      alert("Profile updated successfully!");
    } else {
      alert(result.message || "Profile update failed.");
    }

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong!");
  }
});

  
