document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("inspectionForm");
    const fileInput = document.getElementById("product_image");
    const uploadBox = document.getElementById("uploadBox");
    const previewContainer = document.getElementById("preview-container");
    const imagePreview = document.getElementById("image-preview");
    const selectedFile = document.getElementById("selected-file");
    const inspectionButton = document.getElementById("inspectionBtn");
    const cameraBtn = document.getElementById("cameraBtn");
    const mediaBtn = document.getElementById("mediaBtn");

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
        "image/tiff"
    ];

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    let currentCameraStream = null;

    /* =====================================================
       FILE VALIDATION
    ===================================================== */

    function validateFile(file) {
        if (!file) {
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Invalid image format.\n\n" +
                "Please use JPG, JPEG, PNG, WEBP, BMP or TIFF."
            );
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert(
                "Image is too large.\n\n" +
                "Maximum allowed size is 10 MB."
            );
            return false;
        }

        return true;
    }

    /* =====================================================
       PUT FILE INTO DJANGO FORM INPUT
    ===================================================== */

    function setFileInput(file) {
        try {
            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(file);

            fileInput.files = dataTransfer.files;

            return true;
        } catch (error) {
            console.error("Could not attach file:", error);
            return false;
        }
    }

    /* =====================================================
       SHOW IMAGE PREVIEW
    ===================================================== */

    function showPreview(file) {
        if (!validateFile(file)) {
            return;
        }

        if (!setFileInput(file)) {
            alert(
                "The image could not be attached to the inspection form."
            );
            return;
        }

        const imageURL = URL.createObjectURL(file);

        imagePreview.src = imageURL;

        previewContainer.classList.add("show");

        const fileSizeMB = (
            file.size /
            (1024 * 1024)
        ).toFixed(2);

        if (selectedFile) {
            selectedFile.innerHTML =
                "Selected image: <strong>" +
                escapeHTML(file.name) +
                "</strong> (" +
                fileSizeMB +
                " MB)";
        }

        createRemoveButton();
    }

    /* =====================================================
       REMOVE IMAGE BUTTON
    ===================================================== */

    function createRemoveButton() {
        let removeButton =
            document.getElementById("removeImageBtn");

        if (removeButton) {
            return;
        }

        removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.id = "removeImageBtn";
        removeButton.className = "upload-action-btn";
        removeButton.textContent = "✕ Remove Image";

        previewContainer.appendChild(removeButton);

        removeButton.addEventListener(
            "click",
            removeImage
        );
    }

    /* =====================================================
       REMOVE IMAGE
    ===================================================== */

    function removeImage() {
        fileInput.value = "";

        imagePreview.src = "";

        previewContainer.classList.remove("show");

        if (selectedFile) {
            selectedFile.innerHTML = "";
        }

        const removeButton =
            document.getElementById("removeImageBtn");

        if (removeButton) {
            removeButton.remove();
        }
    }

    /* =====================================================
       CHOOSE IMAGE FROM COMPUTER
    ===================================================== */

    if (mediaBtn) {
        mediaBtn.addEventListener("click", function (event) {
            event.preventDefault();

            /*
             * Opens Windows File Explorer on desktop.
             * Opens gallery/media picker on mobile.
             */

            fileInput.click();
        });
    }

    /* =====================================================
       NORMAL FILE INPUT
    ===================================================== */

    if (fileInput) {
        fileInput.addEventListener("change", function () {
            const file = this.files[0];

            if (file) {
                showPreview(file);
            }
        });
    }

    /* =====================================================
       TAKE PHOTO BUTTON
    ===================================================== */

    if (cameraBtn) {
        cameraBtn.addEventListener("click", function (event) {
            event.preventDefault();

            openCamera();
        });
    }

    /* =====================================================
       OPEN CAMERA
    ===================================================== */

    async function openCamera() {
        /*
         * Check browser camera support.
         */

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            alert(
                "Your browser does not support camera access.\n\n" +
                "Please use a modern version of Chrome or Edge."
            );

            return;
        }

        /*
         * Request camera permission.
         */

        try {
            currentCameraStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    },
                    audio: false
                });

            createCameraModal(currentCameraStream);

        } catch (error) {
            console.error("Camera error:", error);

            let message =
                "Unable to access the camera.";

            if (error.name === "NotAllowedError") {
                message =
                    "Camera permission was denied.\n\n" +
                    "Please allow camera access in your browser and try again.";
            } else if (error.name === "NotFoundError") {
                message =
                    "No camera was found on this device.";
            } else if (error.name === "NotReadableError") {
                message =
                    "The camera is already being used by another application.";
            } else if (error.name === "SecurityError") {
                message =
                    "Camera access was blocked for security reasons.";
            }

            alert(message);
        }
    }

    /* =====================================================
       CAMERA MODAL
    ===================================================== */

    function createCameraModal(stream) {
        const oldModal =
            document.getElementById("cameraModal");

        if (oldModal) {
            oldModal.remove();
        }

        const modal =
            document.createElement("div");

        modal.id = "cameraModal";
        modal.className = "camera-modal";

        modal.innerHTML = `
            <div class="camera-modal-overlay"></div>

            <div class="camera-modal-box">

                <button
                    type="button"
                    class="camera-close"
                    id="cameraClose"
                    aria-label="Close camera">
                    ×
                </button>

                <div class="camera-modal-header">
                    <span class="camera-modal-icon">📷</span>

                    <div>
                        <h2>Take Product Photo</h2>

                        <p>
                            Position the product label clearly
                            inside the camera.
                        </p>
                    </div>
                </div>

                <div class="camera-preview-wrapper">

                    <video
                        id="cameraVideo"
                        autoplay
                        playsinline>
                    </video>

                    <div class="camera-guide">
                        <span></span>
                    </div>

                </div>

                <div class="camera-actions">

                    <button
                        type="button"
                        class="camera-cancel-btn"
                        id="cameraCancel">
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="camera-capture-btn"
                        id="capturePhotoBtn">
                        📷 Capture Photo
                    </button>

                </div>

                <canvas
                    id="cameraCanvas"
                    hidden>
                </canvas>

            </div>
        `;

        document.body.appendChild(modal);

        const video =
            document.getElementById("cameraVideo");

        video.srcObject = stream;

        /*
         * Close button
         */

        const closeButton =
            document.getElementById("cameraClose");

        closeButton.addEventListener(
            "click",
            function () {
                closeCamera();
            }
        );

        /*
         * Cancel button
         */

        const cancelButton =
            document.getElementById("cameraCancel");

        cancelButton.addEventListener(
            "click",
            function () {
                closeCamera();
            }
        );

        /*
         * Overlay
         */

        const overlay =
            modal.querySelector(
                ".camera-modal-overlay"
            );

        overlay.addEventListener(
            "click",
            function () {
                closeCamera();
            }
        );

        /*
         * Capture
         */

        const captureButton =
            document.getElementById(
                "capturePhotoBtn"
            );

        captureButton.addEventListener(
            "click",
            function () {
                capturePhoto(
                    video
                );
            }
        );
    }

    /* =====================================================
       CAPTURE CAMERA PHOTO
    ===================================================== */

    function capturePhoto(video) {
        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {
            alert(
                "Camera is not ready yet.\n\n" +
                "Please wait a moment and try again."
            );

            return;
        }

        const canvas =
            document.getElementById(
                "cameraCanvas"
            );

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;

        const context =
            canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            function (blob) {
                if (!blob) {
                    alert(
                        "Could not capture the photo."
                    );

                    return;
                }

                const file =
                    new File(
                        [blob],
                        "packsure-camera-photo.jpg",
                        {
                            type: "image/jpeg"
                        }
                    );

                showPreview(file);

                closeCamera();
            },
            "image/jpeg",
            0.92
        );
    }

    /* =====================================================
       CLOSE CAMERA
    ===================================================== */

    function closeCamera() {
        /*
         * Stop every camera track.
         */

        if (currentCameraStream) {
            currentCameraStream
                .getTracks()
                .forEach(function (track) {
                    track.stop();
                });

            currentCameraStream = null;
        }

        const modal =
            document.getElementById(
                "cameraModal"
            );

        if (modal) {
            modal.remove();
        }
    }

    /* =====================================================
       DRAG & DROP
    ===================================================== */

    if (uploadBox) {
        uploadBox.addEventListener(
            "dragenter",
            function (event) {
                event.preventDefault();

                uploadBox.classList.add(
                    "drag-over"
                );
            }
        );

        uploadBox.addEventListener(
            "dragover",
            function (event) {
                event.preventDefault();

                uploadBox.classList.add(
                    "drag-over"
                );
            }
        );

        uploadBox.addEventListener(
            "dragleave",
            function (event) {
                event.preventDefault();

                uploadBox.classList.remove(
                    "drag-over"
                );
            }
        );

        uploadBox.addEventListener(
            "drop",
            function (event) {
                event.preventDefault();

                uploadBox.classList.remove(
                    "drag-over"
                );

                const files =
                    event.dataTransfer.files;

                if (!files || !files.length) {
                    return;
                }

                showPreview(files[0]);
            }
        );
    }

    /* =====================================================
       FORM VALIDATION
    ===================================================== */

    if (form) {
        form.addEventListener(
            "submit",
            function (event) {
                const productName =
                    document.getElementById(
                        "product_name"
                    );

                if (
                    !productName ||
                    !productName.value.trim()
                ) {
                    event.preventDefault();

                    alert(
                        "Please enter the product name."
                    );

                    productName.focus();

                    return;
                }

                if (
                    !fileInput ||
                    !fileInput.files ||
                    !fileInput.files.length
                ) {
                    event.preventDefault();

                    alert(
                        "Please upload or capture a product image before starting the inspection."
                    );

                    return;
                }

                /*
                 * Prevent double submission.
                 */

                if (inspectionButton) {
                    inspectionButton.disabled = true;

                    inspectionButton.innerHTML =
                        "⏳ Analyzing Product...";

                    inspectionButton.style.opacity =
                        "0.75";

                    inspectionButton.style.cursor =
                        "wait";
                }
            }
        );
    }

    /* =====================================================
       ERROR MODAL
    ===================================================== */

    window.closeErrorModal = function () {
        const modal =
            document.getElementById(
                "errorModal"
            );

        if (modal) {
            modal.remove();
        }
    };

    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       ESC KEY CLOSES CAMERA
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                document.getElementById(
                    "cameraModal"
                )
            ) {
                closeCamera();
            }
        }
    );
});