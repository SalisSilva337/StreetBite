import { normalizeDigits } from "./normalizers.js";

export function formatBrazilianPhone(value) {
  const digits = normalizeDigits(value).slice(0, 11);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function attachBrazilianPhoneMask(inputElement) {
  if (!inputElement) {
    return;
  }

  const applyMask = () => {
    inputElement.value = formatBrazilianPhone(inputElement.value);
  };

  inputElement.addEventListener("input", applyMask);
  inputElement.addEventListener("blur", applyMask);
  applyMask();
}

export function formatCep(value) {
  const digits = normalizeDigits(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function attachCepMask(inputElement) {
  if (!inputElement) {
    return;
  }

  const applyMask = () => {
    inputElement.value = formatCep(inputElement.value);
  };

  inputElement.addEventListener("input", applyMask);
  inputElement.addEventListener("blur", applyMask);
  applyMask();
}

export function formatCpfCnpj(value) {
  const digits = normalizeDigits(value).slice(0, 14);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  if (digits.length <= 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  if (digits.length <= 13) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function attachCpfCnpjMask(inputElement) {
  if (!inputElement) {
    return;
  }

  const applyMask = () => {
    inputElement.value = formatCpfCnpj(inputElement.value);
  };

  inputElement.addEventListener("input", applyMask);
  inputElement.addEventListener("blur", applyMask);
  applyMask();
}
