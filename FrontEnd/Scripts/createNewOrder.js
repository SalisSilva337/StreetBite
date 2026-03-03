import ApiService from './service.js';

const api = new ApiService('http://localhost:8080');

let spanSelectedButton = document.querySelector("#spanSelectedButton");
let buttonsPlaces = document.querySelectorAll(".buttonsLocal");

//address inputs
let divCep = document.querySelector(".addressInputs");
let cep = document.querySelector("#cepTxt");
let inputsPlace = document.querySelectorAll(".inputsPlace");


buttonsPlaces.forEach((btn) => {
  btn.addEventListener("click", () => {
    console.log(btn.value);
    spanSelectedButton.textContent = "Selecionado: " + btn.value;
    if (btn.value == "retiradaComerNoLocal") {
      divCep.style.display = "none";
      //inputs endereco
      cep.value = 57010000;
      document.querySelector("#ruaTxt").value = "Loja";
      document.querySelector("#bairroTxt").value = "Loja";
      document.querySelector("#numTxt").value = "00";
      console.log(cep.value);
      console.log(document.querySelector("#ruaTxt").value);
      console.log(document.querySelector("#bairroTxt").value);
      console.log(document.querySelector("#numTxt").value);
    } else {
      divCep.style.display = "block";
    }
  });
});

//Client Data Part
let inputsClientData = document.querySelectorAll(".inputsClientData");
let selectPayment = document.querySelector(".selectPayment");

inputsClientData.forEach((input) => {
  input.addEventListener("change", () => {
    if (input.value == "") {
      input.classList.add("emptyInput");
      input.classList.remove("nonEmptyInput");
    } else if (input.value.trimStart() !== input.value) {
      input.classList.add("emptyInput");
      input.classList.remove("nonEmptyInput");
    } else {
      input.classList.remove("emptyInput");
      input.classList.add("nonEmptyInput");
    }
  });
});

selectPayment.addEventListener("change", () => {
  console.log(selectPayment.value);
  if (selectPayment.value == "") {
    selectPayment.classList.add("emptyInput");
    selectPayment.classList.remove("nonEmptyInput");
  } else {
    selectPayment.classList.remove("emptyInput");
    selectPayment.classList.add("nonEmptyInput");
  }
});

//Address Part

cep.addEventListener("change", () => {
  let cepvalue = cep.value;
  if (cepvalue !== "") {
    let url = "https://opencep.com/v1/" + cepvalue;

    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.send();

    request.onload = function () {
      if (request.status === 200) {
        let endereco = JSON.parse(request.response);
        document.querySelector("#ruaTxt").value = endereco.logradouro;
        document.querySelector("#bairroTxt").value = endereco.bairro;
        inputsPlace.forEach((input) => {
          input.classList.remove("emptyInput");
          input.classList.add("nonEmptyInput");
        });
      } else {
        document.querySelector("#ruaTxt").value = "CEP INVÁLIDO";
        document.querySelector("#bairroTxt").value = "CEP INVÁLIDO";
        inputsPlace.forEach((input) => {
          input.classList.add("emptyInput");
          input.classList.remove("nonEmptyInput");
        });
      }
    };
  }
});

//Block Divs func
let gridLocal = document.querySelector("#gridLocal");
let gridData = document.querySelector("#gridData");
let gridMenu = document.querySelector("#gridMenu");

let backToLocal = document.querySelector("#backToLocal");
let goToMenu = document.querySelector("#goToMenu");
let backToData = document.querySelector("#backToData");
let finishOrder = document.querySelector("#finishOrder");
let buttonGetOnPlace = document.querySelector("#buttonGetOnPlace");
let buttonDelivery = document.querySelector("#buttonDelivery");

gridData.style.pointerEvents = "none";
gridData.style.filter = "blur(2px)";
gridMenu.style.pointerEvents = "none";
gridMenu.style.filter = "blur(2px)";
gridLocal.style.border = "1dvh solid #eda3a3";

//Go To Data Grid
buttonDelivery.addEventListener("click", () => {
  gridLocal.style.pointerEvents = "none";
  gridLocal.style.filter = "blur(2px)";
  gridLocal.style.border = "0px";

  gridData.style.pointerEvents = "";
  gridData.style.filter = "";
  gridData.style.border = "1dvh solid #eda3a3";

  gridMenu.style.pointerEvents = "none";
  gridMenu.style.filter = "blur(2px)";
  gridMenu.style.border = "0px";
});

buttonGetOnPlace.addEventListener("click", () => {
  gridLocal.style.pointerEvents = "none";
  gridLocal.style.filter = "blur(2px)";
  gridLocal.style.border = "0px";

  gridData.style.pointerEvents = "";
  gridData.style.filter = "";
  gridData.style.border = "1dvh solid #eda3a3";

  gridMenu.style.pointerEvents = "none";
  gridMenu.style.filter = "blur(2px)";
  gridMenu.style.border = "0px";
});

//Return to Local Grid
backToLocal.addEventListener("click", () => {
  gridLocal.style.pointerEvents = "";
  gridLocal.style.filter = "";
  gridLocal.style.border = "1dvh solid #eda3a3";

  gridData.style.pointerEvents = "none";
  gridData.style.filter = "blur(2px)";
  gridData.style.border = "0px";

  gridMenu.style.pointerEvents = "none";
  gridMenu.style.filter = "blur(2px)";
  gridMenu.style.border = "0px";
});

//Go To Menu Grid
goToMenu.addEventListener("click", () => {
  gridLocal.style.pointerEvents = "none";
  gridLocal.style.filter = "blur(2px)";
  gridLocal.style.border = "0px";

  gridData.style.pointerEvents = "none";
  gridData.style.filter = "blur(2px)";
  gridData.style.border = "0px";

  gridMenu.style.pointerEvents = "";
  gridMenu.style.filter = "";
  gridMenu.style.border = "1dvh solid #eda3a3";
});

//Return to Data Grid
backToData.addEventListener("click", () => {
  gridLocal.style.pointerEvents = "none";
  gridLocal.style.filter = "blur(2px)";
  gridMenu.style.border = "0px";

  gridData.style.pointerEvents = "";
  gridData.style.filter = "";
  gridData.style.border = "1dvh solid #eda3a3";

  gridMenu.style.pointerEvents = "none";
  gridMenu.style.filter = "blur(2px)";
  gridMenu.style.border = "0px";
});

let ItemsTable = document.querySelector(".ItemsTable");
let subtotalItemsDiv = document.querySelector(".subtotalItemsDiv");
let subtotalPrice = document.querySelector(".subtotalPrice");
let subtotal = 0;

const optionsGET = {
  method: "GET",
};

fetch("http://localhost:8080/api/v1/produtos", optionsGET)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    for (let index = 0; index < data.length; index++) {
      let tableGrid = document.createElement("div");
      tableGrid.className = "tableGrid";
      let itemImage = document.createElement("div");
      itemImage.className = "itemImage";
      let productName = document.createElement("h2");
      productName.id = "productName";
      let productPrice = document.createElement("h3");
      productPrice.id = "productPrice";
      let productCategory = document.createElement("h3");
      productCategory.id = "productCategory";
      let productInfos = document.createElement("div");

      let itemsCountDiv = document.createElement("div");
      itemsCountDiv.className = "itemsCountDiv";
      let subButton = document.createElement("button");
      subButton.className = "itemsCountButtons";
      let itemCount = document.createElement("input");
      itemCount.className = "itemCount";
      let sumButton = document.createElement("button");
      sumButton.className = "itemsCountButtons";
      let addToCart = document.createElement("button");
      addToCart.className = "addToCart";

      let productImg = document.createElement("img");

      productName.textContent = data[index].nome;
      productCategory.textContent = data[index].categoria;
      if (productCategory.textContent == "BEBIDA") {
        productImg.src = "../Imgs/images/eachCategory/bebida.jpg";
      }
      if (productCategory.textContent == "COMBO") {
        productImg.src = "../Imgs/images/eachCategory/combo.jpg";
      }
      if (productCategory.textContent == "ACOMPANHAMENTO") {
        productImg.src = "../Imgs/images/eachCategory/acompanhamento.jpg";
      }
      if (productCategory.textContent == "LANCHE") {
        productImg.src = "../Imgs/images/eachCategory/lanche.jpg";
      }
      productPrice.textContent = "R$" + data[index].preco;
      let cutProductName = productName.textContent.slice(0, 10) + "...";
      productName.textContent = cutProductName;

      itemImage.appendChild(productImg);

      let cartImg = document.createElement("img");
      cartImg.src = "../Imgs/icons/shoppingCartIcon.svg";
      addToCart.appendChild(cartImg);

      subButton.textContent = "-";
      sumButton.textContent = "+";
      itemCount.type = "number";
      itemCount.disabled = true;

      //ItemCount func

      let count = 1;

      itemCount.value = count;

      subButton.addEventListener("click", () => {
        if (count <= 1) {
          count = 1;
        } else {
          count--;
          itemCount.value = count;
        }
      });
      sumButton.addEventListener("click", () => {
        count++;
        itemCount.value = count;
      });
      productInfos.appendChild(productName);
      productInfos.appendChild(productPrice);
      productInfos.appendChild(productCategory);
      tableGrid.appendChild(itemImage);
      tableGrid.appendChild(productInfos);

      itemsCountDiv.appendChild(subButton);
      itemsCountDiv.appendChild(itemCount);
      itemsCountDiv.appendChild(sumButton);

      tableGrid.appendChild(itemsCountDiv);

      tableGrid.appendChild(addToCart);
      ItemsTable.appendChild(tableGrid);

      addToCart.addEventListener("click", () => {
        // Criando a div principal "cartGrid"
        const cartGrid = document.createElement("div");
        cartGrid.classList.add("cartGrid");

        // Criando a div "ProductNameDiv"
        const productNameDiv = document.createElement("div");
        productNameDiv.classList.add("ProductNameDiv");

        // Criando o título "Nome produto"
        const productCartName = document.createElement("h3");
        productCartName.textContent = productName.textContent;
        productNameDiv.appendChild(productCartName);

        const productCartCategory = document.createElement("h3");
        productCartCategory.textContent = productCategory.textContent;
        productNameDiv.appendChild(productCartCategory);

        // Criando a div "priceCartDiv"
        const priceCartDiv = document.createElement("div");
        priceCartDiv.classList.add("priceCartDiv");

        // Criando o elemento "productQuantity"
        const productQuantity = document.createElement("h3");
        productQuantity.classList.add("productQuantity");
        productQuantity.textContent = itemCount.value + " x";
        priceCartDiv.appendChild(productQuantity);

        // Criando o elemento "productCartPrice"
        const productCartPrice = document.createElement("h3");
        productCartPrice.classList.add("productCartPrice");
        productCartPrice.textContent = productPrice.textContent;
        priceCartDiv.appendChild(productCartPrice);

        // Criando o botão "Excluir"
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("deleteCartItem");
        deleteButton.textContent = "Excluir";

        // Montando a estrutura
        cartGrid.appendChild(productNameDiv);
        cartGrid.appendChild(priceCartDiv);
        cartGrid.appendChild(deleteButton);

        // Adicionando o "cartGrid" à página (no corpo, por exemplo)
        subtotalItemsDiv.appendChild(cartGrid);

        // Convertendo itemCount.value para número (caso não seja numérico)
        let count = parseInt(itemCount.value, 10);

        // Removendo o "R$" e convertendo productPrice.textContent para número (caso seja um valor monetário)
        let price = parseFloat(
          productPrice.textContent.replace("R$", "").trim()
        );

        // Calculando o subtotal
        let eachProductPrice = count * price;

        subtotal = eachProductPrice + subtotal;
        // Atualizando o texto de subtotalPrice
        subtotalPrice.textContent = "R$" + subtotal.toFixed(2); // .toFixed(2) para formatar com duas casas decimais

        deleteButton.addEventListener("click", () => {
          cartGrid.remove();
          subtotal = subtotal - eachProductPrice;
          subtotalPrice.textContent = "R$" + subtotal.toFixed(2);
        });
        finishOrder.addEventListener("click", () => {
          // api.getComandas().then((comandas) => console.log(comandas)); 
          let itensAdicionados = {
            produtoNome: productCartName.textContent,
            categoria: productCartCategory.textContent,
            quantidade: itemCount.value,
            totalItem: productCartPrice.textContent,
          };
          let comandaAdicionada = {
            items: [itensAdicionados],
            codigoDoPedido: "",
            status: "",
            subtotal: subtotal.value,
            pedidoCriadoEm: "",
            update: "",
            metodoDePagamento: selectPayment.value,
          };

          console.log(JSON.stringify(comandaAdicionada));
          let optionsPOSTBodyItem = {
            method: "POST",
            body: JSON.stringify(itensAdicionados),
            headers: {
              "Content-Type": "application/json",
            },
          };
          let optionsPOSTBodyComanda = {
            method: "POST",
            body: JSON.stringify(comandaAdicionada),
            headers: {
              "Content-Type": "application/json",
            },
          };
          fetch(
            "http://localhost:8080/api/v1/comandas/item",
            optionsPOSTBodyItem
          )
            .then((response) => response)
            .then((data) => {
              console.log(data);
            });
          fetch("http://localhost:8080/api/v1/comandas", optionsPOSTBodyComanda)
            .then((response) => response)
            .then((data) => {
              console.log(data);
            });
        });
      });
    }
  });
