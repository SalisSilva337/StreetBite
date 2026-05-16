import ApiService from "./service.js";
import { normalizeText, normalizeDigits } from "./utils/normalizers.js";
import {
  attachBrazilianPhoneMask,
  attachCepMask,
  attachCpfCnpjMask,
} from "./utils/masks.js";
import {
  validateEmail,
  validatePhone,
  validateCep,
  validateRequiredText,
  validatePassword,
  validateDocument,
} from "./validators.js";
import {
  PAYMENT_METHOD_OPTIONS,
  normalizeEnumValue,
  getEnumDescription,
} from "./enumMappings.js";
import { attachPasswordToggle } from "./components/togglePassword.js";

const STORAGE_KEYS = {
  account: "streetbite-store-account",
  session: "streetbite-store-session",
  recovery: "streetbite-store-recovery",
};

const LOGIN_REDIRECT_DELAY_MS = 1400;

const api = new ApiService();

function setFieldState(inputElement, isValid) {
  if (inputElement) {
    inputElement.classList.toggle("is-valid", isValid);
    inputElement.classList.toggle("is-invalid", !isValid);
  }
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

function focusLoginForm(rootElement, loginIdentityInput) {
  setActiveView(rootElement, "login");

  if (loginIdentityInput) {
    loginIdentityInput.focus();
    loginIdentityInput.select?.();
  }
}

function getAccountStorageValue() {
  return readJson(localStorage, STORAGE_KEYS.account);
}

function saveAccount(account) {
  writeJson(localStorage, STORAGE_KEYS.account, account);
}

function saveSession(account) {
  writeJson(sessionStorage, STORAGE_KEYS.session, {
    shopName: account.shopName,
    email: account.email,
    cep: account.cep,
    authenticatedAt: new Date().toISOString(),
  });
}

function getRecoveryEmail() {
  return normalizeText(sessionStorage.getItem(STORAGE_KEYS.recovery));
}

function setRecoveryEmail(email) {
  const normalizedEmail = normalizeText(email);

  if (!normalizedEmail) {
    sessionStorage.removeItem(STORAGE_KEYS.recovery);
    return;
  }

  sessionStorage.setItem(STORAGE_KEYS.recovery, normalizedEmail);
}

function clearRecoveryEmail() {
  sessionStorage.removeItem(STORAGE_KEYS.recovery);
}

function stripSensitiveQueryParams(paramNames) {
  const currentUrl = new URL(window.location.href);
  let hasChanges = false;

  paramNames.forEach((paramName) => {
    if (currentUrl.searchParams.has(paramName)) {
      currentUrl.searchParams.delete(paramName);
      hasChanges = true;
    }
  });

  if (!hasChanges) {
    return;
  }

  const cleanRelativeUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
  window.history.replaceState({}, "", cleanRelativeUrl);
}

function maskEmail(email) {
  const normalizedEmail = normalizeText(email);

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return "";
  }

  const [localPart, domain] = normalizedEmail.split("@");
  const visible = localPart.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function getStoredShopAccount() {
  const account = getAccountStorageValue();

  if (!account) {
    return null;
  }

  return {
    id: Number(account.id ?? 0),
    shopName: normalizeText(account.shopName),
    email: normalizeText(account.email),
    password: normalizeText(account.password),
    cep: normalizeDigits(account.cep),
    contact: normalizeDigits(account.contact),
    document: normalizeText(account.document),
    paymentMethod: normalizeText(account.paymentMethod),
  };
}

export function getShopPickupCep(fallbackCep = "57010000") {
  const account = getStoredShopAccount();
  return account?.cep || normalizeDigits(fallbackCep) || fallbackCep;
}

export function initializeLandingAuth() {
  const rootElement = document.querySelector("[data-store-auth-root]");
  if (!rootElement) {
    return;
  }

  const authStatus = rootElement.querySelector("[data-auth-status]");
  const tabButtons = rootElement.querySelectorAll("[data-auth-tab]");
  const loginView = rootElement.querySelector('[data-auth-view="login"]');
  const registerView = rootElement.querySelector('[data-auth-view="register"]');
  const loginIdentityInput = rootElement.querySelector("[data-login-identity]");
  const loginPasswordInput = rootElement.querySelector("[data-login-password]");
  const registerShopNameInput = rootElement.querySelector(
    "[data-register-shop-name]",
  );
  const registerEmailInput = rootElement.querySelector("[data-register-email]");
  const registerPasswordInput = rootElement.querySelector(
    "[data-register-password]",
  );
  const registerDocumentInput = rootElement.querySelector(
    "[data-register-document]",
  );
  const registerCepInput = rootElement.querySelector("[data-register-cep]");
  const registerContactInput = rootElement.querySelector(
    "[data-register-contact]",
  );
  const registerPaymentInput = rootElement.querySelector(
    "[data-register-payment]",
  );

  const loginFieldBindings = [
    {
      input: loginIdentityInput,
      validate: validateEmail,
    },
    {
      input: loginPasswordInput,
      validate: validateRequiredText,
    },
  ];

  const registerFieldBindings = [
    {
      input: registerShopNameInput,
      validate: validateRequiredText,
    },
    {
      input: registerEmailInput,
      validate: validateEmail,
    },
    {
      input: registerPasswordInput,
      validate: validatePassword,
    },
    {
      input: registerDocumentInput,
      validate: validateDocument,
    },
    {
      input: registerCepInput,
      validate: validateCep,
    },
    {
      input: registerContactInput,
      validate: validatePhone,
    },
    {
      input: registerPaymentInput,
      validate: (value) => {
        const normalized = normalizeEnumValue(
          normalizeText(value),
          PAYMENT_METHOD_OPTIONS,
        );
        return (
          normalized != null &&
          normalized !== "" &&
          !Number.isNaN(Number(normalized))
        );
      },
    },
  ];

  let loginSubmitting = false;
  let registerSubmitting = false;

  function validateField(binding) {
    if (!binding?.input) {
      return true;
    }

    const isValid = binding.validate(binding.input.value);
    setFieldState(binding.input, isValid);
    return isValid;
  }

  function validateAllFields(bindings) {
    return bindings.every((binding) => validateField(binding));
  }

  loginFieldBindings.forEach((binding) => {
    if (!binding.input) {
      return;
    }

    binding.input.addEventListener("input", () => validateField(binding));
    binding.input.addEventListener("blur", () => validateField(binding));
  });

  registerFieldBindings.forEach((binding) => {
    if (!binding.input) {
      return;
    }

    binding.input.addEventListener("input", () => validateField(binding));
    binding.input.addEventListener("blur", () => validateField(binding));
  });

  attachPasswordToggle(loginPasswordInput);
  attachPasswordToggle(registerPasswordInput);

  stripSensitiveQueryParams(["email"]);

  const url = new URL(window.location.href);
  const initialTab =
    url.searchParams.get("tab") === "register" ? "register" : "login";
  const recoveryEmail = getRecoveryEmail();

  if (loginIdentityInput) {
    loginIdentityInput.value = recoveryEmail || "";
  }

  if (loginIdentityInput) {
    loginIdentityInput.placeholder = "Digite o e-mail cadastrado";
  }

  if (registerContactInput) {
    registerContactInput.placeholder = "(99) 9 9999-9999";
    attachBrazilianPhoneMask(registerContactInput);
  }

  if (registerCepInput) {
    registerCepInput.placeholder = "00000-000";
    attachCepMask(registerCepInput);
  }

  if (registerDocumentInput) {
    registerDocumentInput.placeholder = "000.000.000-00 ou 00.000.000/0000-00";
    attachCpfCnpjMask(registerDocumentInput);
  }

  if (registerPaymentInput) {
    PAYMENT_METHOD_OPTIONS.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.getDescription();
      registerPaymentInput.appendChild(optionElement);
    });
  }

  setActiveView(rootElement, initialTab);
  setStatus(
    authStatus,
    initialTab === "register"
      ? "Preencha os dados para cadastrar a loja."
      : "Informe suas credenciais para entrar.",
  );

  tabButtons.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      const nextView =
        tabButton.dataset.authTab === "register" ? "register" : "login";
      setActiveView(rootElement, nextView);
      setStatus(
        authStatus,
        nextView === "register"
          ? "Preencha os dados para cadastrar a loja."
          : "Informe suas credenciais para entrar.",
      );
    });
  });

  loginView?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (loginSubmitting) {
      return;
    }

    const areFieldsValid = validateAllFields(loginFieldBindings);

    if (!areFieldsValid) {
      setStatus(authStatus, "Corrija os campos em destaque.", "error");
      return;
    }

    const identity = normalizeText(loginIdentityInput?.value);
    const password = normalizeText(loginPasswordInput?.value);
    const account = getStoredShopAccount();

    if (!account) {
      setStatus(authStatus, "Cadastre a loja antes de tentar entrar.", "error");
      return;
    }

    const identityMatches =
      identity.toLowerCase() === account.email.toLowerCase();

    if (!identityMatches || password !== account.password) {
      setStatus(authStatus, "Credenciais inválidas.", "error");
      return;
    }

    loginSubmitting = true;
    saveSession(account);
    setStatus(
      authStatus,
      "Login realizado com sucesso. Abrindo o painel...",
      "success",
    );
    const redirectParam = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    const redirectUrl = redirectParam || "../Pages/streetBite.html";
    window.location.href = redirectUrl;
  });

  const registerSubmitButton = registerView?.querySelector(
    'button[type="submit"]',
  );

  registerView?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (registerSubmitting) {
      return;
    }

    setStatus(authStatus, "");

    const areFieldsValid = validateAllFields(registerFieldBindings);

    if (!areFieldsValid) {
      setStatus(authStatus, "Corrija os campos em destaque.", "error");
      return;
    }

    const shopName = normalizeText(registerShopNameInput?.value);
    const email = normalizeText(registerEmailInput?.value);
    const password = normalizeText(registerPasswordInput?.value);
    const documentValue = normalizeDigits(registerDocumentInput?.value);
    const cep = normalizeDigits(registerCepInput?.value);
    const contact = normalizeDigits(registerContactInput?.value);
    const paymentMethod = normalizeEnumValue(
      registerPaymentInput?.value,
      PAYMENT_METHOD_OPTIONS,
    );

    registerSubmitting = true;
    if (registerSubmitButton) {
      registerSubmitButton.disabled = true;
    }
    setStatus(authStatus, "Cadastrando foodtruck...");

    api
      .createFoodtruck({
        nome: shopName,
        email,
        telefone: contact,
        documento: documentValue,
        cep,
        formaPagamento: paymentMethod,
        senha: password,
      })
      .then((createdFoodtruck) => {
        const account = {
          id: Number(
            createdFoodtruck?.foodtruckId ??
              createdFoodtruck?.FoodtruckId ??
              createdFoodtruck?.id ??
              0,
          ),
          shopName,
          email,
          password,
          document: documentValue,
          cep,
          contact,
          paymentMethod,
          paymentMethodLabel: getEnumDescription(
            PAYMENT_METHOD_OPTIONS,
            paymentMethod,
          ),
          updatedAt: new Date().toISOString(),
        };

        saveAccount(account);
        saveSession(account);
        setStatus(
          authStatus,
          "Foodtruck cadastrado com sucesso. Redirecionando para login...",
          "success",
        );

        window.setTimeout(() => {
          if (loginIdentityInput) {
            loginIdentityInput.value = email;
          }

          if (loginPasswordInput) {
            loginPasswordInput.value = "";
          }

          focusLoginForm(rootElement, loginIdentityInput);
          setStatus(authStatus, "Use suas credenciais para entrar.");
        }, LOGIN_REDIRECT_DELAY_MS);
      })
      .catch((error) => {
        registerSubmitting = false;
        if (registerSubmitButton) {
          registerSubmitButton.disabled = false;
        }
        setStatus(
          authStatus,
          error.message || "Não foi possível cadastrar o foodtruck.",
          "error",
        );
      });
  });
}

export function initializeRecoveryPage() {
  const rootElement = document.querySelector("[data-store-recovery-root]");
  if (!rootElement) {
    return;
  }

  stripSensitiveQueryParams(["email"]);

  const authStatus = rootElement.querySelector("[data-auth-status]");
  const lookupForm = rootElement.querySelector("[data-recovery-lookup]");
  const resetForm = rootElement.querySelector("[data-recovery-reset]");
  const emailInput = rootElement.querySelector("[data-recovery-email]");
  const passwordInput = rootElement.querySelector("[data-recovery-password]");
  const confirmPasswordInput = rootElement.querySelector(
    "[data-recovery-confirm-password]",
  );
  const emailSummary = rootElement.querySelector(
    "[data-recovery-email-summary]",
  );

  const fieldStatusElementsRecovery = {
    email: rootElement.querySelector('[data-field-status="recovery-email"]'),
    password: rootElement.querySelector(
      '[data-field-status="recovery-password"]',
    ),
    confirmPassword: rootElement.querySelector(
      '[data-field-status="recovery-confirm-password"]',
    ),
  };

  const lookupFieldBindings = [
    {
      input: emailInput,
      status: fieldStatusElementsRecovery.email,
      validate: validateEmail,
    },
  ];

  const resetFieldBindings = [
    {
      input: passwordInput,
      status: fieldStatusElementsRecovery.password,
      validate: validatePassword,
    },
    {
      input: confirmPasswordInput,
      status: fieldStatusElementsRecovery.confirmPassword,
      validate: validateRequiredText,
    },
  ];

  let recoverySubmitting = false;

  function validateRecoveryField(binding) {
    if (!binding?.input) {
      return true;
    }

    const isValid = binding.validate(binding.input.value);
    setFieldState(binding.input, isValid);
    return isValid;
  }

  function validateAllRecoveryFields(bindings) {
    return bindings.every((binding) => validateRecoveryField(binding));
  }

  lookupFieldBindings.forEach((binding) => {
    if (!binding.input) {
      return;
    }

    binding.input.addEventListener("input", () =>
      validateRecoveryField(binding),
    );
    binding.input.addEventListener("blur", () =>
      validateRecoveryField(binding),
    );
  });

  resetFieldBindings.forEach((binding) => {
    if (!binding.input) {
      return;
    }

    binding.input.addEventListener("input", () =>
      validateRecoveryField(binding),
    );
    binding.input.addEventListener("blur", () =>
      validateRecoveryField(binding),
    );
  });

  attachPasswordToggle(passwordInput);
  attachPasswordToggle(confirmPasswordInput);

  const storedEmail = getRecoveryEmail();
  const account = getStoredShopAccount();
  const emailToResume = storedEmail;

  if (emailInput && emailToResume) {
    emailInput.value = emailToResume;
  }

  if (emailInput) {
    emailInput.placeholder = "seuemail@exemplo.com";
  }

  function showResetStage(emailValue) {
    if (lookupForm) {
      lookupForm.classList.add("hidden");
    }

    if (resetForm) {
      resetForm.classList.remove("hidden");
    }

    if (emailSummary) {
      emailSummary.textContent = maskEmail(emailValue);
    }

    setStatus(
      authStatus,
      "Conta localizada. Defina uma nova senha.",
      "success",
    );
  }

  if (
    emailToResume &&
    account &&
    emailToResume.toLowerCase() === account.email.toLowerCase()
  ) {
    setRecoveryEmail(emailToResume);
    showResetStage(emailToResume);
  }

  lookupForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const areFieldsValid = validateAllRecoveryFields(lookupFieldBindings);

    if (!areFieldsValid) {
      setStatus(authStatus, "Informe um e-mail válido.", "error");
      return;
    }

    const emailValue = normalizeText(emailInput?.value);
    const currentAccount = getStoredShopAccount();

    if (
      !currentAccount ||
      currentAccount.email.toLowerCase() !== emailValue.toLowerCase()
    ) {
      setStatus(authStatus, "E-mail não encontrado.", "error");
      return;
    }

    setRecoveryEmail(emailValue);
    showResetStage(emailValue);
  });

  resetForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (recoverySubmitting) {
      return;
    }

    const areFieldsValid = validateAllRecoveryFields(resetFieldBindings);

    if (!areFieldsValid) {
      setStatus(authStatus, "Corrija os campos em destaque.", "error");
      return;
    }

    const emailValue = getRecoveryEmail();
    const newPassword = normalizeText(passwordInput?.value);
    const confirmPassword = normalizeText(confirmPasswordInput?.value);
    const currentAccount = getStoredShopAccount();

    if (
      !emailValue ||
      !currentAccount ||
      currentAccount.email.toLowerCase() !== emailValue.toLowerCase()
    ) {
      setStatus(
        authStatus,
        "Nenhuma solicitação válida de recuperação foi encontrada.",
        "error",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus(authStatus, "As senhas não coincidem.", "error");
      return;
    }

    recoverySubmitting = true;

    saveAccount({
      ...currentAccount,
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });

    clearRecoveryEmail();
    setStatus(
      authStatus,
      "Senha atualizada com sucesso. Redirecionando para o login...",
      "success",
    );
    window.location.href = "./store-auth.html?tab=login";
  });
}
