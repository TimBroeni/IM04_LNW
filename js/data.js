async function userData() {
  try {
    const response = await fetch("/api/profil.php", {
      credentials: "include",
    });

    const result = await response.json();
    console.log("Profile data:", result);

    return result;
    
  } catch (error) {
    console.error("Error:", error);
  }
}