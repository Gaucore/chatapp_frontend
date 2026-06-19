import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useThemeStore = defineStore("theme", () => {
  // system theme detect
  const systemDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const darkMode = ref(localStorage.getItem("darkMode")
    ? JSON.parse(localStorage.getItem("darkMode"))
    : systemDark
  );

  const notifications = ref(true);

  // save to localStorage
  watch(darkMode, (val) => {
    localStorage.setItem("darkMode", JSON.stringify(val));
    applyTheme(val);
  });

  function toggleTheme() {
    darkMode.value = !darkMode.value;
  }

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.style.background = "#0b1220";
      document.body.style.color = "white";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.background = "#f5f5f5";
      document.body.style.color = "black";
    }
  }

  // init call
  applyTheme(darkMode.value);

  return {
    darkMode,
    notifications,
    toggleTheme,
  };
});