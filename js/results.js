import Model from './updatedlist.js';

//Create listener for search queries
function searchListener(html = '') {
    const searchBtn = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');

    if (searchBtn && searchBar) {
        searchBtn.addEventListener('click', () => {
            const query = searchBar.value.trim().toLowerCase();
            window.location.href = html + `results.html?search=${encodeURIComponent(query)}`;
        });

        searchBar.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const query = searchBar.value.trim().toLowerCase();
                window.location.href = html + `results.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
}
export { searchListener };
searchListener();

document.addEventListener('DOMContentLoaded', () => {
    // Only run search code if the results container is present
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;

    const model = new Model();
    const loadMoreBtn = document.getElementById('load-more-btn');
    let currentIndex = 0;
    let allResults = model.data.results;
    let activeResults = allResults;
    let copyResults = activeResults;

    const params = new URLSearchParams(window.location.search);
    let query = params.get('search');

    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    loadMoreBtn.addEventListener('click', () => { displayResults(); });

    search(query);

    function search(query) {
        if (query) {
            activeResults = allResults.filter(result =>
                result.title.toLowerCase().includes(query) ||
                result.tags.toLowerCase().includes(query) ||
                result.contributor.join(', ').toLowerCase().includes(query) ||
                result.seller.toLowerCase().includes(query)
            );
        }
        else { activeResults = allResults; }
        copyResults = activeResults;
        displayResults();
    }

    function displayResults(restore = false) {
        if (currentIndex === 0 || restore) { resultsContainer.innerHTML = `<h2>Results for "${query}"</h2>`; }
        const batch = activeResults.slice(currentIndex, currentIndex + 20);

        if (batch.length === 0 && currentIndex === 0) {
            resultsContainer.innerHTML += `
                <div class="not-found">
                    <img src="../images/not_found.gif" alt="Not Found" width="300" />
                    <p>0 results found :(</p>
                </div>
            `;
            document.getElementById('load-more-btn').style.display = 'none';
            return;
        }

        batch.forEach(result => { resultsContainer.innerHTML += createCard(result); });

        resultsContainer.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', (event) => {
                const id = card.getAttribute('data-id');
                showCardDetails(id);
            });
        });

        currentIndex += 20;
        if (currentIndex >= activeResults.length) { document.getElementById('load-more-btn').style.display = 'none'; } 
        else { document.getElementById('load-more-btn').style.display = 'block'; }
    }


    function createCard(object) {
        const imageSrc = object.image_url?.[0] || '../images/placeholder.png';
        return `
          <div class="result-card" data-id="${object.itemID}" style="cursor: pointer;">
            <div class="thumbnail">
              <img src="${imageSrc}" alt="Cover for ${object.title}" />
            </div>
            <div class="info">
              <div class="title-rating">
                <h3>${object.title}</h3>
                <div class="tags">tags: ${object.tags}</div>
                <div class="stars">${'★'.repeat(Math.round(object.rating || 0))}</div>
              </div>
              <p>${object.description?.[0] || 'No description available.'}</p>
              <div class="seller">seller: ${object.seller}</div>
              <div class="price">price: $${Number(object.resell_price).toFixed(2)}</div>     
            </div>
          </div>
        `;
    }

    function showCardDetails(id) {
        const itemDetails = allResults.find(item => item.itemID == id);
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';

        const imageSrc = itemDetails.image_url?.[0] || '../images/placeholder.png';
        resultsContainer.innerHTML = `
          <div class="details-card">
            <div class="details-image">
              <img src="${imageSrc}" alt="Cover for ${itemDetails.title}" />
            </div>
            <div class="details-info">
              <div class="title-rating">
                <h2>${itemDetails.title}</h2>
                <div class="price">Price: $${Number(itemDetails.resell_price).toFixed(2)}</div>
                <div class="contributor">By: ${itemDetails.contributor.join(', ')}</div>
                <div class="stars">${'★'.repeat(Math.round(itemDetails.rating || 0))} ${itemDetails.rating.toFixed(1)}</div>
                <div class="tags">Tags: ${itemDetails.tags}</div>
              </div>
              <div class="details-description">
                <p>${itemDetails.description?.[0] || 'No description available.'}</p>
              </div>
              <div class="details-meta">
                <div class="seller">Seller: ${itemDetails.seller}</div>
                <div class="year">Year: ${itemDetails.date}</div>
              </div>
              <div class="details-actions">
                <button class="back-btn">← Back to Results</button>
                <button class="cart-btn">Add to Cart</button>
              </div>
            </div>
          </div>
        `;

        resultsContainer.querySelector('.back-btn').addEventListener('click', () => {
            resultsContainer.innerHTML = '';
            currentIndex = 0;
            displayResults(true);
            window.scrollTo(0, 0);
        });

        resultsContainer.querySelector('.cart-btn').addEventListener('click', () => {
            alert('item added to cart');
        });
    }

    function applyFilters() {
        const selectedTags = Array.from(
            document.querySelectorAll('input[name="tag"]:checked')
        ).map(cb => cb.value.toLowerCase());

        const minRating = parseFloat(document.getElementById('rating-filter')?.value) || 0;
        const minPrice = parseFloat(document.getElementById('min-price')?.value) || 0;
        const maxPrice = parseFloat(document.getElementById('max-price')?.value) || Infinity;

        activeResults = allResults.filter(result => {
            const tagMatch = selectedTags.length === 0 ||
                (result.tags && selectedTags.some(tag =>
                    result.tags.toLowerCase().includes(tag)
                ));

            const ratingMatch = result.rating >= minRating;
            const priceMatch = result.resell_price >= minPrice && result.resell_price <= maxPrice;
            return tagMatch && ratingMatch && priceMatch;
        });

        copyResults = activeResults;
        currentIndex = 0;
        query = 'Applied Filters';
        document.getElementById('results-container').innerHTML = '';
        displayResults();
        window.scrollTo(0, 0);
    }

    function clearFilters() {
        // Reset Filter section
        document.querySelectorAll('input[name="tag"]').forEach(cb => cb.checked = false);
        document.getElementById('rating-filter').value = '0';
        document.getElementById('min-price').value = '0';
        document.getElementById('max-price').value = '100';

        // Reset data and view
        query = '';
        activeResults = allResults;
        copyResults = allResults;
        currentIndex = 0;
        document.getElementById('results-container').innerHTML = '';
        document.getElementById('load-more-btn').style.display = 'block';
        displayResults();
        window.scrollTo(0, 0);
    }
});
