const SESSION_KEY = "streetbite-store-session";

export function requireAuth() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return Boolean(session?.shopName);
  } catch {
    return false;
  }
}

export function redirectToLogin() {
  const currentFile = window.location.pathname.split("/").pop();
  if (currentFile === "store-auth.html") return;

  const loginUrl = new URL("store-auth.html", window.location.href);
  loginUrl.searchParams.set("redirect", window.location.href);
  window.location.href = loginUrl.href;
}
