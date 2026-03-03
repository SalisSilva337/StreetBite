let modalSection = document.querySelector(".modalSection");
let modalContent = document.querySelector(".modalContent");
let closeButton = document.querySelector(".closeButton");
let createItem = document.querySelector(".createItem");
let buttonCancel = document.querySelector(".buttonCancel");
let buttonCreate = document.querySelector(".buttonCreate");

let inputName = document.querySelector("#inputName");
let selectCategory = document.querySelector("#selectCategory");
let inputPrice = document.querySelector("#inputPrice");
let inputDesc = document.querySelector("#inputDesc");

let gridSection = document.querySelector(".gridSection");

const inputFile = document.querySelector("#files");
const imgArea = document.querySelector(".imgDivModal");
const imageImg = document.querySelector("#imageImg");
//Abrir Modal
let createListenerAdded = false;

createItem.addEventListener("click", () => {
  modalSection.style.display = "flex";
  modalContent.style.animation = "gridAnim .5s";

  // Close modal when cancel button is clicked
  buttonCancel.addEventListener("click", () => {
    modalContent.style.animation = "gridReverseAnim .5s";
    setTimeout(() => {
      modalSection.style.display = "none";
    }, 500);
  });

  closeButton.addEventListener("click", () => {
    modalContent.style.animation = "gridReverseAnim .5s";
    setTimeout(() => {
      modalSection.style.display = "none";
    }, 500);
  });

  buttonCreate.addEventListener("click", () => {
    modalSection.style.display = "none";
    let produtoAdicionado = {
      nome: inputName.value,
      preco: inputPrice.value,
      categoria: selectCategory.value,
    };

    const optionsPOST = {
      method: "POST",
      body: JSON.stringify(produtoAdicionado),
      headers: {
        "Content-Type": "application/json",
      },
    };

    fetch("http://localhost:8080/api/v1/produtos", optionsPOST)
      .then((response) => response)
      .then((data) => {
        console.log(data);
      });

    window.loadPage("menu");
  });
});

const optionsGET = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

fetch("http://localhost:8080/api/v1/produtos", optionsGET)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    for (let index = 0; index < data.length; index++) {
      let grid = document.createElement("div");
      let productName = document.createElement("h2");
      let itemImageDiv = document.createElement("div");
      let itemImage = document.createElement("img");
      let productCategory = document.createElement("h2");
      let productPrice = document.createElement("h3");
      let editButton = document.createElement("button");
      let editImg = document.createElement("img");
      let deleteButton = document.createElement("button");
      let deleteImg = document.createElement("img");
      let buttonsGridDiv = document.createElement("div");

      let eachID = document.createElement("span");

      grid.className = "grid";
      itemImageDiv.className = "itemImage";
      editButton.className = "editButton";
      deleteButton.className = "editButton";

      buttonsGridDiv.style.display = "flex";
      buttonsGridDiv.style.gap = "10px";
      eachID.value = data[index].id;
      productName.textContent = data[index].nome;
      productCategory.textContent = data[index].categoria;
      productPrice.textContent = "R$" + data[index].preco;

      if (productCategory.textContent == "BEBIDA") {
        itemImage.src = "../Imgs/images/eachCategory/bebida.jpg";
      } else if (productCategory.textContent == "ACOMPANHAMENTO") {
        itemImage.src = "../Imgs/images/eachCategory/acompanhamento.jpg";
      } else if (productCategory.textContent == "LANCHE") {
        itemImage.src = "../Imgs/images/eachCategory/lanche.jpg";
      } else if (productCategory.textContent == "COMBO") {
        itemImage.src = "../Imgs/images/eachCategory/combo.jpg";
      }

      // itemImage.src = imgArea.querySelector("img")
      //   ? imgArea.querySelector("img").src
      //   : "";
      editImg.src = "../Imgs/icons/editIcon.svg";

      deleteImg.src = "../Imgs/icons/deleteIcon.svg";
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

      modalSection.style.display = "none";
      grid.style.animation = "gridAnim .5s";
      deleteButton.addEventListener("click", () => {
        grid.remove();
        const optionsDELETE = {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },
        };

        fetch(
          "http://localhost:8080/api/v1/produtos/" + eachID.value,
          optionsDELETE
        )
          .then((response) => response)
          .then((data) => {
            console.log(data);
          });
      });
      editButton.addEventListener("click", () => {
        grid.remove();
        modalSection.style.display = "flex";
      });
    }
  });
// Handle button create click

//Selecionar Imagem
inputFile.addEventListener("change", function () {
  const image = this.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    const allImg = imgArea.querySelectorAll("img");
    allImg.forEach((item) => item.remove());
    const imgUrl = reader.result;
    const img = document.createElement("img");
    img.src = imgUrl;
    imgArea.appendChild(img);
    imgArea.dataset.img = image.name;
  };
  reader.readAsDataURL(image);
});
