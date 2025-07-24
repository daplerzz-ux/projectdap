document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("theme-toggle");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");

  const enableDarkMode = () => {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  };

  const disableDarkMode = () => {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  };

  // Set tema saat halaman dimuat
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    enableDarkMode();
  }

  // Tambahkan event pada tombol
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (document.body.classList.contains("dark-mode")) {
        disableDarkMode();
      } else {
        enableDarkMode();
      }
    });
  }
});
