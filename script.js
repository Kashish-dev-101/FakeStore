"use strict";

// ----- DOM References -----
const productGrid = document.querySelector("#product-grid");
const categoryOptions = document.querySelector("#category-options");
const productHeading = document.querySelector("#product-heading");
const selectedCategories = new Set();

// ----- Config from config.js (loaded before this script) -----
const baseURL = CONFIG.FAKESTORE_BASE_URL;
const IK_URL_ENDPOINT = CONFIG.IK_URL_ENDPOINT;

// ----- Responsive image sizes matching the product grid layout -----
// Grid: repeat(auto-fill, minmax(250px, 1fr)) inside a flex layout with 200px sidebar
// ~3 columns on large screens, ~2 on medium, ~1 on small
const RESPONSIVE_SIZES =
  "(max-width: 540px) 100vw, (max-width: 900px) 45vw, (max-width: 1200px) 30vw, 25vw";

// Number of above-the-fold images that get high fetch priority
// (roughly the first row of the grid — 3-4 columns on desktop)
const ABOVE_FOLD_COUNT = 4;

/**
 * Extract the path from a FakeStoreAPI image URL for use with ImageKit.
 *
 * e.g. "https://fakestoreapi.com/img/81fPKd-2AYL.png" → "/img/81fPKd-2AYL.png"
 */
function getImagePath(fakeStoreUrl) {
  return new URL(fakeStoreUrl).pathname;
}

/**
 * Get responsive image attributes (src, srcSet, sizes) from ImageKit SDK.
 *
 * Generates a srcset with multiple width variants so the browser picks
 * the best size based on rendered width and device pixel ratio.
 */
function getResponsiveAttrs(imagePath) {
  return ImageKit.getResponsiveImageAttributes({
    urlEndpoint: IK_URL_ENDPOINT,
    src: imagePath,
    sizes: RESPONSIVE_SIZES,
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

// ----- Cart count sync -----
const updateCartCount = () => {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const cartCount = document.querySelector("#cart-count");
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
};

/**
 * Create and append a product card to the grid.
 *
 * @param {object} data     - Product object from FakeStoreAPI
 * @param {string} category - Category name (used as data attribute for filtering)
 * @param {number} index    - Position in the current render batch
 *
 * Loading strategy:
 * - First 4 images (above the fold): fetchpriority="high" for faster LCP
 * - Remaining images (below the fold): loading="lazy" to save bandwidth
 */
const renderProductCard = (data, category, index) => {
  const card = document.createElement("div");
  card.classList.add("product-card");
  card.setAttribute("data-category", category);

  const imgWrapper = document.createElement("div");
  imgWrapper.classList.add("image-zoom-container");

  const img = document.createElement("img");
  img.classList.add("product-images");

  // Build responsive image attributes via ImageKit SDK
  const imagePath = getImagePath(data.image);
  const responsive = getResponsiveAttrs(imagePath);

  if (responsive) {
    img.src = responsive.src;
    if (responsive.srcSet) img.setAttribute("srcset", responsive.srcSet);
    if (responsive.sizes) img.setAttribute("sizes", responsive.sizes);
  } else {
    img.src = buildImageKitUrl(imagePath);
  }

  // Above-the-fold: high priority for faster LCP
  // Below-the-fold: lazy load to defer downloading
  if (index < ABOVE_FOLD_COUNT) {
    img.fetchPriority = "high";
  } else {
    img.loading = "lazy";
  }

  img.alt = data.title;
  imgWrapper.append(img);

  const title = document.createElement("div");
  title.textContent = data.title;
  title.classList.add("product-title");

  const price = document.createElement("div");
  price.textContent = `$${data.price}`;
  price.classList.add("product-price");

  card.append(imgWrapper, title, price);
  productGrid.append(card);

  // Navigate to product detail page on image click
  img.addEventListener("click", () => {
    window.location.href = `product.html?id=${data.id}`;
  });
};

// ----- Fetch and render all products -----
const getProductData = async () => {
  const productData = await fetch(`${baseURL}/products`);
  const response = await productData.json();

  response.forEach((data, index) => renderProductCard(data, "", index));
};

// ----- Fetch categories and set up filter logic -----
const fetchCategories = async () => {
  const rawCategoryData = await fetch(`${baseURL}/products/categories`);
  const categoryData = await rawCategoryData.json();

  for (let category of categoryData) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const label = document.createElement("label");
    label.textContent = category;
    label.prepend(checkbox);
    categoryOptions.appendChild(label);

    checkbox.addEventListener("change", async () => {
      if (checkbox.checked) {
        selectedCategories.add(category);
      } else {
        selectedCategories.delete(category);
        document.querySelectorAll(`[data-category="${category}"]`).forEach((card) => {
          card.remove();
        });
      }

      const selectedList = Array.from(selectedCategories);
      if (selectedList.length > 0) {
        productHeading.innerText = selectedList.join(" / ");
      }

      // First category selected — clear grid and render that category
      if (selectedCategories.size === 1) {
        const urlEncCategory = encodeURIComponent(category);
        const categoryImages = await fetch(`${baseURL}/products/category/${urlEncCategory}`);
        const jsCategoryImages = await categoryImages.json();

        productGrid.innerHTML = "";
        jsCategoryImages.forEach((data, index) => renderProductCard(data, category, index));

      } else if (selectedCategories.size > 1) {
        // Additional category — append without clearing
        const urlEncCategory = encodeURIComponent(category);
        const categoryImages = await fetch(`${baseURL}/products/category/${urlEncCategory}`);
        const jsCategoryImages = await categoryImages.json();

        jsCategoryImages.forEach((data, index) => renderProductCard(data, category, index));

      } else {
        // No categories selected — fallback to all products
        productGrid.innerHTML = "";
        productHeading.innerText = "All Products";
        getProductData();
      }
    });
  }
};

// ----- Init on page load -----
document.addEventListener("DOMContentLoaded", getProductData);
document.addEventListener("DOMContentLoaded", fetchCategories);
document.addEventListener("DOMContentLoaded", updateCartCount);
