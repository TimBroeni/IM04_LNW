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

// Fetch toy data
// async function toyData() {
//   try {
//     const response = await fetch("/api/toys.php", {
//       credentials: "include",
//     });

//     const result = await response.json();
//     console.log("Toys data:", result);

//     return result;
    
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }