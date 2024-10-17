// fetch("data.json")
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error(
//         `Erreur HTTP ${response.status} : ${response.statusText}`
//       );
//     }
//     return response.json();
//   })
//   .then((data) => {
//     // Mapper les données
//     const mappedData = data.map((item) => ({
//       image: item.image.desktop, // Par exemple, ne garder que la miniature
//       name: item.name,
//       category: item.category,
//       price: item.price,
//     }));

//     console.log(mappedData); // Afficher les données mappées

//     const container = document.getElementById("items-container");
//     mappedData.forEach((item) => {
//       const itemElement = document.createElement("div");
//       itemElement.className = 'maClasse'
//       itemElement.innerHTML = `

//         <img src="${item.image}" alt="${item.name}" class="imgs">
//         <button class="button-add"><img src="assets/images/icon-add-to-cart.svg" alt="icon" class="icon">Add To Card</button>
//         <p class="category">${item.category}</p>
//         <h2 class="name">${item.name}</h2>
//         <p class="price"> $${item.price}</p>

//       `;
//       container.appendChild(itemElement);
//     });
//   })

//   function createCard() {
//     const card = document.createElement('div');
//     card.classList.add('item-card');

//     card.innerHTML = `
//     <p class="panier">Your Cart <span>()</span></p>
//     <img src="assets/images/illustration-empty-cart.svg" class="img-panier">
//     <p class="text-panier">Your added items will appear here</p>

//     `;

//     return card;
//   }

//   function addCardToContainer() {
//     const container = document.getElementById('card-container');
//     const newCard = createCard();
//     container.appendChild(newCard);
//   }
//   window.onload = addCardToContainer();

//   // .catch((error) => console.error("Erreur lors du chargement du JSON:", error));




fetch("data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(
        `Erreur HTTP ${response.status} : ${response.statusText}`
      );
    }
    return response.json();
  })
  .then((data) => {
    const mappedData = data.map((item) => ({
      image: item.image.desktop,
      name: item.name,
      category: item.category,
      price: item.price,
    }));

    const container = document.getElementById("items-container");
    mappedData.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "maClasse";
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="imgs">
        <button class="button-add">Add To Cart</button>
        <p class="category">${item.category}</p>
        <h2 class="name">${item.name}</h2>
        <p class="price"> $${item.price}</p>
      `;

      const buttonAdd = itemElement.querySelector(".button-add");

      buttonAdd.addEventListener("click", () => {
        addToCart(item, buttonAdd);
      });

      container.appendChild(itemElement);
    });
  });

let cartItems = []; // Tableau pour stocker les articles du panier

function addToCart(item, buttonAdd) {
  const existingItem = cartItems.find(
    (cartItem) => cartItem.name === item.name
  );

  if (existingItem) {
    existingItem.quantity += 1; // Augmente la quantité si déjà dans le panier
  } else {
    cartItems.push({ ...item, quantity: 1 }); // Ajoute l'article au panier
  }

  // Change la couleur du bouton et ajoute les contrôles de quantité
  buttonAdd.style.backgroundColor = "red"; // Change la couleur en rouge
  buttonAdd.innerHTML = `
    <span style="color: white;">Add To Cart</span>
    <div class="quantity-controls">
      <button class="button-decrease" style="background-color: white;" onclick="changeQuantity('${
        item.name
      }', -1)">-</button>
      <span class="quantity">${existingItem ? existingItem.quantity : 1}</span>
      <button class="button-increase" style="background-color: white;" onclick="changeQuantity('${
        item.name
      }', 1)">+</button>
    </div>
  `;

  updateCart();
}

function updateCart() {
  const container = document.getElementById("card-container");
  container.innerHTML = ""; // Réinitialise le contenu

  const card = createCard();
  const itemList = document.createElement("ol"); // Liste numérotée

  cartItems.forEach((cartItem) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      ${cartItem.name} - $${(cartItem.price * cartItem.quantity).toFixed(
      2
    )} (x${cartItem.quantity})
    `;
    itemList.appendChild(listItem);
  });

  card.appendChild(itemList);
  container.appendChild(card);
}

function changeQuantity(name, change) {
  const item = cartItems.find((cartItem) => cartItem.name === name);

  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cartItems = cartItems.filter((cartItem) => cartItem.name !== name); // Retire l'article s'il n'y a plus de quantité
    }
    updateCart();
  }
}

function createCard() {
  const card = document.createElement("div");
  card.classList.add("item-card");

  card.innerHTML = `
    <p class="panier">Your Cart <span>(${cartItems.length})</span></p>
    <p class="text-panier">Your added items will appear here</p>
  `;

  return card;
}

function addCardToContainer() {
  const container = document.getElementById("card-container");
  const newCard = createCard();
  container.appendChild(newCard);
}

window.onload = addCardToContainer();
