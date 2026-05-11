// profil.js

async function loadProfile() {
  try {
    const response = await fetch("/api/profil.php", {
      credentials: "include",
    });

    const result = await response.json();
    console.log("Profile data:", result);

  } catch (error) {
    console.error("Error:", error);
  }
}

loadProfile();

document.getElementById("profilForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();

    try {
      const response = await fetch("api/profilUpdate.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstname, lastname }),
      });
      const result = await response.text();
      console.log("Update response:", result);

      // if (result.status === "success") {
      //   alert("Profile updated successfully!");
      // } else {
      //   alert(result.message || "Profile update failed.");
      // }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  });
