import loadingProgress from "./components/loadingProgress.js";
import "./components/snackbar.js";
import { requireAuth, redirectToLogin } from "./authGuard.js";

if (!requireAuth()) {
  redirectToLogin();
}

const contentArea = document.querySelector("#contentArea");
const homeButton = document.querySelector("#homeButton");
const menuButton = document.querySelector("#menuButton");
const ordersButton = document.querySelector("#ordersButton");
const themeToggleSidebarButton = document.querySelector(
  "#themeToggleSidebarButton",
);
const themeToggleIcon = document.querySelector("#themeToggleIcon");
const sidebarProfile = document.querySelector("[data-sidebar-profile]");
const sidebarAvatar = document.querySelector("[data-sidebar-avatar]");
const sidebarAvatarInitial = document.querySelector(
  "[data-sidebar-avatar-initial]",
);
const sidebarGreeting = document.querySelector("[data-sidebar-greeting]");
const sidebarName = document.querySelector("[data-sidebar-name]");
const sidebarRole = document.querySelector("[data-sidebar-role]");
const sidebarAuthActions = document.querySelector(
  "[data-sidebar-auth-actions]",
);
const sidebarLoginButton = document.querySelector("[data-sidebar-login]");
const sidebarRegisterButton = document.querySelector("[data-sidebar-register]");
const mobileActionButton = document.querySelector("#mobileActionButton");
const mobileQuickActions = document.querySelector("#mobileQuickActions");
const quickCreateItemButton = document.querySelector("#quickCreateItem");
const quickCreateOrderButton = document.querySelector("#quickCreateOrder");
const floatingActionButtons = document.querySelector("#floatingActionButtons");

const THEME_STORAGE_KEY = "streetbite-theme";
const PAGE_SCRIPT_CACHE_PARAM = "sb_page_load";

function readSidebarSession() {
  try {
    const rawSession = sessionStorage.getItem("streetbite-store-session");
    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession);
    if (!parsedSession || typeof parsedSession !== "object") {
      return null;
    }

    return {
      shopName: String(parsedSession.shopName ?? "").trim(),
      email: String(parsedSession.email ?? "").trim(),
      cep: String(parsedSession.cep ?? "").trim(),
    };
  } catch {
    return null;
  }
}

function updateSidebarProfile() {
  const session = readSidebarSession();
  const isAuthenticated = Boolean(session?.shopName);

  if (sidebarProfile) {
    sidebarProfile.classList.toggle("is-authenticated", isAuthenticated);
    sidebarProfile.classList.toggle("is-guest", !isAuthenticated);
  }

  if (sidebarAvatar) {
    sidebarAvatar.classList.toggle("is-guest", !isAuthenticated);
  }

  if (sidebarAvatarInitial) {
    sidebarAvatarInitial.textContent = isAuthenticated
      ? session.shopName.charAt(0).toUpperCase()
      : "👤";
  }

  if (sidebarGreeting) {
    sidebarGreeting.textContent = isAuthenticated
      ? session.shopName
      : "Bem-vindo!";
  }

  if (sidebarName) {
    sidebarName.textContent = isAuthenticated
      ? "Administrador"
      : "Faça login para continuar";
  }

  if (sidebarRole) {
    sidebarRole.textContent = isAuthenticated ? "Sair" : "Acesso ao painel";
    sidebarRole.hidden = !isAuthenticated;
    sidebarRole.setAttribute(
      "aria-label",
      isAuthenticated ? "Sair do painel" : "Acesso ao painel",
    );
  }

  if (sidebarAuthActions) {
    sidebarAuthActions.hidden = isAuthenticated;
  }

  if (sidebarLoginButton) {
    sidebarLoginButton.hidden = isAuthenticated;
  }

  if (sidebarRegisterButton) {
    sidebarRegisterButton.hidden = isAuthenticated;
  }

  if (homeButton?.closest(".buttonsNav")) {
    homeButton.closest(".buttonsNav").hidden = !isAuthenticated;
  }
}

function applyTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", normalizedTheme);
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  updateThemeControls(normalizedTheme);
}

function getCurrentTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function toggleTheme() {
  const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  return nextTheme;
}

function updateThemeControls(theme) {
  const isDark = theme === "dark";

  if (themeToggleSidebarButton) {
    themeToggleSidebarButton.setAttribute("aria-pressed", String(isDark));
    themeToggleSidebarButton.setAttribute(
      "aria-label",
      isDark ? "Voltar para modo claro" : "Ativar modo escuro",
    );
  }

  if (themeToggleIcon) {
    themeToggleIcon.textContent = isDark ? "☀" : "☾";
  }

  const themeLabel = document.querySelector("#themeLabel");
  if (themeLabel) {
    themeLabel.textContent = `Tema atual: ${isDark ? "Escuro" : "Claro"}`;
  }
}

function syncAccessibilityButtonIntoStack() {
  if (!floatingActionButtons) return;

  const accessibilityButton = document.querySelector(".asw-menu-btn");
  if (!accessibilityButton) return;

  if (accessibilityButton.parentElement !== floatingActionButtons) {
    floatingActionButtons.appendChild(accessibilityButton);
  }
}

function handleLogout() {
  sessionStorage.removeItem("streetbite-store-session");
  updateSidebarProfile();
  window.location.href = "../index.html";
}

sidebarRole?.addEventListener("click", () => {
  if (sidebarRole.hidden) {
    return;
  }

  handleLogout();
});

window.applyTheme = applyTheme;
window.getCurrentTheme = getCurrentTheme;
window.toggleTheme = toggleTheme;

// Apply persisted theme as soon as shell script is loaded.
applyTheme(getCurrentTheme());
updateSidebarProfile();

const pages = {
  home: {
    html: "home.html",
  },
  menu: {
    html: "menu.html",
  },
  requests: {
    html: "pedidos.html",
  },
};

// Map href filenames to page keys for internal link interception
const hrefToPageKey = {
  "home.html": "home",
  "menu.html": "menu",
  "pedidos.html": "requests",
};

const pageToSidebarButton = {
  home: homeButton,
  menu: menuButton,
  requests: ordersButton,
};

let currentPageAssets = [];

function isMobileViewport() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function closeMobileQuickActions() {
  if (!mobileQuickActions || !mobileActionButton) return;
  mobileQuickActions.classList.remove("is-open");
  mobileQuickActions.setAttribute("aria-hidden", "true");
  mobileActionButton.setAttribute("aria-expanded", "false");
}

function toggleMobileQuickActions() {
  if (!mobileQuickActions || !mobileActionButton) return;
  const willOpen = !mobileQuickActions.classList.contains("is-open");
  mobileQuickActions.classList.toggle("is-open", willOpen);
  mobileQuickActions.setAttribute("aria-hidden", String(!willOpen));
  mobileActionButton.setAttribute("aria-expanded", String(willOpen));
}

async function triggerMobileQuickAction(actionType) {
  if (actionType === "create-item") {
    window.__streetbitePendingAction = "open-item-wizard";
    await loadPage("menu");
  }

  if (actionType === "create-order") {
    window.__streetbitePendingAction = "open-order-wizard";
    await loadPage("requests");
  }

  closeMobileQuickActions();
}

function updateSidebarActive(pageKey) {
  const buttons = [homeButton, menuButton, ordersButton];
  buttons.forEach((button) => button?.classList.remove("is-active"));

  const activeButton = pageToSidebarButton[pageKey];
  activeButton?.classList.add("is-active");
}

function clearPageAssets() {
  currentPageAssets.forEach((asset) => asset.remove());
  currentPageAssets = [];
}

function resolveUrl(value, baseUrl) {
  if (!value) return value;

  const normalizedValue = value.trim();
  if (
    !normalizedValue ||
    normalizedValue.startsWith("#") ||
    normalizedValue.startsWith("data:") ||
    normalizedValue.startsWith("mailto:") ||
    normalizedValue.startsWith("tel:") ||
    normalizedValue.startsWith("javascript:")
  ) {
    return value;
  }

  return new URL(normalizedValue, baseUrl).href;
}

function resolveBodyAssetUrls(doc, baseUrl) {
  doc.body.querySelectorAll("[src]").forEach((element) => {
    const source = element.getAttribute("src");
    if (source) {
      element.setAttribute("src", resolveUrl(source, baseUrl));
    }
  });

  doc.body.querySelectorAll("[href]").forEach((element) => {
    const href = element.getAttribute("href");
    if (href) {
      element.setAttribute("href", resolveUrl(href, baseUrl));
    }
  });
}

function appendCacheBuster(assetUrl) {
  const resolvedUrl = new URL(assetUrl);
  // Use URL fragment to avoid server-side 404 on unknown query params for JS modules.
  resolvedUrl.hash = `${PAGE_SCRIPT_CACHE_PARAM}=${Date.now().toString()}`;
  return resolvedUrl.href;
}

function injectPageAssets(doc, baseUrl) {
  clearPageAssets();

  const headAssets = doc.head.querySelectorAll(
    'link[rel="stylesheet"], script[src]',
  );

  headAssets.forEach((asset) => {
    const tagName = asset.tagName.toLowerCase();
    const clonedAsset = document.createElement(tagName);

    Array.from(asset.attributes).forEach((attribute) => {
      let value = attribute.value;

      if (attribute.name === "href" || attribute.name === "src") {
        value = resolveUrl(attribute.value, baseUrl);
      }

      if (tagName === "script" && attribute.name === "src") {
        value = appendCacheBuster(value);
      }

      clonedAsset.setAttribute(attribute.name, value);
    });

    clonedAsset.dataset.pageAsset = "true";
    if (tagName === "script") {
      document.body.appendChild(clonedAsset);
    } else {
      document.head.appendChild(clonedAsset);
    }
    currentPageAssets.push(clonedAsset);
  });
}

async function loadPage(pageKey) {
  if (!requireAuth()) {
    redirectToLogin();
    return;
  }

  const page = pages[pageKey];
  if (!page) return;

  updateSidebarActive(pageKey);

  const loadingToken = loadingProgress.start({
    message: "Carregando tela...",
  });

  try {
    const response = await fetch(page.html);
    if (!response.ok) {
      throw new Error(`Não foi possível carregar ${page.html}.`);
    }

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    resolveBodyAssetUrls(doc, response.url);
    injectPageAssets(doc, response.url);
    contentArea.innerHTML = doc.body.innerHTML;
  } finally {
    loadingProgress.finish(loadingToken);
  }

  if (isMobileViewport()) {
    closeMobileQuickActions();
  }
}

// Expose globally so page scripts can trigger navigation (e.g. menu.js after reload)
window.loadPage = loadPage;

// Intercept internal navigation links inside contentArea
contentArea.addEventListener("click", (e) => {
  const pageButton = e.target.closest("button[data-load-page]");
  if (pageButton) {
    const pageKey = pageButton.dataset.loadPage;
    if (pageKey && pages[pageKey]) {
      e.preventDefault();
      loadPage(pageKey);
      return;
    }
  }

  const scrollButton = e.target.closest("button[data-scroll-target]");
  if (scrollButton) {
    const targetSelector = scrollButton.dataset.scrollTarget;
    if (targetSelector) {
      const targetElement = contentArea.querySelector(targetSelector);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
  }

  const anchor = e.target.closest("a[href]");
  if (!anchor) return;
  const filename = anchor.getAttribute("href").split("/").pop();
  const pageKey = hrefToPageKey[filename];
  if (pageKey) {
    e.preventDefault();
    loadPage(pageKey);
  }
});

homeButton.addEventListener("click", (e) => {
  e.preventDefault();
  loadPage("home");
});
menuButton.addEventListener("click", (e) => {
  e.preventDefault();
  loadPage("menu");
});
ordersButton.addEventListener("click", (e) => {
  e.preventDefault();
  loadPage("requests");
});

if (mobileActionButton) {
  mobileActionButton.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMobileQuickActions();
  });
}

if (quickCreateItemButton) {
  quickCreateItemButton.addEventListener("click", async () => {
    await triggerMobileQuickAction("create-item");
  });
}

if (quickCreateOrderButton) {
  quickCreateOrderButton.addEventListener("click", async () => {
    await triggerMobileQuickAction("create-order");
  });
}

document.addEventListener("click", (event) => {
  if (!isMobileViewport()) return;
  if (!mobileQuickActions || !mobileActionButton) return;

  const clickedInsideQuickActions = mobileQuickActions.contains(event.target);
  const clickedActionButton = mobileActionButton.contains(event.target);

  if (!clickedInsideQuickActions && !clickedActionButton) {
    closeMobileQuickActions();
  }
});

window.addEventListener("resize", () => {
  if (!isMobileViewport()) {
    closeMobileQuickActions();
  }
});

if (themeToggleSidebarButton) {
  themeToggleSidebarButton.addEventListener("click", () => {
    toggleTheme();
  });
}

if (floatingActionButtons) {
  syncAccessibilityButtonIntoStack();

  const accessibilityObserver = new MutationObserver(() => {
    syncAccessibilityButtonIntoStack();
  });

  accessibilityObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Load home page on startup
loadPage("home");
