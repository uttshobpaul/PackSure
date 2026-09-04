console.log("PackSure application loaded successfully.");

const imageInput = document.getElementById("product_image");
const previewContainer = document.getElementById("preview-container");
const imagePreview = document.getElementById("image-preview");

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (file) {

            imagePreview.src = URL.createObjectURL(file);

            previewContainer.style.display = "block";
        }

    });

}