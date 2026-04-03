import ApiService from "./service.js";
import snackbar from "./components/snackbar.js";
import {
  getProductCategoryImage,
  normalizeProductCategory,
  serializeProductCategory,
} from "./productCategories.js";

const EDIT_ICON_URL = new URL("../Imgs/icons/editIcon.svg", import.meta.url)
  .href;
const DELETE_ICON_URL = new URL(
  "../Imgs/icons/deleteIcon.svg",
  import.meta.url,
).href;

(() => {
  const api = new ApiService();

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

  function renderProducts(produtos) {
    gridSection.innerHTML = "";

    produtos.forEach((produto) => {
      const grid = document.createElement("div");
      const productName = document.createElement("h2");
      const itemImageDiv = document.createElement("div");
      const itemImage = document.createElement("img");
      const productCategory = document.createElement("h2");
      const productPrice = document.createElement("h3");
      const editButton = document.createElement("button");
      const editImg = document.createElement("img");
      const deleteButton = document.createElement("button");
      const deleteImg = document.createElement("img");
      const buttonsGridDiv = document.createElement("div");

      grid.className = "grid";
      itemImageDiv.className = "itemImage";
      editButton.className = "editButton";
      deleteButton.className = "editButton";

      buttonsGridDiv.style.display = "flex";
      buttonsGridDiv.style.gap = "10px";
      productName.textContent = produto.nome;
      productCategory.textContent = normalizeProductCategory(produto.categoria);
      productPrice.textContent = "R$" + produto.preco;

      itemImage.src = getProductCategoryImage(produto.categoria, produto.nome);
      itemImage.alt = `Imagem do item ${productName.textContent}`;

      editImg.src = EDIT_ICON_URL;
      editImg.alt = "Editar item";

      deleteImg.src = DELETE_ICON_URL;
      deleteImg.alt = "Excluir item";
      editButton.setAttribute(
        "aria-label",
        `Editar ${productName.textContent}`,
      );
      deleteButton.setAttribute(
        "aria-label",
        `Excluir ${productName.textContent}`,
      );

      grid.appendChild(productName);
      itemImageDiv.appendChild(itemImage);
      grid.appendChild(itemImageDiv);
      grid.appendChild(productCategory);
      grid.appendChild(productPrice);
      buttonsGridDiv.appendChild(editButton);
      buttonsGridDiv.appendChild(deleteButton);
      editButton.appendChild(editImg);
      deleteButton.appendChild(deleteImg);
      grid.appendChild(buttonsGridDiv);
      gridSection.appendChild(grid);

      grid.style.animation = "gridAnim .5s";

      deleteButton.addEventListener("click", async () => {
        const produtoId = produto.id ?? produto.produtoId;

        if (produtoId == null) {
          snackbar.warning("Não foi possível identificar o item selecionado.");
          return;
        }

        try {
          await api.deleteProduto(produtoId);
          grid.remove();
          snackbar.success("Item removido com sucesso.");
        } catch (error) {
          console.error("Erro ao excluir produto:", error);
          snackbar.error(error.message || "Não foi possível excluir o item.");
        }
      });

      editButton.addEventListener("click", () => {
        openWizard("edit", produto);
      });
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

  loadProducts();
})();
