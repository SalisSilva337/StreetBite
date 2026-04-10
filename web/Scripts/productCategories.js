import {
  PRODUCT_CATEGORY_OPTIONS,
  getEnumByValue,
  normalizeEnumValue,
} from './enumMappings.js';

const BIG_SB_IMAGE_URL = new URL(
  "../Imgs/images/items/bigSB.png",
  import.meta.url,
).href;
const BIG_SB_BACON_IMAGE_URL = new URL(
  "../Imgs/images/items/bigSBbacon.png",
  import.meta.url,
).href;
const BIG_SB_CHEDDAR_IMAGE_URL = new URL(
  "../Imgs/images/items/bigSBCheddar.png",
  import.meta.url,
).href;
const CHEESE_CLASSIC_IMAGE_URL = new URL(
  "../Imgs/images/items/cheeseClassic.png",
  import.meta.url,
).href;

function normalizeProductCategory(category) {
  return (
    getEnumByValue(PRODUCT_CATEGORY_OPTIONS, category)?.getDescription() ?? ''
  );
}

function serializeProductCategory(category) {
  const value = normalizeEnumValue(category, PRODUCT_CATEGORY_OPTIONS);
  if (typeof value === 'number') {
    return value;
  }

  if (category == null || category === '') {
    return category;
  }

  throw new Error(`Categoria de produto inválida: ${category}`);
}

function getProductCategoryImage(category, nome = '') {
  const normalizedName = String(nome || '')
    .trim()
    .toLowerCase();
  if (normalizedName === 'big sb') return BIG_SB_IMAGE_URL;
  if (normalizedName === 'big sb bacon')
    return BIG_SB_BACON_IMAGE_URL;
  if (normalizedName === 'big sb cheddar')
    return BIG_SB_CHEDDAR_IMAGE_URL;
  if (normalizedName === 'classic sb') return CHEESE_CLASSIC_IMAGE_URL;

  return (
    getEnumByValue(PRODUCT_CATEGORY_OPTIONS, category)?.getImage() ??
    PRODUCT_CATEGORY_OPTIONS[3].getImage()
  );
}

export {
  PRODUCT_CATEGORY_OPTIONS,
  getProductCategoryImage,
  normalizeProductCategory,
  serializeProductCategory,
};
