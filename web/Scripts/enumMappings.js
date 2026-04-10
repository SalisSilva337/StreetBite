class EnumValue {
  constructor(value, description, aliases = []) {
    this.value = value;
    this.description = description;
    this.aliases = aliases;
  }

  getDescription() {
    return this.description;
  }

  matches(value) {
    if (value == null || value === "") {
      return false;
    }

    if (value === this.value) {
      return true;
    }

    const numericValue = Number(value);
    if (Number.isInteger(numericValue) && numericValue === this.value) {
      return true;
    }

    const normalizedValue = normalizeText(value);
    return (
      normalizeText(this.description) === normalizedValue ||
      this.aliases.some((alias) => normalizeText(alias) === normalizedValue)
    );
  }
}

class ProductCategory extends EnumValue {
  constructor(value, description, image, aliases = []) {
    super(value, description, aliases);
    this.image = image;
  }

  getImage() {
    return this.image;
  }
}

class PaymentMethod extends EnumValue {}

class OrderStatus extends EnumValue {
  constructor(
    value,
    description,
    className = "",
    showActions = true,
    aliases = [],
  ) {
    super(value, description, aliases);
    this.className = className;
    this.showActions = showActions;
  }
}

const ACCOMPANIMENT_IMAGE_URL = new URL(
  "../Imgs/images/eachCategory/acompanhamento.jpg",
  import.meta.url,
).href;
const DRINK_IMAGE_URL = new URL(
  "../Imgs/images/eachCategory/bebida.jpg",
  import.meta.url,
).href;
const COMBO_IMAGE_URL = new URL(
  "../Imgs/images/eachCategory/combo.jpg",
  import.meta.url,
).href;
const SNACK_IMAGE_URL = new URL(
  "../Imgs/images/eachCategory/lanche.jpg",
  import.meta.url,
).href;

const PRODUCT_CATEGORY_OPTIONS = [
  new ProductCategory(0, "Acompanhamento", ACCOMPANIMENT_IMAGE_URL),
  new ProductCategory(1, "Bebida", DRINK_IMAGE_URL),
  new ProductCategory(2, "Combo", COMBO_IMAGE_URL),
  new ProductCategory(3, "Lanche", SNACK_IMAGE_URL),
];

const PAYMENT_METHOD_OPTIONS = [
  new PaymentMethod(0, "Crédito"),
  new PaymentMethod(1, "Débito"),
  new PaymentMethod(2, "Dinheiro"),
  new PaymentMethod(3, "PIX"),
];

const ORDER_STATUS_OPTIONS = [
  new OrderStatus(0, "Pedido sendo preparado...", "", true, ["Pendente"]),
  new OrderStatus(1, "Pedido em produção", "", true, [
    "EmProducao",
    "Em Produção",
    "Em_Produção",
  ]),
  new OrderStatus(2, "Pedido concluído", "statusDone", false, ["Finalizado"]),
];

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getEnumByValue(options, value) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return options.find((option) => option.value === value) ?? null;
  }

  const numericValue = Number(value);
  if (Number.isInteger(numericValue)) {
    return options.find((option) => option.value === numericValue) ?? null;
  }

  return options.find((option) => option.matches(value)) ?? null;
}

function normalizeEnumValue(value, options) {
  return getEnumByValue(options, value)?.value ?? value;
}

function getEnumDescription(options, value, fallback = "") {
  return getEnumByValue(options, value)?.getDescription() ?? fallback;
}

export {
  EnumValue,
  OrderStatus,
  PaymentMethod,
  ProductCategory,
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
  getEnumByValue,
  getEnumDescription,
  normalizeEnumValue,
};
