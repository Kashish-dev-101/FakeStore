"use-strict";

const cartItemsContainer = document.querySelector("#cart-items-container");
console.log(cartItemsContainer);

const itemCountCart = document.querySelector("#total-items");
console.log(itemCountCart);

const totalPriceCart = document.querySelector("#total-price");
console.log(totalPriceCart);

const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [] ;
let totalCost = 0;

const mainHeading = document.querySelector("#main-heading");
console.log(mainHeading);

for (item of cartItems){
    console.log(item);

    totalCost += item.price;
    console.log(totalCost);

    const card = document.createElement("div");
    card.classList.add("product-card");

    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("image-zoom-container");

    const img = document.createElement("img");
    img.classList.add("product-images");
    img.src = item.image;
    img.alt = item.title;
    img.loading = "lazy";
    imgWrapper.append(img);

    cartItemsContainer.append(card);
    card.append(imgWrapper);

    const details = document.createElement("div");
    details.classList.add("cart-item-details");

    const title = document.createElement("h4");
    title.textContent = item.title;

    const price = document.createElement("p");
    price.textContent = `$${item.price}`;

    details.append(title, price);
    card.append(details); // append after image

    itemCountCart.textContent = cartItems.length; 
    console.log(itemCountCart.textContent);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.classList.add("remove-btn");

    removeBtn.setAttribute("data-id", item.id);

    //card.append(removeBtn);
    removeBtn.addEventListener("click", (evt)=>{
        console.log(evt.target);
        console.log("remove button was clicked");
        const idToRemove = item.id;

        const updatedCart = cartItems.filter(cartItem => cartItem.id !== idToRemove)
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        location.reload();
    })
    card.appendChild(removeBtn);
    cartItemsContainer.appendChild(card);

}

totalPriceCart.textContent = `$${Math.floor(totalCost)}`;


const mainPageRed = () => {
    window.location.href = "index.html";
  };





mainHeading.addEventListener("click", mainPageRed);