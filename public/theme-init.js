// Runs before React mounts to set the theme class + document language, so dark-mode
// users don't see a flash of the light theme (FOUC). Keys match ThemeProvider
// ("calt-theme") and the i18n provider ("calt-lang").
(function () {
  try {
    var t = localStorage.getItem("calt-theme");
    if (t !== "light" && t !== "dark") {
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    if (t === "dark") document.documentElement.classList.add("dark");

    var l = localStorage.getItem("calt-lang");
    if (l !== "en" && l !== "ja") {
      l = (navigator.language || "").toLowerCase().indexOf("ja") === 0 ? "ja" : "en";
    }
    document.documentElement.lang = l;
  } catch (e) {
    /* localStorage unavailable (private mode) — fall back to defaults */
  }
})();
