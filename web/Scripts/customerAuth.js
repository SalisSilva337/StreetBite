import ApiService from "./service.js";

const api = new ApiService();

const STORAGE_KEYS = {
  account: "streetbite-consumer-account",
  session: "streetbite-consumer-session",
};

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeDigits(value) {
  return normalizeText(value).replace(/\D/g, "");
}

function readJson(storage, key) {
  try {
    const rawValue = storage.getItem(key);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
  } catch {
    return null;
  }
}

function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}

function setStatus(statusElement, message, type = "info") {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.classList.remove("is-error", "is-success");

  if (type === "error") {
    statusElement.classList.add("is-error");
  }

  if (type === "success") {
    statusElement.classList.add("is-success");
  }
}

function setActiveView(rootElement, viewName) {
  const tabs = rootElement.querySelectorAll("[data-auth-tab]");
  const views = rootElement.querySelectorAll("[data-auth-view]");

  tabs.forEach((tab) => {
    const isActive = tab.dataset.authTab === viewName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  views.forEach((view) => {
    view.classList.toggle("hidden", view.dataset.authView !== viewName);
  });
}

function saveAccount(account) {
  writeJson(localStorage, STORAGE_KEYS.account, account);
}

function saveSession(account) {
  writeJson(sessionStorage, STORAGE_KEYS.session, {
    name: account.name,
    email: account.email,
    phone: account.phone,
    authenticatedAt: new Date().toISOString(),
  });
}

export function getStoredCustomerAccount() {
  const account = readJson(localStorage, STORAGE_KEYS.account);

  if (!account) {
    return null;
  }

  return {
    id: Number(account.id ?? 0),
    name: normalizeText(account.name),
    email: normalizeText(account.email),
    phone: normalizeDigits(account.phone),
    password: normalizeText(account.password),
  };
}

export function initializeCustomerAuth() {
  const rootElement = document.querySelector("[data-customer-auth-root]");
  if (!rootElement) {
    return;
  }

  const authStatus = rootElement.querySelector("[data-auth-status]");
  const tabButtons = rootElement.querySelectorAll("[data-auth-tab]");
  const loginView = rootElement.querySelector('[data-auth-view="login"]');
  const registerView = rootElement.querySelector('[data-auth-view="register"]');
  const loginIdentityInput = rootElement.querySelector("[data-login-identity]");
  const loginPasswordInput = rootElement.querySelector("[data-login-password]");
  const registerNameInput = rootElement.querySelector("[data-register-name]");
  const registerEmailInput = rootElement.querySelector("[data-register-email]");
  const registerPhoneInput = rootElement.querySelector("[data-register-phone]");
  const registerPasswordInput = rootElement.querySelector("[data-register-password]");

  const storedAccount = getStoredCustomerAccount();
  if (storedAccount) {
    if (registerNameInput) {
      registerNameInput.value = storedAccount.name;
    }

    if (registerEmailInput) {
      registerEmailInput.value = storedAccount.email;
    }

    if (registerPhoneInput) {
      registerPhoneInput.value = storedAccount.phone;
    }
  }

  setActiveView(rootElement, "register");
  setStatus(authStatus, "Cadastre o cliente para validar o nome na comanda.");

  tabButtons.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      const nextView = tabButton.dataset.authTab === "login" ? "login" : "register";
      setActiveView(rootElement, nextView);
      setStatus(
        authStatus,
        nextView === "register"
          ? "Cadastre o cliente para validar o nome na comanda."
          : "Acesse com os dados já cadastrados.",
      );
    });
  });

  loginView?.addEventListener("submit", (event) => {
    event.preventDefault();

    const identity = normalizeText(loginIdentityInput?.value).toLowerCase();
    const password = normalizeText(loginPasswordInput?.value);
    const account = getStoredCustomerAccount();

    if (!identity || !password) {
      setStatus(authStatus, "Informe nome, telefone ou e-mail e a senha.", "error");
      return;
    }

    if (!account) {
      setStatus(authStatus, "Cadastre o cliente antes de tentar entrar.", "error");
      return;
    }

    const identityMatches =
      identity === account.name.toLowerCase() ||
      identity === account.email.toLowerCase() ||
      normalizeDigits(identity) === account.phone;

    if (!identityMatches || password !== account.password) {
      setStatus(authStatus, "Credenciais inválidas.", "error");
      return;
    }

    saveSession(account);
    setStatus(authStatus, "Cliente autenticado com sucesso.", "success");
    window.location.href = "./landingPage.html";
  });

  registerView?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = normalizeText(registerNameInput?.value);
    const email = normalizeText(registerEmailInput?.value);
    const phone = normalizeDigits(registerPhoneInput?.value);
    const password = normalizeText(registerPasswordInput?.value);

    if (!name || !email || !phone || !password) {
      setStatus(authStatus, "Preencha nome, e-mail, telefone e senha.", "error");
      return;
    }

    if (phone.length < 10) {
      setStatus(authStatus, "Informe um telefone válido.", "error");
      return;
    }

    try {
      const createdCustomer = await api.createCliente({
        nome: name,
        email,
        telefone: phone,
        senha: password,
      });

      const account = {
        id: Number(
          createdCustomer?.clienteId ??
            createdCustomer?.ClienteId ??
            createdCustomer?.id ??
            createdCustomer?.Id ??
            0,
        ),
        name,
        email,
        phone,
        password,
        createdAt: new Date().toISOString(),
      };

      saveAccount(account);
      saveSession(account);
      setStatus(authStatus, "Cliente cadastrado com sucesso.", "success");

      if (loginIdentityInput) {
        loginIdentityInput.value = name;
      }

      if (loginPasswordInput) {
        loginPasswordInput.value = "";
      }

      setActiveView(rootElement, "login");
    } catch (error) {
      setStatus(
        authStatus,
        error.message || "Não foi possível cadastrar o cliente.",
        "error",
      );
    }
  });
}