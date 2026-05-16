export function normalizeText(value) {
  return String(value ?? "").trim();
}

export function normalizeDigits(value) {
  return normalizeText(value).replace(/\D/g, "");
}
