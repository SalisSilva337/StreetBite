(() => {
  const themeToggleButton = document.querySelector("#themeToggleButton");
  const themeLabel = document.querySelector("#themeLabel");

  function updateThemeText(theme) {
    const isDark = theme === "dark";

    if (themeLabel) {
      themeLabel.textContent = `Tema atual: ${isDark ? "Escuro" : "Claro"}`;
    }

    if (themeToggleButton) {
      themeToggleButton.textContent = isDark
        ? "Voltar para modo claro"
        : "Ativar modo escuro";
      themeToggleButton.setAttribute("aria-pressed", String(isDark));
    }
  }

  const getCurrentThemeFn =
    typeof window.getCurrentTheme === "function"
      ? window.getCurrentTheme
      : () => "light";

  const toggleThemeFn =
    typeof window.toggleTheme === "function"
      ? window.toggleTheme
      : () => getCurrentThemeFn();

  updateThemeText(getCurrentThemeFn());

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const nextTheme = toggleThemeFn();
      updateThemeText(nextTheme);
    });
  }
})();
