
async function loadProfile() {
  try {
    const response = await fetch("/api/dashboard.php", {
      credentials: "include",
    });

    const result = await response.json();
    console.log("Profile data-Dashboard:", result);

    document.querySelector("#firstname").textContent = result.firstname || "";


  } catch (error) {
    console.error(error)
  }
}

loadProfile();