import ApiService from "./service.js";
import loadingProgress from "./components/loadingProgress.js";
import snackbar from "./components/snackbar.js";
import {
  getProductCategoryImage,
  normalizeProductCategory,
} from "./productCategories.js";
import {
  getEnumByValue,
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "./enumMappings.js";
import { getShopPickupCep } from "./storeAuth.js";

(() => {
  const api = new ApiService();

  const gridSection = document.querySelector(".gridSection");
  const openOrderWizard = document.querySelector("#openOrderWizard");

  const wizardSection = document.querySelector("#orderWizard");
  const wizardStepItems = document.querySelector("#orderWizardStepItems");
  const wizardStepLocal = document.querySelector("#orderWizardStepLocal");
  const wizardStepDetails = document.querySelector("#orderWizardStepDetails");
  const wizardBack = document.querySelector("#orderWizardBack");
  const wizardNext = document.querySelector("#orderWizardNext");
  const wizardCancel = document.querySelector("#orderWizardCancel");

  const orderType = document.querySelector("#orderType");
  const addressGroup = document.querySelector("#addressGroup");
  const orderCep = document.querySelector("#orderCep");
  const orderDistrict = document.querySelector("#orderDistrict");
  const orderStreet = document.querySelector("#orderStreet");
  const orderNumber = document.querySelector("#orderNumber");

  const orderPayment = document.querySelector("#orderPayment");
  const orderProduct = document.querySelector("#orderProduct");
  const orderQuantity = document.querySelector("#orderQuantity");
  const addOrderItem = document.querySelector("#addOrderItem");
  const orderCart = document.querySelector("#orderCart");
  const orderSubtotal = document.querySelector("#orderSubtotal");
  const orderCustomer = document.querySelector("#orderCustomer");
  const orderCustomerInfo = document.querySelector("#orderCustomerInfo");

  let currentStep = 1;
  let products = [];
  let customers = [];
  let cartItems = [];
  let orders = [];

  function formatCurrency(value) {
    return Number(value).toFixed(2);
  }

  function formatLocalDateTime(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  function showWizardStep(step) {
    currentStep = step;
    wizardStepItems.classList.toggle("hidden", step !== 1);
    wizardStepLocal.classList.toggle("hidden", step !== 2);
    wizardStepDetails.classList.toggle("hidden", step !== 3);
    wizardBack.disabled = step === 1;
    wizardNext.textContent = step === 3 ? "Criar Pedido" : "Próximo";
  }

  function renderCart() {
    orderCart.innerHTML = "";
    let subtotal = 0;

    cartItems.forEach((item) => {
      subtotal += item.precoUnitario * item.quantidade;

      const cartItem = document.createElement("div");
      cartItem.className = "orderCartItem";

      const text = document.createElement("span");
      text.textContent = `${item.produtoNome} (${item.quantidade}x) - R$${formatCurrency(item.precoUnitario * item.quantidade)}`;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remover";
      remove.addEventListener("click", () => {
        cartItems = cartItems.filter((cartEntry) => cartEntry.uid !== item.uid);
        renderCart();
      });

      cartItem.appendChild(text);
      cartItem.appendChild(remove);
      orderCart.appendChild(cartItem);
    });

    orderSubtotal.textContent = `Subtotal: R$${formatCurrency(subtotal)}`;
  }

  function resetWizardForm() {
    orderType.value = "";
    orderPayment.value = "";
    orderProduct.value = "";
    orderQuantity.value = 1;
    if (orderCustomer) {
      orderCustomer.value = "";
    }
    if (orderCustomerInfo) {
      orderCustomerInfo.textContent =
        "Selecione um cliente já cadastrado para continuar.";
    }
    orderPhone.value = "";
    orderCep.value = "";
    orderDistrict.value = "";
    orderStreet.value = "";
    orderNumber.value = "";
    cartItems = [];
    renderCart();
    showWizardStep(1);
  }

  function openWizard() {
    wizardSection.classList.add("is-open");
    resetWizardForm();
  }

  function closeWizard() {
    wizardSection.classList.remove("is-open");
    resetWizardForm();
  }

  function resolveComandaId(comanda) {
    return comanda?.comandaId ?? comanda?.id ?? comanda?.ComandaId ?? null;
  }

  function resolveOrderStatus(order) {
    return getEnumByValue(ORDER_STATUS_OPTIONS, order?.status ?? order?.Status);
  }

  function getOrderStatusPresentation(status) {
    return status ?? ORDER_STATUS_OPTIONS[0];
  }

  function resolveCustomerName(order) {
    return (
      order?.cliente?.nome ??
      order?.clienteNome ??
      order?.nomeCliente ??
      order?.Cliente?.nome ??
      "Cliente"
    );
  }

  function resolveCustomerId(customer) {
    return customer?.clienteId ?? customer?.id ?? customer?.ClienteId ?? null;
  }

  function resolveCustomerLabel(customer) {
    const name = customer?.nome ?? customer?.Nome ?? "Cliente";
    const phone = customer?.telefone ?? customer?.Telefone ?? "";

    return phone ? `${name} - ${phone}` : name;
  }

  function updateSelectedCustomerInfo(customerId) {
    const selectedCustomer = customers.find(
      (customer) => String(resolveCustomerId(customer)) === String(customerId),
    );

    if (orderPhone) {
      orderPhone.value =
        selectedCustomer?.telefone ?? selectedCustomer?.Telefone ?? "";
    }

    if (orderCustomerInfo) {
      if (!selectedCustomer) {
        orderCustomerInfo.textContent =
          "Selecione um cliente já cadastrado para continuar.";
        return;
      }

      const email = selectedCustomer?.email ?? selectedCustomer?.Email ?? "";
      const phone =
        selectedCustomer?.telefone ?? selectedCustomer?.Telefone ?? "";
      orderCustomerInfo.textContent =
        [email, phone].filter(Boolean).join(" | ") || "Cliente selecionado.";
    }
  }

  async function fillProductOptions() {
    if (products.length) return;

    try {
      const loadedProducts = await api.getProdutos();
      products = Array.isArray(loadedProducts) ? loadedProducts : [];

      products.forEach((product) => {
        const option = document.createElement("option");
        option.value = String(product.id ?? product.produtoId ?? "");
        option.textContent = `${product.nome} - R$${formatCurrency(product.preco)}`;
        orderProduct.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      snackbar.error(error.message || "Não foi possível carregar os produtos.");
      throw error;
    }
  }

  async function fillCustomerOptions() {
    if (customers.length) return;

    try {
      const loadedCustomers = await api.getClientes();
      customers = Array.isArray(loadedCustomers) ? loadedCustomers : [];

      if (orderCustomer) {
        orderCustomer.innerHTML =
          '<option value="" hidden>--- Selecione ---</option>';

        if (!customers.length) {
          const emptyOption = document.createElement("option");
          emptyOption.value = "";
          emptyOption.textContent = "Nenhum cliente cadastrado";
          emptyOption.disabled = true;
          orderCustomer.appendChild(emptyOption);
          return;
        }

        customers.forEach((customer) => {
          const option = document.createElement("option");
          option.value = String(resolveCustomerId(customer) ?? "");
          option.textContent = resolveCustomerLabel(customer);
          orderCustomer.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      snackbar.error(error.message || "Não foi possível carregar os clientes.");
      throw error;
    }
  }

  async function createOrderFromWizard() {
    const customerId = Number(orderCustomer?.value);

    if (!customerId) {
      snackbar.warning("Selecione um cliente cadastrado para criar a comanda.");
      return;
    }

    if (!orderPayment.value) {
      snackbar.warning("Selecione o método de pagamento.");
      return;
    }

    if (!cartItems.length) {
      snackbar.warning("Adicione pelo menos um item ao pedido.");
      return;
    }

    try {
      const createdComanda = await api.createComanda({
        clienteId: customerId,
      });
      let comandaId = resolveComandaId(createdComanda);

      if (!comandaId) {
        const comandas = await api.getComandas();
        const lastComanda = Array.isArray(comandas) ? comandas.at(-1) : null;
        comandaId = resolveComandaId(lastComanda);
      }

      if (!comandaId) {
        snackbar.error("Não foi possível identificar a nova comanda criada.");
        return;
      }

      for (const item of cartItems) {
        await api.addItemComanda({
          comandaId,
          produtoId: item.produtoId,
          observacao: "",
          quantidade: item.quantidade,
        });
      }

      await api.updateComanda(comandaId, {
        status: ORDER_STATUS_OPTIONS[0].value,
        metodoDePagamento: Number(orderPayment.value),
      });

      snackbar.success("Pedido criado com sucesso.");
      closeWizard();
      await window.loadPage("requests");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      snackbar.error(error.message || "Não foi possível criar o pedido.");
    }
  }

  async function loadOrders() {
    try {
      const data = await api.getComandas();
      orders = Array.isArray(data) ? data : [];
      renderOrders();
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      snackbar.error(error.message || "Não foi possível carregar os pedidos.");
    }
  }

  function renderOrders() {
    gridSection.innerHTML = "";

    orders.forEach((order) => {
      const orderId = resolveComandaId(order);
      const statusInfo = getOrderStatusPresentation(resolveOrderStatus(order));
      const customerName = resolveCustomerName(order);

      const card = document.createElement("article");
      card.className = "grid orderCard";

      const header = document.createElement("header");
      header.className = "orderCardHeader";

      const headerCustomer = document.createElement("div");
      headerCustomer.className = "orderHeaderField";
      headerCustomer.innerHTML = `<span class="orderHeaderLabel">Cliente</span><strong>${customerName}</strong>`;

      const headerDate = document.createElement("div");
      headerDate.className = "orderHeaderField";
      headerDate.innerHTML = `<span class="orderHeaderLabel">Pedido Realizado</span><strong>${formatLocalDateTime(
        order.pedidoCriadoEm,
      )}</strong>`;

      const headerTotal = document.createElement("div");
      headerTotal.className = "orderHeaderField";
      headerTotal.innerHTML = `<span class="orderHeaderLabel">Total</span><strong>R$${order.subtotal}</strong>`;

      const headerPayment = document.createElement("div");
      headerPayment.className = "orderHeaderField";
      headerPayment.innerHTML = `<span class="orderHeaderLabel">Pagamento</span><strong>${
        getEnumByValue(
          PAYMENT_METHOD_OPTIONS,
          order.metodoDePagamento,
        )?.getDescription() ?? ""
      }</strong>`;

      const headerCode = document.createElement("div");
      headerCode.className = "orderHeaderField orderHeaderFieldCode";
      headerCode.innerHTML = `<span class="orderHeaderLabel">Pedido Nº</span><strong>${order.codigoDoPedido}</strong>`;

      const expandButton = document.createElement("button");
      expandButton.className = "orderExpandButton";
      expandButton.type = "button";
      expandButton.setAttribute("aria-expanded", "false");
      expandButton.innerHTML = `
        <span class="orderExpandLabel">Ver detalhes</span>
        <span class="orderExpandIcon" aria-hidden="true">▾</span>
      `;

      header.appendChild(headerCustomer);
      header.appendChild(headerDate);
      header.appendChild(headerTotal);
      header.appendChild(headerPayment);
      header.appendChild(headerCode);
      header.appendChild(expandButton);

      const body = document.createElement("div");
      body.className = "orderCardBody";

      const itemsPanel = document.createElement("section");
      itemsPanel.className = "orderItemsPanel";

      const itemsTitle = document.createElement("h3");
      itemsTitle.className = "orderItemsTitle";
      itemsTitle.textContent = "Itens do pedido";
      itemsPanel.appendChild(itemsTitle);

      const itemsScroll = document.createElement("div");
      itemsScroll.className = "orderItemsScroll";

      const orderItems = order.items ?? order.itens ?? [];

      orderItems.forEach((item) => {
        const itemRow = document.createElement("div");
        itemRow.className = "orderItemRow";

        const itemImage = document.createElement("img");
        itemImage.className = "orderItemImage";
        itemImage.src = getProductCategoryImage(
          item.categoria,
          item.produtoNome,
        );
        itemImage.alt = `Imagem do item ${item.produtoNome}`;

        const itemInfo = document.createElement("div");
        itemInfo.className = "orderItemInfo";
        itemInfo.innerHTML = `
          <h4>${item.produtoNome}</h4>
          <p>Categoria: ${normalizeProductCategory(item.categoria)}</p>
          <p>Valor: R$${item.precoUnitario}</p>
          <p>Quantidade: ${item.quantidade}</p>
        `;

        itemRow.appendChild(itemImage);
        itemRow.appendChild(itemInfo);
        itemsScroll.appendChild(itemRow);
      });

      itemsPanel.appendChild(itemsScroll);

      const actionsPanel = document.createElement("aside");
      actionsPanel.className = "orderActionsPanel";

      const status = document.createElement("h2");
      status.className = "preparingOrder";
      status.textContent = statusInfo.getDescription();
      if (statusInfo.className) {
        status.classList.add(statusInfo.className);
      }

      actionsPanel.appendChild(status);

      if (statusInfo.showActions) {
        const actions = document.createElement("div");
        actions.className = "orderPreparingButtonsDiv";

        const orderDeleteButton = document.createElement("button");
        orderDeleteButton.className = "orderPreparingButtons is-secondary";
        orderDeleteButton.type = "button";
        orderDeleteButton.setAttribute("aria-label", "Cancelar pedido");
        orderDeleteButton.textContent = "Cancelar";

        const orderDoneButton = document.createElement("button");
        orderDoneButton.className = "orderPreparingButtons is-primary";
        orderDoneButton.type = "button";
        orderDoneButton.setAttribute(
          "aria-label",
          "Marcar pedido como concluído",
        );
        orderDoneButton.textContent = "Confirmar";

        orderDoneButton.addEventListener("click", async () => {
          if (!orderId) {
            snackbar.error("Não foi possível identificar o pedido.");
            return;
          }

          orderDoneButton.disabled = true;
          orderDeleteButton.disabled = true;

          try {
            await api.confirmComanda(orderId);
            order.status = ORDER_STATUS_OPTIONS[2].value;
            order.Status = ORDER_STATUS_OPTIONS[2].value;
            renderOrders();
            snackbar.success("Pedido marcado como concluído.");
          } catch (error) {
            console.error("Erro ao confirmar pedido:", error);
            snackbar.error(
              error.message || "Não foi possível confirmar o pedido.",
            );
            orderDoneButton.disabled = false;
            orderDeleteButton.disabled = false;
          }
        });

        orderDeleteButton.addEventListener("click", async () => {
          if (!orderId) {
            snackbar.error("Não foi possível identificar o pedido.");
            return;
          }

          orderDoneButton.disabled = true;
          orderDeleteButton.disabled = true;

          try {
            await api.deleteComanda(orderId);
            orders = orders.filter(
              (currentOrder) => resolveComandaId(currentOrder) !== orderId,
            );
            renderOrders();
            snackbar.warning("Pedido cancelado.");
          } catch (error) {
            console.error("Erro ao cancelar pedido:", error);
            snackbar.error(
              error.message || "Não foi possível cancelar o pedido.",
            );
            orderDoneButton.disabled = false;
            orderDeleteButton.disabled = false;
          }
        });

        actions.appendChild(orderDeleteButton);
        actions.appendChild(orderDoneButton);
        actionsPanel.appendChild(actions);
      }

      body.appendChild(itemsPanel);
      body.appendChild(actionsPanel);

      card.appendChild(header);
      card.appendChild(body);
      card.classList.add("is-collapsed");

      expandButton.addEventListener("click", () => {
        const isCollapsed = card.classList.toggle("is-collapsed");
        const isExpanded = !isCollapsed;
        expandButton.setAttribute("aria-expanded", String(isExpanded));

        const buttonLabel = expandButton.querySelector(".orderExpandLabel");
        if (buttonLabel) {
          buttonLabel.textContent = isExpanded
            ? "Ocultar detalhes"
            : "Ver detalhes";
        }
      });

      gridSection.appendChild(card);
    });
  }

  openOrderWizard.addEventListener("click", async () => {
    await Promise.all([fillProductOptions(), fillCustomerOptions()]);
    openWizard();
  });

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

  wizardBack.addEventListener("click", () => {
    if (currentStep > 1) {
      showWizardStep(currentStep - 1);
    }
  });

  wizardNext.addEventListener("click", () => {
    if (currentStep === 1) {
      if (!cartItems.length) {
        snackbar.warning("Adicione pelo menos um item para continuar.");
        return;
      }
      showWizardStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!orderType.value) {
        snackbar.warning("Selecione o tipo de atendimento para continuar.");
        return;
      }
      showWizardStep(3);
      return;
    }

    createOrderFromWizard();
  });

  orderType.addEventListener("change", () => {
    if (orderType.value === "retirada") {
      addressGroup.classList.add("hidden");
      orderCep.value = getShopPickupCep();
      orderDistrict.value = "Loja";
      orderStreet.value = "Loja";
      orderNumber.value = "00";
      return;
    }

    addressGroup.classList.remove("hidden");
    orderCep.value = "";
    orderDistrict.value = "";
    orderStreet.value = "";
    orderNumber.value = "";
  });

  if (orderCustomer) {
    orderCustomer.addEventListener("change", () => {
      updateSelectedCustomerInfo(orderCustomer.value);
    });
  }

  orderCep.addEventListener("change", async () => {
    const cepValue = orderCep.value;
    if (!cepValue || orderType.value === "retirada") return;

    const loadingToken = loadingProgress.start({
      message: "Buscando endereço pelo CEP...",
    });

    try {
      const response = await fetch(`https://opencep.com/v1/${cepValue}`);

      if (!response.ok) {
        throw new Error("CEP inválido.");
      }

      const endereco = await response.json();
      orderStreet.value = endereco.logradouro || "";
      orderDistrict.value = endereco.bairro || "";
    } catch {
      orderStreet.value = "CEP INVÁLIDO";
      orderDistrict.value = "CEP INVÁLIDO";
      snackbar.warning("Não foi possível localizar o CEP informado.");
    } finally {
      loadingProgress.finish(loadingToken);
    }
  });

  addOrderItem.addEventListener("click", () => {
    const productId = Number(orderProduct.value);
    const quantity = Number(orderQuantity.value || 1);

    if (!productId) {
      snackbar.warning("Selecione um item do cardápio.");
      return;
    }

    if (quantity < 1) {
      snackbar.warning("A quantidade deve ser maior que zero.");
      return;
    }

    const selectedProduct = products.find(
      (product) => Number(product.id ?? product.produtoId) === productId,
    );
    if (!selectedProduct) return;

    cartItems.push({
      uid: `${Date.now()}-${Math.random()}`,
      produtoId: productId,
      produtoNome: selectedProduct.nome,
      categoria: selectedProduct.categoria,
      quantidade: quantity,
      precoUnitario: Number(selectedProduct.preco),
      image: getProductCategoryImage(
        selectedProduct.categoria,
        selectedProduct.nome,
      ),
    });

    renderCart();
    snackbar.info("Item adicionado ao pedido.");
  });

  loadOrders();
})();
