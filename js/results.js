import Model from './updatedlist.js';

function searchListener(html = '') {
    const searchBtn = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');

    if (searchBtn && searchBar) {
        searchBtn.addEventListener('click', () => {
            const query = searchBar.value.trim().toLowerCase();
            console.log('Search button clicked with query:', query); // ✅ test log
            window.location.href = html + `results.html?search=${encodeURIComponent(query)}`;
        });

        searchBar.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const query = searchBar.value.trim().toLowerCase();
                console.log('Enter pressed with query:', query); // ✅ test log
                window.location.href = html + `results.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
}
export { searchListener };
searchListener();