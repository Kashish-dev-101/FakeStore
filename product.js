"use-strict";

const queryString = new URLSearchParams(window.location.search);
console.log(queryString);

const id = queryString.get("id")
console.log(id);

baseURL = "https://fakestoreapi.com";

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

// Function to reneder product:

const renderProduct = async(data)=>{
    similarProductDiv.innerHTML = "";

    console.log(data.image);
    productImage.src = data.image;
    console.log(data.title);
    productTitle.textContent = data.title;
    console.log(data.description);
    productDescription.textContent = data.description; 
    console.log(data.price);
    productPrice.textContent = `$${data.price}`

    ratingValue.textContent = data.rating.rate;
    ratingCount.textContent = `${data.rating.count} Ratings`;
    
    console.log(data.category);
    const urlEncCategory = encodeURIComponent(data.category);
    console.log(urlEncCategory);
    const categoryImages = await fetch(`${baseURL}/products/category/${urlEncCategory}`);
    const jsCategoryImages = await categoryImages.json();
    console.log(jsCategoryImages);
    for(let img of jsCategoryImages)
    {
        console.log(img.image);
        const imgElm = document.createElement("img");
        imgElm.src = img.image;
        similarProductDiv.append(imgElm);
        imgElm.addEventListener("click", async()=>{
            const response = await fetch(`${baseURL}/products/${img.id}`);
            console.log(response);
            const data = await response.json();
            console.log(data);
            renderProduct(data);
        })
        
    }

}



// function to fetch the product of the given ID
const fetchProduct = async()=>{
      const response = await fetch(`${baseURL}/products/${id}`);
      console.log(response);
      const data = await response.json();
      console.log(data);
      renderProduct(data);
        
}

const mainPageRed = () =>{
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", fetchProduct);
mainHeading.addEventListener("click", mainPageRed);

