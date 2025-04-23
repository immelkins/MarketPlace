import { searchListener } from './results.js';

searchListener();

const input = document.getElementById('imageInput');
const preview = document.getElementById('previewImage');

input.addEventListener('change', function () {
    const file = this.files[0];

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };

        reader.readAsDataURL(file);
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
});


// Checking if all required inputs are filled out before submitting
document.getElementById('add-new-listing').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default submission

    const form = event.target;

    if (form.checkValidity()) {
        // All required fields are filled — redirect to market.html
        window.location.href = 'market.html';
    } else {
        // Show validation error messages
        form.reportValidity();
    }
});

