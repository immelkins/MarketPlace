import Model from "./updatedlist.js";
import { searchListener } from './results.js';

searchListener();

document.addEventListener('DOMContentLoaded', () => {

    const model = new Model();
    const LISTINGS_PER_ROW = 3;

    const getRandomNumber = (max = 500) => {
        return Math.floor(Math.random() * (max + 1));
    };

    const getRandomItems = (list, count = 10) => {
        const result = [];
        const listCopy = [...list];
        const listLength = listCopy.length;

        if (count >= listLength) {
            return listCopy.sort(() => 0.5 - Math.random());
        }

        for (let i = 0; i < count; i++) {
            if (listCopy.length === 0) break;

            const randomIndex = getRandomNumber(listCopy.length - 1);

            const item = listCopy.splice(randomIndex, 1)[0];
            result.push(item);
        }

        return result;
    };

    const createListingCard = (item) => {
        return `
   <div class="listing-card" data-id="${item.id}" tabindex="0">
     <img
       src="${item.image_url[0]}"
       alt="${item.title}"
       class="listing-img"
       onerror="this.onerror=null; this.src='../images/placeholder.png';"
     />
     <div class="listing-info">
       <h4 class="listing-title">${item.title}</h4>
       <p class="listing-author">${item.contributor ? item.contributor.join(", ") : "Unknown"
            }</p>
       <p class="listing-meta">Published: ${item.date || "N/A"}</p>
       <p class="listing-meta">Rating: ${item.rating || "0"} ★</p>
       <p class="listing-meta">Seller: <strong>${item.seller || "N/A"
            }</strong></p>
       <p class="listing-price">$${(item.resell_price || 0).toFixed(2)}</p>
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

    const loadListings = () => {
        const listingsContainer = document.getElementById("listings-container");

        const headingText = document.querySelector("#listing-text");
        listingsContainer.innerHTML = "";
        listingsContainer.appendChild(headingText);

        const allItems = model.getAll();
        const randomListings = getRandomItems(allItems, 9);

        const listingRows = splitIntoRows(randomListings, LISTINGS_PER_ROW);

        listingRows.forEach((row, rowIndex) => {
            const listingsRow = document.createElement("div");
            listingsRow.classList.add("listings-row");

            row.forEach((listing, listingIndex) => {
                const listingCard = createListingCard(listing);
                const listingWrapper = document.createElement("div");
                listingWrapper.innerHTML = listingCard;
                const actualCard = listingWrapper.firstElementChild;

                actualCard.style.animationDelay = `${rowIndex * 0.2 + listingIndex * 0.1
                    }s`;

                listingsRow.appendChild(actualCard);
            });

            listingsContainer.appendChild(listingsRow);
        });
    };

    const initMarketpage = () => {
        loadListings();
    };
    initMarketpage();
});
