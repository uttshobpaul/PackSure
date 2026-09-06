document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const searchInput =
        document.getElementById("productSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const productRows =
        document.querySelectorAll(".product-row");

    const noSearchResult =
        document.getElementById("noSearchResult");

    const addProductBtn =
        document.getElementById("addProductBtn");

    const productModal =
        document.getElementById("productModal");

    const closeProductModal =
        document.getElementById("closeProductModal");

    const cancelProductBtn =
        document.getElementById("cancelProductBtn");

    const modalOverlay =
        document.querySelector(".product-modal-overlay");


    /* =====================================================
       UPDATE STATISTICS
    ===================================================== */

    function updateStatistics() {

        let total = 0;
        let compliant = 0;
        let violation = 0;
        let highRisk = 0;

        productRows.forEach(function (row) {

            total++;

            const status =
                row.dataset.status;

            if (status === "compliant") {
                compliant++;
            }

            if (status === "violation") {
                violation++;
            }

            if (status === "high_risk") {
                highRisk++;
            }

        });


        const totalElement =
            document.getElementById("totalProducts");

        const compliantElement =
            document.getElementById("compliantProducts");

        const violationElement =
            document.getElementById("violationProducts");

        const highRiskElement =
            document.getElementById("highRiskProducts");


        if (totalElement) {
            totalElement.textContent = total;
        }

        if (compliantElement) {
            compliantElement.textContent = compliant;
        }

        if (violationElement) {
            violationElement.textContent = violation;
        }

        if (highRiskElement) {
            highRiskElement.textContent = highRisk;
        }
    }


    updateStatistics();


    /* =====================================================
       SEARCH + FILTER
    ===================================================== */

    function filterProducts() {

        const searchValue =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";

        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "all";


        let visibleCount = 0;


        productRows.forEach(function (row) {

            const productName =
                row.dataset.name || "";

            const productStatus =
                row.dataset.status || "";


            const matchesSearch =
                productName.includes(searchValue);


            const matchesStatus =
                selectedStatus === "all" ||
                productStatus === selectedStatus;


            if (
                matchesSearch &&
                matchesStatus
            ) {

                row.style.display = "";
                visibleCount++;

            } else {

                row.style.display = "none";

            }

        });


        if (noSearchResult) {

            if (
                productRows.length > 0 &&
                visibleCount === 0
            ) {

                noSearchResult.classList.add(
                    "show"
                );

            } else {

                noSearchResult.classList.remove(
                    "show"
                );

            }
        }
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterProducts
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    /* =====================================================
       MODAL
    ===================================================== */

    function openModal() {

        if (!productModal) {
            return;
        }

        productModal.classList.add("show");

        productModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    }


    function closeModal() {

        if (!productModal) {
            return;
        }

        productModal.classList.remove("show");

        productModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    }


    if (addProductBtn) {

        addProductBtn.addEventListener(
            "click",
            openModal
        );

    }


    if (closeProductModal) {

        closeProductModal.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelProductBtn) {

        cancelProductBtn.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeModal
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeModal();

            }

        }
    );

});