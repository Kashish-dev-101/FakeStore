"use-strict";

const baseURL = "https://fakestoreapi.com"
const productGrid = document.querySelector("#product-grid");
const categoryOptions = document.querySelector("#category-options");
const productHeading = document.querySelector("#product-heading");
const wishListCount = document.querySelector("#wishlist-count");
const selectedCategories = new Set();
let whishList = JSON.parse(localStorage.getItem("whishListItems")) || []; //Returns an Array



// Function to render the product Data
const renderProductCard = (data,category) => {
      console.log(data);
      console.log(category);
      const imageURL = data.image;
      console.log(imageURL);
      const cdnURL = imageURL.replace("https://fakestoreapi.com", "https://ik.imagekit.io/Kashish12345/WebApp"); // Implementing ImageKit CDN for performance
      console.log(cdnURL);
      //
      //console.log(imageURL);
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.setAttribute("data-category", category);

      //console.log(card);

      const img = document.createElement("img");
      img.classList.add("product-images");
      img.src = cdnURL;
      img.alt = data.title;
      img.loading = "lazy";

      const title = document.createElement("div");
      title.textContent = data.title;
      title.classList.add("product-title");

      const price = document.createElement("div");
      price.textContent = `$${data.price}`;
      price.classList.add("product-price");

      const wishlistBtn = document.createElement("button");
      wishlistBtn.classList.add("wishlist-button");
      wishlistBtn.innerHTML = '🤍 WISHLIST';
    
      
      productGrid.append(card);
      card.append(img);
      card.append(title);
      card.append(price);
      card.append(wishlistBtn);

    // Event listener to redirect to the product page when an Image is clicked 

    img.addEventListener("click", ()=>{
      console.log(data.id);
      window.location.href = `product.html?id=${data.id}`;
    })

      // Fucntion to be used in the Click WhishList handler (work in progress)
      wishlistBtn.addEventListener("click", ()=>{
      if(!whishList.includes(data.id)){
        whishList.push(data.id);
        localStorage.setItem("whishListItems", JSON.stringify(whishList));
        let count = Number(localStorage.getItem("whishListCount")) || 0; // returns count 
        count++;
        localStorage.setItem("whishListCount", count);
        wishListCount.textContent = count;

      }
    })
}


// Function to fetch and render the product Data
const getProductData = async()=>{
  const productData = await fetch(`${baseURL}/products`);
  console.log(productData);
  const response = await productData.json();
  console.log(response);

  for (let data of response ){
      console.log(data);
      renderProductCard(data);
  }
}

// Function to fetch the categories using the API and then add it to the HTML also it takes care of multiple catrgory selection

const fetchCategories = async () => {
  const rawcategorydata = await fetch(`${baseURL}/products/categories`);
  console.log(rawcategorydata);
  const categoryData = await rawcategorydata.json();
  console.log(categoryData); // This part fetches the category options

  for (let category of categoryData) {
    console.log(category);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const label = document.createElement("label");
    label.textContent = category;
    label.prepend(checkbox);
    categoryOptions.appendChild(label);

    // logic for display product when a category is checked or unchecked
    
    checkbox.addEventListener("change", async () => {
      if (checkbox.checked) {
        selectedCategories.add(category); // add categories to a Set when a checkbox is checked 
      } else {
        selectedCategories.delete(category);
        document.querySelectorAll(`[data-category="${category}"]`).forEach((card) => {
          card.remove();
        });
      }

      const selectedList = Array.from(selectedCategories); // convert the set to an Array using from method
      console.log(selectedList);
      if (selectedList.length > 0) { // condition to create a string if the size of the Array is greater than 0 
        productHeading.innerText = selectedList.join(" / ");
      }

      // condition to check if the first checkbox is clicked and making the HTML grid empty for that before rendering the elements 
      if (selectedCategories.size === 1) {
        const urlEncCategory = encodeURIComponent(category);
        const categoryImages = await fetch(`${baseURL}/products/category/${urlEncCategory}`);
        const jsCategoryImages = await categoryImages.json();
        //console.log(jsCategoryImages);

        productGrid.innerHTML = "";

        for (let data of jsCategoryImages) {
          renderProductCard(data, category);
        }

      } else if (selectedCategories.size > 1) {
        const urlEncCategory = encodeURIComponent(category);
        const categoryImages = await fetch(`${baseURL}/products/category/${urlEncCategory}`);
        const jsCategoryImages = await categoryImages.json();
        //console.log(jsCategoryImages);

        for (let data of jsCategoryImages) {
          renderProductCard(data, category);
        }

      } else {
        // condition when no categories are selected (Set size = 0)
        productGrid.innerHTML = "";
        productHeading.innerText = "All Products";
        getProductData(); // fallback to initial full product view
      }
    });
  }
};





// Event Listener to show product Images when the page is loaded
document.addEventListener("DOMContentLoaded", getProductData);
document.addEventListener("DOMContentLoaded", fetchCategories);




