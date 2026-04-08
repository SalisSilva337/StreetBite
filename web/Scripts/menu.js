import ApiService from "./service.js";
import snackbar from "./components/snackbar.js";
import {
  getProductCategoryImage,
  normalizeProductCategory,
  serializeProductCategory,
} from "./productCategories.js";

const EDIT_ICON_URL = new URL("../Imgs/icons/editIcon.svg", import.meta.url)
  .href;
const DELETE_ICON_URL = new URL("../Imgs/icons/deleteIcon.svg", import.meta.url)
  .href;

(() => {
  const api = new ApiService();
  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const createItemButton = document.querySelector(".createItem");
  const gridSection = document.querySelector(".gridSection");

  const wizardSection = document.querySelector("#itemWizard");
  const wizardTitle = document.querySelector("#wizardTitle");
  const wizardSubtitle = document.querySelector("#wizardSubtitle");
  const wizardStepItem = document.querySelector("#wizardStepItem");
  const wizardNext = document.querySelector("#wizardNext");
  const wizardCancel = document.querySelector("#wizardCancel");

  const inputName = document.querySelector("#inputName");
  const selectCategory = document.querySelector("#selectCategory");
  const inputPrice = document.querySelector("#inputPrice");
  const inputDesc = document.querySelector("#inputDesc");

  const inputFile = document.querySelector("#files");
  const imgArea = document.querySelector(".imgDivModal");
  const imageImg = document.querySelector("#imageImg");

  let editMode = false;
  let editingItemId = null;
  let currentProducts = [];
  let lastItemsPerView = getItemsPerView();
  let resizeTimeoutId = null;

  const preferredCategoryOrder = [
    "Lanche",
    "Bebida",
    "Acompanhamento",
    "Combo",
    "Sem categoria",
  ];

  function getItemsPerView() {
    if (window.matchMedia("(max-width: 700px)").matches) {
      return 1;
    }

    if (window.matchMedia("(max-width: 1120px)").matches) {
      return 2;
    }

    return 3;
  }

  function groupProductsByCategory(produtos) {
    const grouped = new Map();

    produtos.forEach((produto) => {
      const categoryName =
        normalizeProductCategory(produto.categoria) || "Sem categoria";

      if (!grouped.has(categoryName)) {
        grouped.set(categoryName, []);
      }

      grouped.get(categoryName).push(produto);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => {
        const indexA = preferredCategoryOrder.indexOf(a[0]);
        const indexB = preferredCategoryOrder.indexOf(b[0]);
        const weightA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
        const weightB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

        if (weightA !== weightB) {
          return weightA - weightB;
        }

        return a[0].localeCompare(b[0], "pt-BR");
      })
      .map(([category, items]) => ({ category, items }));
  }

  function resetWizardForm() {
    inputName.value = "";
    selectCategory.value = "3";
    inputPrice.value = "";
    inputDesc.value = "";
    imageImg.src = "";
  }

  function openWizard(mode, produto = null) {
    editMode = mode === "edit";
    editingItemId = produto?.id ?? produto?.produtoId ?? null;

    if (editMode && produto) {
      wizardTitle.textContent = "Assistente de Edição de Item";
      wizardSubtitle.textContent = "Atualize os dados do item selecionado.";
      inputName.value = produto.nome ?? "";
      selectCategory.value = String(
        serializeProductCategory(produto.categoria) ?? 3,
      );
      inputPrice.value = produto.preco ?? "";
      inputDesc.value = produto.descricao ?? "";
      wizardNext.textContent = "Salvar Edição";
    } else {
      wizardTitle.textContent = "Assistente de Criação de Item";
      wizardSubtitle.textContent =
        "Preencha os dados para cadastrar um novo item no cardápio.";
      resetWizardForm();
      wizardNext.textContent = "Criar Item";
    }

    wizardStepItem.classList.remove("hidden");
    wizardSection.classList.add("is-open");
  }

  function closeWizard() {
    wizardSection.classList.remove("is-open");
    editMode = false;
    editingItemId = null;
    resetWizardForm();
    wizardStepItem.classList.remove("hidden");
    wizardNext.textContent = "Criar Item";
  }

  function createProductCard(produto, index) {
    const grid = document.createElement("div");
    const productName = document.createElement("h2");
    const itemImageDiv = document.createElement("div");
    const itemImage = document.createElement("img");
    const productPrice = document.createElement("h3");
    const productCategory = document.createElement("p");
    const editButton = document.createElement("button");
    const editImg = document.createElement("img");
    const deleteButton = document.createElement("button");
    const deleteImg = document.createElement("img");
    const buttonsGridDiv = document.createElement("div");
    const descriptionDetails = document.createElement("details");
    const descriptionSummary = document.createElement("summary");
    const descriptionText = document.createElement("p");
    const produtoId = produto.id ?? produto.produtoId ?? `item-${index}`;
    const descriptionId = `item-desc-${produtoId}`;

    grid.className = "grid";
    itemImageDiv.className = "itemImage";
    editButton.className = "editButton";
    deleteButton.className = "editButton";
    editButton.classList.add("gridEditButton");
    deleteButton.classList.add("gridDeleteButton");
    productName.className = "productName";
    productPrice.className = "productPrice";
    productCategory.className = "productCategory";
    buttonsGridDiv.className = "gridActions";
    descriptionDetails.className = "productDescription";
    descriptionText.className = "productDescriptionText";
    descriptionDetails.dataset.itemId = String(produtoId);

    productName.textContent = produto.nome;
    productPrice.textContent = currencyFormatter.format(
      Number(produto.preco ?? 0),
    );
    productCategory.textContent =
      normalizeProductCategory(produto.categoria) || "Sem categoria";

    itemImage.src = getProductCategoryImage(produto.categoria, produto.nome);
    itemImage.alt = `Imagem do item ${productName.textContent}`;
    itemImage.loading = "lazy";

    editImg.src = EDIT_ICON_URL;
    editImg.alt = "Editar item";

    deleteImg.src = DELETE_ICON_URL;
    deleteImg.alt = "Excluir item";
    editButton.setAttribute("aria-label", `Editar ${productName.textContent}`);
    deleteButton.setAttribute(
      "aria-label",
      `Excluir ${productName.textContent}`,
    );

    descriptionSummary.textContent = "Descrição";
    descriptionSummary.setAttribute("role", "button");
    descriptionSummary.setAttribute("aria-controls", descriptionId);
    descriptionSummary.setAttribute("aria-expanded", "false");
    descriptionText.id = descriptionId;
    descriptionText.textContent =
      produto.descricao?.trim() || "Sem descrição cadastrada.";

    descriptionDetails.addEventListener("toggle", () => {
      descriptionSummary.setAttribute(
        "aria-expanded",
        String(descriptionDetails.open),
      );
    });

    grid.appendChild(productName);
    itemImageDiv.appendChild(itemImage);
    grid.appendChild(itemImageDiv);
    grid.appendChild(productPrice);
    grid.appendChild(productCategory);
    descriptionDetails.appendChild(descriptionSummary);
    descriptionDetails.appendChild(descriptionText);
    grid.appendChild(descriptionDetails);
    buttonsGridDiv.appendChild(editButton);
    buttonsGridDiv.appendChild(deleteButton);
    editButton.appendChild(editImg);
    editButton.appendChild(document.createTextNode("Editar item"));
    deleteButton.appendChild(deleteImg);
    grid.appendChild(buttonsGridDiv);

    grid.style.animation = "gridAnim .5s";

    deleteButton.addEventListener("click", async () => {
      const produtoId = produto.id ?? produto.produtoId;

      if (produtoId == null) {
        snackbar.warning("Não foi possível identificar o item selecionado.");
        return;
      }

      try {
        await api.deleteProduto(produtoId);
        snackbar.success("Item removido com sucesso.");
        await loadProducts();
      } catch (error) {
        snackbar.error(error.message || "Não foi possível excluir o item.");
      }
    });

    editButton.addEventListener("click", () => {
      openWizard("edit", produto);
    });

    return grid;
  }

  function createCategoryCarousel(categoryName, produtos) {
    const itemsPerView = getItemsPerView();
    const totalPages = Math.ceil(produtos.length / itemsPerView);
    let currentPage = 0;

    const categorySection = document.createElement("article");
    const categoryHeader = document.createElement("header");
    const categoryTitle = document.createElement("h2");
    const categoryCounter = document.createElement("p");
    const navActions = document.createElement("div");
    const prevButton = document.createElement("button");
    const nextButton = document.createElement("button");
    const viewport = document.createElement("div");
    const track = document.createElement("div");

    categorySection.className = "categoryCarousel";
    categoryHeader.className = "categoryHeader";
    categoryTitle.className = "categoryTitle";
    categoryCounter.className = "categoryCounter";
    navActions.className = "carouselNav";
    prevButton.className = "carouselNavButton";
    nextButton.className = "carouselNavButton";
    viewport.className = "carouselViewport";
    track.className = "carouselTrack";

    categoryTitle.textContent = categoryName;
    categoryCounter.textContent = `${produtos.length} item${produtos.length > 1 ? "s" : ""}`;

    prevButton.type = "button";
    nextButton.type = "button";
    prevButton.setAttribute(
      "aria-label",
      `Categoria ${categoryName}: voltar itens`,
    );
    nextButton.setAttribute(
      "aria-label",
      `Categoria ${categoryName}: avançar itens`,
    );
    prevButton.textContent = "‹";
    nextButton.textContent = "›";

    for (let i = 0; i < totalPages; i += 1) {
      const page = document.createElement("div");
      page.className = "carouselPage";

      const pageItems = produtos.slice(
        i * itemsPerView,
        (i + 1) * itemsPerView,
      );
      pageItems.forEach((produto, index) => {
        page.appendChild(createProductCard(produto, i * itemsPerView + index));
      });

      track.appendChild(page);
    }

    const updateCarousel = () => {
      track.style.transform = `translateX(-${currentPage * 100}%)`;

      if (totalPages <= 1) {
        prevButton.disabled = true;
        nextButton.disabled = true;
        return;
      }

      prevButton.disabled = currentPage === 0;
      nextButton.disabled = false;
    };

    prevButton.addEventListener("click", () => {
      if (totalPages <= 1 || currentPage === 0) {
        return;
      }

      currentPage -= 1;
      updateCarousel();
    });

    nextButton.addEventListener("click", () => {
      if (totalPages <= 1) {
        return;
      }

      currentPage = (currentPage + 1) % totalPages;
      updateCarousel();
    });

    navActions.appendChild(prevButton);
    navActions.appendChild(nextButton);
    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(categoryCounter);
    categoryHeader.appendChild(navActions);
    viewport.appendChild(track);
    categorySection.appendChild(categoryHeader);
    categorySection.appendChild(viewport);

    updateCarousel();
    return categorySection;
  }

  function renderProducts(produtos) {
    currentProducts = Array.isArray(produtos) ? produtos : [];
    gridSection.innerHTML = "";

    if (currentProducts.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "gridSectionEmpty";
      emptyState.textContent = "Nenhum item cadastrado no cardápio.";
      gridSection.appendChild(emptyState);
      return;
    }

    const groupedProducts = groupProductsByCategory(currentProducts);
    groupedProducts.forEach(({ category, items }) => {
      gridSection.appendChild(createCategoryCarousel(category, items));
    });
  }

  async function loadProducts() {
    try {
      const produtos = await api.getProdutos();
      renderProducts(Array.isArray(produtos) ? produtos : []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      snackbar.error(error.message || "Não foi possível carregar os produtos.");
    }
  }

  async function saveItem() {
    const nome = inputName.value.trim();
    const preco = inputPrice.value;
    const categoria = selectCategory.value;

    if (!nome || !preco || !categoria) {
      snackbar.warning("Preencha nome, categoria e preço antes de continuar.");
      return;
    }

    const payload = {
      nome,
      preco: Number(preco),
      categoria: serializeProductCategory(categoria),
      descricao: inputDesc.value.trim() || null,
    };

    try {
      if (editMode && editingItemId != null) {
        await api.updateProduto(editingItemId, payload);
        snackbar.success("Item atualizado com sucesso.");
      } else {
        await api.createProduto(payload);
        snackbar.success("Item criado com sucesso.");
      }

      closeWizard();
      await window.loadPage("menu");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      snackbar.error(error.message || "Não foi possível salvar o item.");
    }
  }

  createItemButton.addEventListener("click", () => openWizard("create"));
  wizardCancel.addEventListener("click", closeWizard);

  wizardSection.addEventListener("click", (e) => {
    if (e.target === wizardSection) {
      closeWizard();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && wizardSection.classList.contains("is-open")) {
      closeWizard();
    }
  });

  wizardNext.addEventListener("click", saveItem);

  inputFile.addEventListener("change", function () {
    const image = this.files[0];
    if (!image) return;

    const reader = new FileReader();
    reader.onload = () => {
      const allImg = imgArea.querySelectorAll("img");
      allImg.forEach((item) => item.remove());
      const imgUrl = reader.result;
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = "Pré-visualização da imagem selecionada";
      imgArea.appendChild(img);
      imgArea.dataset.img = image.name;
    };
    reader.readAsDataURL(image);
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimeoutId);
    resizeTimeoutId = window.setTimeout(() => {
      const nextItemsPerView = getItemsPerView();

      if (nextItemsPerView === lastItemsPerView) {
        return;
      }

      lastItemsPerView = nextItemsPerView;
      renderProducts(currentProducts);
    }, 170);
  });

  loadProducts();
})();
