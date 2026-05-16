import { normalizeText, normalizeDigits } from "./utils/normalizers.js";

export function validateEmail(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function validatePhone(value) {
  const digits = normalizeDigits(value);
  return digits.length === 10 || digits.length === 11;
}

export function validateCep(value) {
  return normalizeDigits(value).length === 8;
}

export function validateNumber(value) {
  return normalizeDigits(value).length > 0;
}

export function validateRequiredText(value) {
  return normalizeText(value).length > 0;
}

export function validatePassword(value) {
  return normalizeText(value).length >= 6;
}

function calculateCpfDigit(numbers, factor) {
  let sum = 0;

  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i] * (factor - i);
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function validateCpf(value) {
  const digits = normalizeDigits(value);

  if (digits.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const numbers = digits.split("").map(Number);
  const firstDigit = calculateCpfDigit(numbers.slice(0, 9), 10);

  if (firstDigit !== numbers[9]) {
    return false;
  }

  const secondDigit = calculateCpfDigit(numbers.slice(0, 10), 11);
  return secondDigit === numbers[10];
}

function calculateCnpjDigit(numbers, baseWeights) {
  let sum = 0;

  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i] * baseWeights[i];
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function validateCnpj(value) {
  const digits = normalizeDigits(value);

  if (digits.length !== 14) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  const numbers = digits.split("").map(Number);
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const firstDigit = calculateCnpjDigit(numbers.slice(0, 12), firstWeights);

  if (firstDigit !== numbers[12]) {
    return false;
  }

  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondDigit = calculateCnpjDigit(numbers.slice(0, 13), secondWeights);
  return secondDigit === numbers[13];
}

export function validateDocument(value) {
  const digits = normalizeDigits(value);

  if (digits.length === 11) {
    return validateCpf(value);
  }

  if (digits.length === 14) {
    return validateCnpj(value);
  }

  return false;
}
