import ApiService from "./service.js";
import { normalizeText, normalizeDigits } from "./utils/normalizers.js";
import { attachBrazilianPhoneMask, attachCepMask } from "./utils/masks.js";
import {
  validateEmail,
  validatePhone,
  validateCep,
  validateNumber,
  validateRequiredText,
} from "./validators.js";

const api = new ApiService();

function setFieldState(fieldStatusElement, inputElement, isValid) {
  if (fieldStatusElement) {
    fieldStatusElement.textContent = isValid ? "✓" : "✕";
    fieldStatusElement.classList.toggle("is-valid", isValid);
    fieldStatusElement.classList.toggle("is-invalid", !isValid);
  }

  if (inputElement) {
    inputElement.classList.toggle("is-valid", isValid);
    inputElement.classList.toggle("is-invalid", !isValid);
  }
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

export function initializeCustomerAuth() {
  const rootElement = document.querySelector("[data-customer-auth-root]");
  if (!rootElement) {
    return;
  }

  const authStatus = rootElement.querySelector("[data-auth-status]");
  const registerView = rootElement.querySelector('[data-auth-view="register"]');
  const registerNameInput = rootElement.querySelector("[data-register-name]");
  const registerEmailInput = rootElement.querySelector("[data-register-email]");
  const registerPhoneInput = rootElement.querySelector("[data-register-phone]");
  const registerCepInput = rootElement.querySelector("[data-register-cep]");
  const registerStreetInput = rootElement.querySelector(
    "[data-register-street]",
  );
  const registerNumberInput = rootElement.querySelector(
    "[data-register-number]",
  );
  const backButton = rootElement.querySelector("[data-customer-back]");

  const fieldStatusElements = {
    name: rootElement.querySelector('[data-field-status="name"]'),
    email: rootElement.querySelector('[data-field-status="email"]'),
    phone: rootElement.querySelector('[data-field-status="phone"]'),
    cep: rootElement.querySelector('[data-field-status="cep"]'),
    street: rootElement.querySelector('[data-field-status="street"]'),
    number: rootElement.querySelector('[data-field-status="number"]'),
  };

  const submitButton = rootElement.querySelector(".auth-button[type='submit']");

  const fieldBindings = [
    {
      input: registerNameInput,
      status: fieldStatusElements.name,
      validate: validateRequiredText,
    },
    {
      input: registerEmailInput,
      status: fieldStatusElements.email,
      validate: validateEmail,
    },
    {
      input: registerPhoneInput,
      status: fieldStatusElements.phone,
      validate: validatePhone,
    },
    {
      input: registerCepInput,
      status: fieldStatusElements.cep,
      validate: validateCep,
    },
    {
      input: registerStreetInput,
      status: fieldStatusElements.street,
      validate: validateRequiredText,
    },
    {
      input: registerNumberInput,
      status: fieldStatusElements.number,
      validate: validateNumber,
    },
  ];

  function validateField(binding) {
    if (!binding?.input) {
      return true;
    }

    const isValid = binding.validate(binding.input.value);
    setFieldState(binding.status, binding.input, isValid);
    return isValid;
  }

  function validateAllFields() {
    return fieldBindings.every((binding) => validateField(binding));
  }

  let customerRegistered = false;

  function goBackToPreviousPage() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "pedidos.html";
  }

  backButton?.addEventListener("click", goBackToPreviousPage);

  if (registerPhoneInput) {
    registerPhoneInput.placeholder = "(99) 9 9999-9999";
    attachBrazilianPhoneMask(registerPhoneInput);
  }

  if (registerCepInput) {
    registerCepInput.placeholder = "00000-000";
    attachCepMask(registerCepInput);
  }

  if (registerNameInput) {
    registerNameInput.value = "";
  }

  if (registerEmailInput) {
    registerEmailInput.value = "";
  }

  if (registerStreetInput) {
    registerStreetInput.value = "";
  }

  if (registerNumberInput) {
    registerNumberInput.value = "";
  }

  setStatus(authStatus, "Cadastre o cliente para validar o nome na comanda.");

  fieldBindings.forEach((binding) => {
    if (!binding.input) {
      return;
    }

    binding.input.addEventListener("input", () => validateField(binding));
    binding.input.addEventListener("blur", () => validateField(binding));
    validateField(binding);
  });

  registerView?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (customerRegistered) {
      goBackToPreviousPage();
      return;
    }

    const areFieldsValid = validateAllFields();

    if (!areFieldsValid) {
      setStatus(authStatus, "Corrija os campos marcados com X.", "error");
      return;
    }

    const name = normalizeText(registerNameInput?.value);
    const email = normalizeText(registerEmailInput?.value);
    const phone = normalizeDigits(registerPhoneInput?.value);
    const cep = normalizeDigits(registerCepInput?.value);
    const street = normalizeText(registerStreetInput?.value);
    const number = normalizeDigits(registerNumberInput?.value);

    try {
      const createdCustomer = await api.createCliente({
        nome: name,
        email,
        telefone: phone,
        cep,
        street,
        number,
      });

      setStatus(authStatus, "Cliente cadastrado com sucesso.", "success");

      if (submitButton) {
        submitButton.textContent = "Voltar para a página anterior";
        submitButton.disabled = false;
      }

      customerRegistered = true;
    } catch (error) {
      setStatus(
        authStatus,
        error.message || "Não foi possível cadastrar o cliente.",
        "error",
      );
    }
  });
}
