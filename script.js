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

  const cartIcon = document.querySelector(".cart-icon");
  if (cartItems.length > 0) {
    cartIcon.classList.add("hidden"); // Masque l'icône du panier si des articles sont présents
  }

  const feedback = document.createElement("div");
  feedback.textContent = `${item.name} added to cart!`;
  feedback.classList.add("feedback");
  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 2000);
}

function updateButton(buttonAdd, item) {
  const quantity = cartItems.find(
    (cartItem) => cartItem.name === item.name
  ).quantity;

  buttonAdd.style.backgroundColor = "grey"; // Change la couleur
  buttonAdd.innerHTML = ` 
    <div class="quantity-controls">   
      <button class="button-decrease" style="background-color: white;">-</button>
      <span class="quantity">${quantity}</span>
      <button class="button-increase" style="background-color: white;">+</button>
    </div>
  `;

  // Ajout des écouteurs d'événements
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
          <img src="${cartItem.image}" alt="${
        cartItem.name
      }" class="cart-item-image">
          <span class="cart-item-quantity">Quantity: ${cartItem.quantity}</span>
          <span class="cart-item-price">Unit price: $${cartItem.price}</span>
          <span class="cart-item-total">Total: $${(
            cartItem.price * cartItem.quantity
          ).toFixed(2)}</span>
        </div>
      `;

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
  // Calcule la somme totale des articles dans le panier
  const totalAmount = cartItems.reduce(
    (total, cartItem) => total + cartItem.price * cartItem.quantity,
    0
  );

  const totalElement = document.createElement("div");
  totalElement.classList.add("order-total");
  totalElement.innerHTML = `<strong>Order Total: $${totalAmount.toFixed(
    2
  )}</strong>`;

  card.appendChild(totalElement); // Ajoute le total à la carte
}

// Fonction pour ajouter le bouton de confirmation de la commande
function addConfirmButton(card) {
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm Order";
  confirmButton.classList.add("confirm-button");

  // Ajoute un écouteur d'événements au bouton
  confirmButton.addEventListener("click", confirmOrder);

  card.appendChild(confirmButton); // Ajoute le bouton à la carte
}

function confirmOrder() {
  const container = document.getElementById("card-container");
  container.innerHTML = ""; // Vider le conteneur du panier

  const confirmationCard = document.createElement("div");
  confirmationCard.classList.add("confirmation-card");

  // Titre et message pour la confirmation
  confirmationCard.innerHTML = `
    <h2>Order Confirmed!</h2>
    <p>We hope you enyoy your food</p>
  `;

  const itemList = document.createElement("div"); // Div pour la liste des articles dans la confirmation

  cartItems.forEach((cartItem) => {
    // Création de l'élément pour chaque produit dans la confirmation
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("cart-item");

    // Structure HTML de chaque produit avec le total à droite
    cartItemElement.innerHTML = `
      <div class="item-card-container">
        <div class="item-info-left">
          <span class="cart-item-name">${cartItem.name}</span>
          <img src="${cartItem.image}" alt="${
      cartItem.name
    }" class="cart-item-image">
          <span class="cart-item-quantity">Quantity: ${cartItem.quantity}</span>
          <span class="cart-item-price">Unit price: $${cartItem.price}</span>
        </div>
        <div class="item-total-right">
          <span class="cart-item-total">Total: $${(
            cartItem.price * cartItem.quantity
          ).toFixed(2)}</span>
        </div>
      </div>
    `;

    itemList.appendChild(cartItemElement); // Ajoute chaque produit à la liste
  });

  confirmationCard.appendChild(itemList); // Ajoute la liste à la carte de confirmation

  // Ajoute le total de la commande dans le même format que "Your Cart"
  displayOrderTotalInConfirmationCard(confirmationCard);

  // Bouton pour démarrer une nouvelle commande
  const newOrderButton = document.createElement("button");
  newOrderButton.textContent = "New Order";
  newOrderButton.classList.add("new-order-button");
  newOrderButton.addEventListener("click", startNewOrder);

  confirmationCard.appendChild(newOrderButton); // Ajoute le bouton à la carte

  container.appendChild(confirmationCard); // Ajoute la carte de confirmation au conteneur
}

function displayOrderTotalInConfirmationCard(confirmationCard) {
  const totalAmount = cartItems.reduce(
    (total, cartItem) => total + cartItem.price * cartItem.quantity,
    0
  );

  const totalElement = document.createElement("div");
  totalElement.classList.add("order-total");
  totalElement.innerHTML = `<strong>Order Total: $${totalAmount.toFixed(
    2
  )}</strong>`;

  confirmationCard.appendChild(totalElement); // Ajoute le total à la carte dans le même format que "Your Cart"
}

function displayOrderTotal(card) {
  // Calcule la somme totale des articles dans le panier
  const totalAmount = cartItems.reduce(
    (total, cartItem) => total + cartItem.price * cartItem.quantity,
    0
  );

  const totalElement = document.createElement("div");
  totalElement.classList.add("order-total");
  totalElement.innerHTML = `<strong>Order Total: $${totalAmount.toFixed(
    2
  )}</strong>`;

  card.appendChild(totalElement); // Ajoute le total à la carte
}

function addConfirmButton(card) {
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm Order";
  confirmButton.classList.add("confirm-button");

  // Ajoute un écouteur d'événements au bouton
  confirmButton.addEventListener("click", confirmOrder);

  card.appendChild(confirmButton); // Ajoute le bouton à la carte
}

function startNewOrder() {
  cartItems = []; // Réinitialiser le panier
  document.querySelectorAll(".selected-product").forEach((img) => {
    img.classList.remove("selected-product"); // Enlever la bordure orange
  });
  updateCart(); // Met à jour l'affichage du panier

  // Réinitialiser l'affichage des articles
  const container = document.getElementById("items-container");
  container.innerHTML = ""; // Vider le conteneur des articles

  // Recharger les articles
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

      updateCart(); // Appelle la mise à jour du panier après le chargement des articles
    })
    .catch((error) => {
      console.error(error); // Gérer les erreurs
    });
}

function changeQuantity(name, change, buttonAdd) {
  const item = cartItems.find((cartItem) => cartItem.name === name);

  if (item) {
    item.quantity += change;

    if (item.quantity <= 0) {
      cartItems = cartItems.filter((cartItem) => cartItem.name !== name);
      buttonAdd.innerHTML = `<i class="fas fa-shopping-cart"></i> Add To Cart`;
      buttonAdd.style.backgroundColor = "#fff"; // Remettre la couleur d'origine
    } else {
      updateButton(buttonAdd, item); // Met à jour les contrôles du bouton
    }

    const cartIcon = document.querySelector(".cart-icon");
    if (cartItems.length === 0) {
      cartIcon.classList.remove("hidden");
    }

    updateCart();
  }
}

function showModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "block"; // Affiche le modal
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
  modal.style.display = "none"; // Cache le modal
}

// Fermer le modal lorsque l'utilisateur clique sur la croix
document.querySelector(".close-button").addEventListener("click", hideModal);

// Fermer le modal si l'utilisateur clique en dehors du contenu
window.addEventListener("click", (event) => {
  const modal = document.getElementById("myModal");
  if (event.target === modal) {
    hideModal();
  }
});

// Appel de showModal() lorsque vous souhaitez afficher le modal

function createCard() {
  const card = document.createElement("div");
  card.classList.add("item-card");

  // Calcul de la quantité totale d'articles dans le panier
  const totalItems = cartItems.reduce(
    (total, cartItem) => total + cartItem.quantity,
    0
  );

  // Titre et message pour la carte
  card.innerHTML = `
    <p class="panier">Your Cart <span class="item-count">${totalItems}</span></p>
<p class="text-panier">Your added items will appear here</p>
  `;

  return card;
}

// Fonction pour créer une carte vide lorsque le panier est vide
function createEmptyCard() {
  const container = document.getElementById("card-container");
  const emptyCard = createCard(); // Crée la carte vide
  container.appendChild(emptyCard);
}
