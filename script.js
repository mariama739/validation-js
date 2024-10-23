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
      id: item.id,
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
        <img id="product-${item.id}" src="${item.image}" alt="${item.name}" class="imgs">
        <button class="button-add">
          <i class="fas fa-shopping-cart"></i> Add To Cart
        </button>
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
    createEmptyCard(); // Crée la carte vide dès le départ
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

  // Ajouter une bordure orange autour du produit sélectionné
  const productImageElement = document.querySelector(`#product-${item.id}`);
  productImageElement.classList.add("selected-product");

  // Change la couleur du bouton et ajoute les contrôles de quantité
  updateButton(buttonAdd, existingItem || item); // Utilisez l'élément existant ou l'élément nouvellement ajouté
  updateCart(); // Met à jour l'affichage du panier
}

function updateButton(buttonAdd, item) {
  const quantity = cartItems.find(cartItem => cartItem.name === item.name)?.quantity || 0;

  if (quantity > 0) {
    buttonAdd.style.backgroundColor = "grey"; // Change la couleur
    buttonAdd.innerHTML = ` 
      <div class="quantity-controls">   
        <button class="button-decrease" style="background-color: white;">-</button>
        <span class="quantity">${quantity}</span>
        <button class="button-increase" style="background-color: white;">+</button>
      </div>
    `;

    const buttonDecrease = buttonAdd.querySelector(".button-decrease");
    const buttonIncrease = buttonAdd.querySelector(".button-increase");

    buttonDecrease.addEventListener("click", (event) => {
      event.stopPropagation();
      changeQuantity(item.name, -1, buttonAdd);
    });

    buttonIncrease.addEventListener("click", (event) => {
      event.stopPropagation();
      changeQuantity(item.name, 1, buttonAdd);
    });
  } else {
    // Si la quantité est 0, on remet le bouton à l'état initial
    buttonAdd.style.backgroundColor = ""; // Réinitialise la couleur
    buttonAdd.innerHTML = `<i class="fas fa-shopping-cart"></i> Add To Cart`; // Remet le texte d'origine
  }
}


// Fonction pour changer la quantité dans le panier
function changeQuantity(name, change, buttonAdd) {
  const cartItem = cartItems.find((item) => item.name === name);

  if (cartItem) {
    const newQuantity = cartItem.quantity + change;

    if (newQuantity <= 0) {
      removeFromCart(name); // Supprime l'article si la quantité est zéro ou moins
    } else {
      cartItem.quantity = newQuantity; // Met à jour la quantité
      updateButton(buttonAdd, cartItem); // Met à jour le bouton avec la nouvelle quantité
      updateCart(); // Met à jour l'affichage du panier
    }
  }
}



// Met à jour l'affichage du panier
function updateCart() {
  const container = document.getElementById("card-container");
  container.innerHTML = ""; // Réinitialise le contenu du panier

  if (cartItems.length === 0) {
    createEmptyCard(); // Crée la carte vide si le panier est vide
  } else {
    const card = createCard(); // Crée la carte principale pour le panier
    const itemList = document.createElement("div"); // Div pour la liste des articles dans le panier

    cartItems.forEach((cartItem) => {
      // Création de l'élément pour chaque produit dans le panier
      const cartItemElement = document.createElement("div");
      cartItemElement.classList.add("cart-item");

      // Structure HTML de chaque produit
      cartItemElement.innerHTML = `
        <div class="item-card-container">
          <span class="cart-item-name">${cartItem.name}</span>
          <span class="cart-item-quantity">Quantity: ${cartItem.quantity}</span>
          <span class="cart-item-price">Unit price: $${cartItem.price}</span>
          <span class="cart-item-total">Total: $${(
            cartItem.price * cartItem.quantity
          ).toFixed(2)}</span>
          <button class="remove-item-button">&times;</button>
        </div>
      `;

      // Ajout de la fonctionnalité de suppression
      cartItemElement.querySelector('.remove-item-button').addEventListener('click', () => {
        removeFromCart(cartItem.name);
      });

      // Ajoute chaque produit à la liste
      itemList.appendChild(cartItemElement);
    });

    card.appendChild(itemList); // Ajoute la liste à la carte du panier
    container.appendChild(card); // Ajoute la carte au conteneur

    displayOrderTotal(card); // Affiche la somme totale dans la carte
    addConfirmButton(card); // Ajoute le bouton de confirmation dans la carte
  }
}

// Fonction qui affiche le total de la commande
function displayOrderTotal(card) {
  const totalAmount = cartItems.reduce(
    (total, cartItem) => total + cartItem.price * cartItem.quantity,
    0
  );

  const totalElement = document.createElement("div");
  totalElement.classList.add("order-total");
  totalElement.innerHTML = `<strong>Order Total: $${totalAmount.toFixed(2)}</strong>`;

  card.appendChild(totalElement); // Ajoute le total à la carte
}

// Fonction pour ajouter le bouton de confirmation de la commande
function addConfirmButton(card) {
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm Order";
  confirmButton.classList.add("confirm-button");

  confirmButton.addEventListener("click", showModal);

  card.appendChild(confirmButton); // Ajoute le bouton à la carte
}

function removeFromCart(name) {
  // Trouver l'élément à retirer
  const cartItem = cartItems.find(cartItem => cartItem.name === name);

  // Retirer l'élément du panier
  cartItems = cartItems.filter(cartItem => cartItem.name !== name);

  // Retirer la classe 'selected-product' de l'image correspondante
  if (cartItem) {
    const productImageElement = document.querySelector(`#product-${cartItem.id}`);
    if (productImageElement) {
      productImageElement.classList.remove("selected-product"); // Enlève la bordure orange
    }
  }

  updateCart(); // Met à jour l'affichage du panier
}

function showModal() {
  const modal = document.getElementById("myModal");
  const modalItems = document.getElementById("modal-items");
  const cartContainer = document.getElementById("card-container"); // Récupérer la section du panier

  modal.style.display = "block"; // Affiche le modal
  cartContainer.style.display = "none"; // Cache la section "Your Cart"

  // Réinitialiser le contenu du modal
  modalItems.innerHTML = ""; 

  // Boucle sur les éléments du panier et les affiche dans le modal
  cartItems.forEach(cartItem => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("modal-item");

    // Ajout de l'image du produit dans le modal
    itemElement.innerHTML = `
      <img src="${cartItem.image}" alt="${cartItem.name}" class="modal-item-image">
      <div class="modal-item-info">
        <p><strong>${cartItem.name}</strong></p>
        <p>Quantity: ${cartItem.quantity}</p>
        <p>Total: $${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
      </div>
    `;

    // Ajoute l'élément produit au conteneur du modal
    modalItems.appendChild(itemElement);
  });

  // Calculer le total de la commande
  const orderTotal = cartItems.reduce((total, cartItem) => total + (cartItem.price * cartItem.quantity), 0);

  // Ajouter le total de la commande au modal
  const totalElement = document.createElement("div");
  totalElement.classList.add("order-total");
  totalElement.innerHTML = `
    <p><strong>Order Total: $${orderTotal.toFixed(2)}</strong></p>
  `;

  // Ajouter le total de la commande à la fin du contenu du modal
  modalItems.appendChild(totalElement);
}


// Ferme le modal lorsque l'utilisateur clique sur la croix
document.querySelector(".close-button").addEventListener("click", hideModal);

// Ferme le modal si l'utilisateur clique en dehors du contenu
window.addEventListener("click", (event) => {
  const modal = document.getElementById("myModal");
  if (event.target === modal) {
    hideModal();
  }
});


function hideModal() {
  const modal = document.getElementById("myModal");
  const cartContainer = document.getElementById("card-container"); // Récupérer la section du panier

  modal.style.display = "none"; // Cache le modal
  cartContainer.style.display = "block"; // Affiche de nouveau la section "Your Cart"
}


document.getElementById("new-order-button").addEventListener("click", () => {
  // 1. Réinitialiser le panier
  cartItems = [];

  // 2. Réinitialiser l'affichage des boutons "Add to Cart" et enlever les bordures
  const productImages = document.querySelectorAll(".selected-product");
  productImages.forEach((img) => {
    img.classList.remove("selected-product"); // Enlève la bordure orange
  });

  const addButtons = document.querySelectorAll(".button-add");
  addButtons.forEach((button) => {
    button.style.backgroundColor = ""; // Réinitialiser la couleur du bouton
    button.innerHTML = `<i class="fas fa-shopping-cart"></i> Add To Cart`; // Remettre le texte original
  });

  // 3. Mettre à jour l'affichage du panier
  updateCart();

  // 4. Fermer le modal
  hideModal();
});



function createCard() {
  const card = document.createElement("div");
  card.classList.add("item-card");

  const totalItems = cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);
  card.innerHTML = `<p class="panier">Your Cart <span class="item-count">${totalItems}</span></p><p class="text-panier">Your added items will appear here</p>`;
  return card;
}

function createEmptyCard() {
  const container = document.getElementById("card-container");
  const emptyCard = createCard(); // Crée la carte vide
  container.appendChild(emptyCard);
}
