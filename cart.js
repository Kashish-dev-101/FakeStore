"use strict";

// ----- DOM References -----
const cartItemsContainer = document.querySelector("#cart-items-container");
const itemCountCart = document.querySelector("#total-items");
const totalPriceCart = document.querySelector("#total-price");
const mainHeading = document.querySelector("#main-heading");

// ----- Config from config.js (loaded before this script) -----
const IK_URL_ENDPOINT = CONFIG.IK_URL_ENDPOINT;

// Cart image thumbnails: fixed 100px cards
const CART_THUMB_SIZES = "100px";

/**
 * Extract the path from a FakeStoreAPI image URL for use with ImageKit.
 */
function getImagePath(fakeStoreUrl) {
  return new URL(fakeStoreUrl).pathname;
}

/**
 * Get responsive image attributes from ImageKit SDK.
 */
function getResponsiveAttrs(imagePath, sizes) {
  return ImageKit.getResponsiveImageAttributes({
    urlEndpoint: IK_URL_ENDPOINT,
    src: imagePath,
    sizes: sizes,
    transformation: [{ format: "auto" }, { quality: 80 }],
  });
}

/**
 * Build a single ImageKit-optimised URL as a fallback.
 */
function buildImageKitUrl(imagePath) {
  return ImageKit.buildSrc({
    urlEndpoint: IK_URL_ENDPOINT,
    src: imagePath,
    transformation: [{ format: "auto" }, { quality: 80 }],
  });
}

/**
 * Apply responsive ImageKit attributes to an img element.
 */
function applyImageKitAttrs(imgEl, fakeStoreUrl, sizes) {
  const imagePath = getImagePath(fakeStoreUrl);
  const responsive = getResponsiveAttrs(imagePath, sizes);

  if (responsive) {
    imgEl.src = responsive.src;
    if (responsive.srcSet) imgEl.setAttribute("srcset", responsive.srcSet);
    if (responsive.sizes) imgEl.setAttribute("sizes", responsive.sizes);
  } else {
    imgEl.src = buildImageKitUrl(imagePath);
  }
}

// ----- Render cart items -----
const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
let totalCost = 0;

cartItems.forEach((item, index) => {
  totalCost += item.price;

  const card = document.createElement("div");
  card.classList.add("product-card");

  // Image with ImageKit CDN
  const imgWrapper = document.createElement("div");
  imgWrapper.classList.add("image-zoom-container");

  const img = document.createElement("img");
  img.classList.add("product-images");
  applyImageKitAttrs(img, item.image, CART_THUMB_SIZES);
  img.alt = item.title;

  // First 2 cart items: high priority, rest: lazy
  if (index < 2) {
    img.fetchPriority = "high";
  } else {
    img.loading = "lazy";
  }

  imgWrapper.append(img);

  // Item details
  const details = document.createElement("div");
  details.classList.add("cart-item-details");

  const title = document.createElement("h4");
  title.textContent = item.title;

  const price = document.createElement("p");
  price.textContent = `$${item.price}`;

  details.append(title, price);

  // Remove button
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.classList.add("remove-btn");

  removeBtn.addEventListener("click", () => {
    const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    location.reload();
  });

  card.append(imgWrapper, details, removeBtn);
  cartItemsContainer.append(card);
});

// Update summary
itemCountCart.textContent = cartItems.length;
totalPriceCart.textContent = `$${totalCost.toFixed(2)}`;

// Redirect to main page on brand name click
mainHeading.addEventListener("click", () => {
  window.location.href = "index.html";
});
