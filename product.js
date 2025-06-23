"use-strict";

// Getting the ID from the URL 
const queryString = new URLSearchParams(window.location.search);
console.log(queryString);

const id = queryString.get("id");
console.log(id);

const baseURL = "https://fakestoreapi.com";

const productImage = document.querySelector("#main-product-image");
console.log(productImage);

const productTitle = document.querySelector("#product-title");
console.log(productTitle);

const productDescription = document.querySelector("#product-description");
console.log(productDescription);

const productPrice = document.querySelector("#product-price");
console.log(productPrice);

const similarProductDiv = document.querySelector("#similar-products");
console.log(similarProductDiv);

const ratingValue = document.querySelector("#rating-value");
console.log(ratingValue);

const ratingCount = document.querySelector("#rating-count");
console.log(ratingCount);

const mainHeading = document.querySelector("#main-heading");
console.log(mainHeading);


const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const cartCount = document.querySelector("#cart-count");
    if (cartCount) {
      cartCount.textContent = cart.length;
    }
  };

updateCartCount();

// Function to render product
const renderProduct = async (data) => {
  similarProductDiv.innerHTML = "";

  // Main product details
  productImage.src = data.image;
  productTitle.textContent = data.title;
  productDescription.textContent = data.description;
  productPrice.textContent = `$${data.price}`;

  ratingValue.textContent = data.rating.rate;
  ratingCount.textContent = `${data.rating.count} Ratings`;

  // Similar products from same category
  const urlEncCategory = encodeURIComponent(data.category);
  const categoryImages = await fetch(`${baseURL}/products/category/${urlEncCategory}`);
  const jsCategoryImages = await categoryImages.json();

  for (let img of jsCategoryImages) {
    const imgElm = document.createElement("img");
    imgElm.src = img.image;
    similarProductDiv.append(imgElm);

    imgElm.addEventListener("click", async () => {
      const response = await fetch(`${baseURL}/products/${img.id}`);
      const data = await response.json();
      renderProduct(data);
    });
  }

  const addToCartBtn = document.querySelector(".add-to-cart");

  // Ensure cart is always an array from localStorage
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  
  // Check if current item is already in cart
  const isInCart = cart.some(item => item.id === data.id);
  if (isInCart) {
    addToCartBtn.textContent = "Go to Cart";
  }
  
  // Handle button click
  addToCartBtn.addEventListener("click", () => {
    // Re-fetch current cart from storage
    let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  
    const existingItem = cart.find(item => item.id === data.id);
  
    if (!existingItem) {
      const cartItem = {
        id: data.id,
        title: data.title,
        price: data.price,
        image: data.image,
        quantity: 1
      };
      cart.push(cartItem);
      localStorage.setItem("cartItems", JSON.stringify(cart));
  
      addToCartBtn.textContent = "Go to Cart";
    } else {
      // Redirect if already in cart
      window.location.href = "cart.html";
    }
  
    // Update cart count in UI
    updateCartCount();
  });
  

};


// Function to fetch the product of the given ID
const fetchProduct = async () => {
  const response = await fetch(`${baseURL}/products/${id}`);
  const data = await response.json();
  renderProduct(data);
};

// Redirect to main page on logo click
const mainPageRed = () => {
  window.location.href = "index.html";
};

document.addEventListener("DOMContentLoaded", fetchProduct);
mainHeading.addEventListener("click", mainPageRed);


