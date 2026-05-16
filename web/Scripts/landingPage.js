const THEME_STORAGE_KEY = "streetbite-theme";

function getCurrentTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", normalizedTheme);
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  updateThemeControls(normalizedTheme);
}

function toggleTheme() {
  const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
}

function updateThemeControls(theme) {
  const isDark = theme === "dark";
  const button = document.querySelector("#themeToggleLandingButton");
  const icon = document.querySelector("#themeToggleLandingIcon");

  if (button) {
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute(
      "aria-label",
      isDark ? "Voltar para modo claro" : "Ativar modo escuro",
    );
  }

  if (icon) {
    icon.textContent = isDark ? "☀" : "☾";
  }
}

function initializeThemeToggle() {
  const button = document.querySelector("#themeToggleLandingButton");
  if (!button) return;

  button.addEventListener("click", () => {
    toggleTheme();
  });
}

function initializeFadeIn() {
  const animatedElements = Array.from(
    document.querySelectorAll("[data-fade-in]"),
  );

  if (!animatedElements.length) {
    return;
  }

  animatedElements.forEach((element, index) => {
    element.style.setProperty("--fade-delay", `${Math.min(index * 90, 360)}ms`);
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -5% 0px",
    },
  );

  animatedElements.forEach((element) => observer.observe(element));
}

document.addEventListener("DOMContentLoaded", function () {
  const persistedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = persistedTheme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeControls(theme);
  initializeThemeToggle();
  initializeFadeIn();
});
