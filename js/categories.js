import { searchListener } from './results.js';

searchListener();

import Model from "./updatedlist.js";

const model = new Model();
const BOOKS_PER_ROW = 3;

const createBookCard = (item) => {
    return `
   <div class="book-card" data-id="${item.itemID}" tabindex="0">
     <img
       src="${item.image_url[0]}"
       alt="${item.title}"
       class="book-img"
       onerror="this.onerror=null; this.src='../images/placeholder.png';"
     />
     <div class="book-info">
       <h4 class="book-title">${item.title}</h4>
       <p class="book-author">${item.contributor ? item.contributor.join(", ") : "Unknown"
        }</p>
       <p class="book-meta">Published: ${item.date || "N/A"}</p>
       <p class="book-meta">Rating: ${item.rating || "0"} ★</p>
       <p class="book-meta">Seller: <strong>${item.seller || "N/A"}</strong></p>
       <p class="book-price">$${(item.resell_price || 0).toFixed(2)}</p>
     </div>
   </div>
 `;
};

const splitIntoRows = (items, perRow) => {
    const rows = [];
    for (let i = 0; i < items.length; i += perRow) {
        rows.push(items.slice(i, i + perRow));
    }
    return rows;
};

const showItemDetails = (id) => {
    const item = model.getAll().find((item) => item.itemID == id);

    document.querySelector(".card-navigation").style.display = "none";

    const contentContainer =
        document.querySelector(".content-container") ||
        document.querySelector(".cat-results");

    contentContainer.innerHTML = "";

    const imageSrc = item.image_url?.[0] || "./image/placeholder.png";
    contentContainer.innerHTML = `
    <div class="details-card">
      <div class="details-image">
        <img src="${imageSrc}" alt="Cover for ${item.title}" />
      </div>
      <div class="details-info">
        <div class="title-rating">
          <h2>${item.title}</h2>
          <div class="price">Price: $${Number(item.resell_price).toFixed(
        2
    )}</div>
          <div class="contributor">By: ${item.contributor.join(", ")}</div>
          <div class="stars">${"★".repeat(
        Math.round(item.rating || 0)
    )} ${item.rating.toFixed(1)}</div>
          <div class="tags">Tags: ${item.tags}</div>
        </div>
        <div class="details-description">
          <p>${item.description?.[0] || "No description available."}</p>
        </div>
        <div class="details-meta">
          <div class="seller">Seller: ${item.seller}</div>
          <div class="year">Year: ${item.date}</div>
        </div>
        <div class="details-actions">
          <button class="back-btn">← Back</button>
          <button class="cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

    contentContainer
        .querySelector(".back-btn")
        .addEventListener("click", backToHomepage);
    contentContainer.querySelector(".cart-btn").addEventListener("click", () => {
        addItemToCart(item);
    });
};

const addItemToCart = (item) => {
    import("./shopingcart.js")
        .then((module) => {
            const CartModel = module.default;
            const cartModel = new CartModel();
            cartModel.addToCart(item);
            alert(`${item.title} has been added to your cart!`);
        })
        .catch((error) => {
            console.error("Error importing CartModel:", error);
            alert(`${item.title} has been added to your cart!`);
        });
};

const backToHomepage = () => {
    const nav = document.querySelector(".card-navigation");
    if (nav) nav.style.display = "block";

    const container =
        document.querySelector(".content-container") ||
        document.querySelector(".cat-results");

    if (!container) return console.error("No container found to restore content");

    container.innerHTML = "";

    const isHomepage = document.querySelector(".content-container") !== null;

    if (isHomepage) {
        loadHomepageBooks();
    }
};

const loadHomepageBooks = () => {
    const contentContainer = document.querySelector(".content-container");
    contentContainer.innerHTML = "";

    const recommendedSection = document.createElement("div");
    recommendedSection.classList.add("books-section");

    const recommendedTitle = document.createElement("h3");
    recommendedTitle.classList.add("section-title");
    recommendedTitle.textContent = "Recommended For You";
    recommendedSection.appendChild(recommendedTitle);

    const allItems = model.getAll();
    const randomBooks = getRandomItems(allItems, 6);

    const bookRows = splitIntoRows(randomBooks, BOOKS_PER_ROW);

    bookRows.forEach((row, rowIndex) => {
        const booksRow = document.createElement("div");
        booksRow.classList.add("books-row");

        row.forEach((book, bookIndex) => {
            const bookCard = createBookCard(book);
            const bookWrapper = document.createElement("div");
            bookWrapper.innerHTML = bookCard;
            const actualCard = bookWrapper.firstElementChild;

            actualCard.style.animationDelay = `${rowIndex * 0.2 + bookIndex * 0.1}s`;

            booksRow.appendChild(actualCard);
        });

        recommendedSection.appendChild(booksRow);
    });

    contentContainer.appendChild(recommendedSection);

    const trendingSection = document.createElement("div");
    trendingSection.classList.add("books-section");
    trendingSection.style.marginTop = "40px";

    const trendingTitle = document.createElement("h3");
    trendingTitle.classList.add("section-title");
    trendingTitle.textContent = "Trending Now";
    trendingSection.appendChild(trendingTitle);

    const trendingBooks = getRandomItems(allItems, 3);
    const trendingRow = document.createElement("div");
    trendingRow.classList.add("books-row");

    trendingBooks.forEach((book, index) => {
        const bookCard = createBookCard(book);
        const bookWrapper = document.createElement("div");
        bookWrapper.innerHTML = bookCard;
        const actualCard = bookWrapper.firstElementChild;

        actualCard.style.animationDelay = `${0.7 + index * 0.1}s`;

        trendingRow.appendChild(actualCard);
    });

    trendingSection.appendChild(trendingRow);
    contentContainer.appendChild(trendingSection);

    document.querySelectorAll(".book-card").forEach((card) => {
        card.addEventListener("click", () => {
            const bookId = card.dataset.id;
            showItemDetails(bookId);
            console.log(`Book clicked: ${bookId}`);
        });
    });
};

document.addEventListener("click", (event) => {
    const card = event.target.closest(".feature-card");
    if (card) {
        const filter = card.dataset.filter;
        console.log("data-filter:", filter);
        categoryFilters(filter);
    }
});

function categoryFilters(filter) {
    const allItems = model.getAll();

    const filteredItems = allItems.filter((item) => {
        if (!item.tags) return false;
        return item.tags.toLowerCase().includes(filter.toLowerCase());
    });
    document
        .querySelector(".card-navigation")
        ?.style.setProperty("display", "none");

    renderFilteredBooks(filteredItems, filter);
}

const renderFilteredBooks = (items, tag) => {
    const isCategoryPage = document.querySelector(".cat-results") !== null;

    const container = isCategoryPage
        ? document.querySelector(".cat-results")
        : document.querySelector(".content-container");

    if (!container) return;

    container.innerHTML = "";

    const section = document.createElement("div");
    section.classList.add("books-section");

    const title = document.createElement("h3");
    title.classList.add("section-title");
    title.textContent = `Books tagged:`;
    section.appendChild(title);

    if (items.length === 0) {
        section.innerHTML += `<p>No books found for "${tag}".</p>`;
        container.appendChild(section);
        return;
    }

    const bookRows = splitIntoRows(items, BOOKS_PER_ROW);

    bookRows.forEach((row, rowIndex) => {
        const booksRow = document.createElement("div");
        booksRow.classList.add("books-row");

        row.forEach((book, bookIndex) => {
            const bookCard = createBookCard(book);
            const bookWrapper = document.createElement("div");
            bookWrapper.innerHTML = bookCard;
            const actualCard = bookWrapper.firstElementChild;

            actualCard.style.animationDelay = `${rowIndex * 0.2 + bookIndex * 0.1}s`;

            booksRow.appendChild(actualCard);
        });

        section.appendChild(booksRow);
    });

    container.appendChild(section);

    document.querySelectorAll(".book-card").forEach((card) => {
        card.addEventListener("click", () => {
            const bookId = card.dataset.id;
            showItemDetails(bookId);
        });
    });
};
