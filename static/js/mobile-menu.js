document.addEventListener("DOMContentLoaded", function () {

    const menuButton =
        document.getElementById("mobileMenuBtn");

    const overlay =
        document.getElementById("mobileMenuOverlay");

    const sidebar =
        document.querySelector(".sidebar");


    /* =========================================
       OPEN MENU
    ========================================= */

    function openMobileMenu() {

        document.body.classList.add(
            "mobile-menu-open"
        );

        if (menuButton) {
            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );

            menuButton.innerHTML = "✕";
        }
    }


    /* =========================================
       CLOSE MENU
    ========================================= */

    function closeMobileMenu() {

        document.body.classList.remove(
            "mobile-menu-open"
        );

        if (menuButton) {
            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            menuButton.innerHTML = "☰";
        }
    }


    /* =========================================
       TOGGLE MENU
    ========================================= */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            function () {

                if (
                    document.body.classList.contains(
                        "mobile-menu-open"
                    )
                ) {

                    closeMobileMenu();

                } else {

                    openMobileMenu();

                }

            }
        );

    }


    /* =========================================
       CLICK OUTSIDE
    ========================================= */

    if (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                closeMobileMenu();

            }
        );

    }


    /* =========================================
       CLOSE AFTER CLICKING MENU ITEM
    ========================================= */

    if (sidebar) {

        const links =
            sidebar.querySelectorAll("a");

        links.forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    closeMobileMenu();

                }
            );

        });

    }


    /* =========================================
       ESC KEY
    ========================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeMobileMenu();

            }

        }
    );


    /* =========================================
       RESET WHEN SCREEN BECOMES DESKTOP
    ========================================= */

    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 768) {

                closeMobileMenu();

            }

        }
    );

});