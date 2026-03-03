let grid = document.querySelectorAll(".grid");
let gridSection = document.querySelector(".gridSection");

const optionsGET = {
  method: "GET",
};

fetch("http://localhost:8080/api/v1/comandas", optionsGET)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    for (let index = 0; index < data.length; index++) {
      // Criação da estrutura de DOM
      const gridDiv = document.createElement("div");
      gridDiv.classList.add("grid");

      const clientDataDiv = document.createElement("div");
      clientDataDiv.classList.add("clientDataDiv");

      const nome = document.createElement("h3");
      fetch("http://localhost:8080/api/v1/clientes", optionsGET)
        .then((response) => response.json())
        .then((clientes) => {
          for (let index = 0; index < clientes.length; index++) {
            console.log(clientes);

            nome.textContent = "Nome: " + clientes[index].nome;
          }
        });
      clientDataDiv.appendChild(nome);

      const numeroPedido = document.createElement("h3");
      numeroPedido.textContent = "Nº do Pedido: " + data[index].codigoDoPedido;
      clientDataDiv.appendChild(numeroPedido);

      const metodoPagamento = document.createElement("h3");
      metodoPagamento.textContent =
        "Método De Pagamento: " + data[index].metodoDePagamento;
      clientDataDiv.appendChild(metodoPagamento);

      const subtotal = document.createElement("h3");
      subtotal.textContent = "Subtotal: R$" + data[index].subtotal;
      clientDataDiv.appendChild(subtotal);

      const pedidoCriadoEm = document.createElement("h3");
      pedidoCriadoEm.textContent = "Data: " + data[index].pedidoCriadoEm;
      clientDataDiv.appendChild(pedidoCriadoEm);

      gridDiv.appendChild(clientDataDiv);

      const orderSettingsDiv = document.createElement("div");
      orderSettingsDiv.classList.add("orderSettingsDiv");

      const labelItemsTable = document.createElement("div");
      labelItemsTable.classList.add("labelItemsTable");

      const h2ItensPedido = document.createElement("h2");
      h2ItensPedido.textContent = "Itens Pedidos";
      labelItemsTable.appendChild(h2ItensPedido);

      orderSettingsDiv.appendChild(labelItemsTable);

      const orderItemsTable = document.createElement("div");

      data[index].items.forEach((item) => {
        const orderItemsDiv = document.createElement("div");

        orderItemsDiv.id = "orderItemsDiv";
        const orderItemsName = document.createElement("h3");
        const orderItemsCategory = document.createElement("h4");
        const orderItemsPrice = document.createElement("h4");
        const orderItemsQuantity = document.createElement("h4");
        const orderItemsImg = document.createElement("img");
        console.log(item);
        orderItemsName.textContent = "Item: " + item.produtoNome;
        orderItemsCategory.textContent = item.categoria;
        orderItemsPrice.textContent = "Valor: R$" + item.precoUnitario;
        orderItemsQuantity.textContent = "Quantidade: " + item.quantidade;
        if (orderItemsCategory.textContent == "BEBIDA") {
          orderItemsImg.src = "../Imgs/images/eachCategory/bebida.jpg";
        } else if (orderItemsCategory.textContent == "ACOMPANHAMENTO") {
          orderItemsImg.src =
            "../Imgs/images/eachCategory/acompanhamento.jpg";
        } else if (orderItemsCategory.textContent == "LANCHE") {
          orderItemsImg.src = "../Imgs/images/eachCategory/lanche.jpg";
        } else if (orderItemsCategory.textContent == "COMBO") {
          orderItemsImg.src = "../Imgs/images/eachCategory/combo.jpg";
        }
        orderItemsTable.classList.add("orderItemsTable");

        orderItemsDiv.appendChild(orderItemsImg);
        orderItemsDiv.appendChild(orderItemsName);
        orderItemsDiv.appendChild(orderItemsPrice);
        orderItemsDiv.appendChild(orderItemsQuantity);
        orderItemsTable.appendChild(orderItemsDiv);
        orderSettingsDiv.appendChild(orderItemsTable);
      });

      const orderPreparingButtonsDiv = document.createElement("div");
      orderPreparingButtonsDiv.classList.add("orderPreparingButtonsDiv");

      const h2PreparingOrder = document.createElement("h2");
      h2PreparingOrder.classList.add("preparingOrder");
      h2PreparingOrder.textContent = "Pedido sendo preparado...";
      orderPreparingButtonsDiv.appendChild(h2PreparingOrder);

      const orderDoneButton = document.createElement("button");
      orderDoneButton.classList.add("orderPreparingButtons");
      orderDoneButton.id = "orderDone";

      const checkIcon = document.createElement("img");
      checkIcon.src = "../Imgs/icons/checkIcon.svg";
      checkIcon.alt = "";
      orderDoneButton.appendChild(checkIcon);
      orderPreparingButtonsDiv.appendChild(orderDoneButton);

      const orderDeleteButton = document.createElement("button");
      orderDeleteButton.classList.add("orderPreparingButtons");
      orderDeleteButton.id = "orderDelete";

      const deleteIcon = document.createElement("img");
      deleteIcon.src = "../Imgs/icons/deleteIcon.svg";
      deleteIcon.alt = "";
      orderDeleteButton.appendChild(deleteIcon);
      orderPreparingButtonsDiv.appendChild(orderDeleteButton);

      orderSettingsDiv.appendChild(orderPreparingButtonsDiv);

      gridDiv.appendChild(orderSettingsDiv);

      // Adiciona o gridDiv ao body ou ao elemento desejado
      gridSection.appendChild(gridDiv);

      gridDiv.addEventListener("mouseover", () => {
        // Adicionar ouvintes de click apenas para o gridElement específico
        const orderDone = gridDiv.querySelector("#orderDone");
        const orderDelete = gridDiv.querySelector("#orderDelete");
        const preparingOrder = gridDiv.querySelector(".preparingOrder");

        if (orderDone && orderDelete && preparingOrder) {
          // Ouvinte para "Pedido concluído"
          orderDone.addEventListener("click", () => {
            orderDone.remove();
            orderDelete.remove();
            preparingOrder.textContent = "Pedido concluído";
            preparingOrder.style.backgroundColor = "#DCEE8A";
            preparingOrder.style.width = "100%";
          });

          // Ouvinte para "Pedido cancelado"
          orderDelete.addEventListener("click", () => {
            orderDone.remove();
            orderDelete.remove();

            preparingOrder.style.width = "100%";
            preparingOrder.textContent = "Pedido cancelado";
            preparingOrder.style.backgroundColor = "#FF7070";
          });
        }
      });
    }
  });
