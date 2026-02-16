"use strict";

// ----- DOM References -----
const productImage = document.querySelector("#main-product-image");
const productTitle = document.querySelector("#product-title");
const productDescription = document.querySelector("#product-description");
const productPrice = document.querySelector("#product-price");
const similarProductDiv = document.querySelector("#similar-products");
const ratingValue = document.querySelector("#rating-value");
const ratingCount = document.querySelector("#rating-count");
const mainHeading = document.querySelector("#main-heading");

// ----- Config from config.js (loaded before this script) -----
const baseURL = CONFIG.FAKESTORE_BASE_URL;
const IK_URL_ENDPOINT = CONFIG.IK_URL_ENDPOINT;

// ----- Get product ID from URL -----
const id = new URLSearchParams(window.location.search).get("id");

// ----- Responsive image sizes -----
// Main product image: takes ~400px on desktop, full width on mobile
const MAIN_IMAGE_SIZES = "(max-width: 900px) 80vw, 400px";
// Similar product thumbnails: fixed ~140px cards
const THUMB_SIZES = "140px";

/**
 * Extract the path from a FakeStoreAPI image URL for use with ImageKit.
 * e.g. "https://fakestoreapi.com/img/81fPKd-2AYL.png" → "/img/81fPKd-2AYL.png"
 */
function getImagePath(fakeStoreUrl) {
  return new URL(fakeStoreUrl).pathname;
}

/**
 * Get responsive image attributes (src, srcSet, sizes) from ImageKit SDK.
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

// ----- Cart count sync -----
const updateCartCount = () => {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const cartCount = document.querySelector("#cart-count");
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
};

updateCartCount();

/**
 * Render the main product and similar products.
 *
 * - Main product image: fetchpriority="high" (it's the LCP element)
 * - Similar product thumbnails: loading="lazy"
 */
const renderProduct = async (data) => {
  similarProductDiv.innerHTML = "";

  // Main product image — high priority since it's above the fold
  applyImageKitAttrs(productImage, data.image, MAIN_IMAGE_SIZES);
  productImage.fetchPriority = "high";
  productImage.alt = data.title;

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

    // Responsive ImageKit URL for thumbnails — lazy loaded
    applyImageKitAttrs(imgElm, img.image, THUMB_SIZES);
    imgElm.loading = "lazy";
    imgElm.alt = img.title;

    similarProductDiv.append(imgElm);

    imgElm.addEventListener("click", async () => {
      const response = await fetch(`${baseURL}/products/${img.id}`);
      const data = await response.json();
      renderProduct(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const addToCartBtn = document.querySelector(".add-to-cart");

  // Check if current item is already in cart
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const isInCart = cart.some(item => item.id === data.id);
  if (isInCart) {
    addToCartBtn.textContent = "Go to Cart";
  } else {
    addToCartBtn.textContent = "Add to Cart";
  }

  // Clone and replace button to remove old event listeners
  const newBtn = addToCartBtn.cloneNode(true);
  addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);

  newBtn.addEventListener("click", () => {
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
      newBtn.textContent = "Go to Cart";
    } else {
      window.location.href = "cart.html";
    }

    updateCartCount();
  });
};

// ----- Fetch product on page load -----
const fetchProduct = async () => {
  const response = await fetch(`${baseURL}/products/${id}`);
  const data = await response.json();
  renderProduct(data);
};

// Redirect to main page on brand name click
mainHeading.addEventListener("click", () => {
  window.location.href = "index.html";
});

document.addEventListener("DOMContentLoaded", fetchProduct);
