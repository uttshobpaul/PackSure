document.addEventListener("DOMContentLoaded", function () {

    const searchInput =
        document.getElementById("violationSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const clearFiltersBtn =
        document.getElementById("clearFiltersBtn");

    const rows =
        document.querySelectorAll(".violation-row");

    const noSearchResults =
        document.getElementById("noSearchResults");


    function filterViolations() {

        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";

        const status =
            statusFilter
                ? statusFilter.value
                : "all";


        let visibleCount = 0;


        rows.forEach(function (row) {

            const product =
                row.dataset.product || "";

            const rowStatus =
                row.dataset.status || "";


            const matchesSearch =
                product.includes(search);


            const matchesStatus =
                status === "all" ||
                rowStatus === status;


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


        if (noSearchResults) {

            if (
                rows.length > 0 &&
                visibleCount === 0
            ) {

                noSearchResults.classList.add(
                    "show"
                );

            } else {

                noSearchResults.classList.remove(
                    "show"
                );

            }

        }

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterViolations
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterViolations
        );

    }


    if (clearFiltersBtn) {

        clearFiltersBtn.addEventListener(
            "click",
            function () {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "all";
                }

                filterViolations();

            }
        );

    }

});