
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

loadProfile();