document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =========================================================
       PackSure — Inspection Result Page
       Works with the Django inspection_result.html template.
       No demo/sample data is generated here.
       ========================================================= */

    /* ---------------------------------------------------------
       Back button
       --------------------------------------------------------- */

    const backBtn = document.getElementById("backBtn");

    if (backBtn) {
        backBtn.addEventListener("click", function () {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = "/";
            }
        });
    }


    /* ---------------------------------------------------------
       Mobile menu
       --------------------------------------------------------- */

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.querySelector(".sidebar");

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", function () {
            sidebar.classList.toggle("mobile-open");
            document.body.classList.toggle("menu-open");
        });
    }


    /* ---------------------------------------------------------
       Close mobile menu when clicking outside
       --------------------------------------------------------- */

    document.addEventListener("click", function (event) {
        if (!sidebar || !menuBtn) {
            return;
        }

        if (
            sidebar.classList.contains("mobile-open") &&
            !sidebar.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {
            sidebar.classList.remove("mobile-open");
            document.body.classList.remove("menu-open");
        }
    });


    /* ---------------------------------------------------------
       Close mobile menu after clicking a navigation link
       --------------------------------------------------------- */

    document.querySelectorAll(".sidebar .nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.innerWidth <= 900 && sidebar) {
                sidebar.classList.remove("mobile-open");
                document.body.classList.remove("menu-open");
            }
        });
    });


    /* ---------------------------------------------------------
       Evidence image
       --------------------------------------------------------- */

    const evidenceImage = document.querySelector(
        ".evidence-image-container img"
    );

    if (evidenceImage) {

        evidenceImage.addEventListener("click", function () {

            const imageUrl = evidenceImage.src;

            if (!imageUrl) {
                return;
            }

            const overlay = document.createElement("div");

            overlay.className = "image-preview-overlay";

            overlay.innerHTML = `
                <div class="image-preview-content">
                    <button type="button"
                            class="image-preview-close"
                            aria-label="Close image">
                        ×
                    </button>

                    <img src="${imageUrl}"
                         alt="Product evidence preview">
                </div>
            `;

            document.body.appendChild(overlay);

            requestAnimationFrame(function () {
                overlay.classList.add("visible");
            });

            const closeButton = overlay.querySelector(
                ".image-preview-close"
            );

            function closePreview() {
                overlay.classList.remove("visible");

                setTimeout(function () {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 200);
            }

            closeButton.addEventListener("click", closePreview);

            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) {
                    closePreview();
                }
            });

            document.addEventListener("keydown", function escapeHandler(event) {
                if (event.key === "Escape") {
                    closePreview();
                    document.removeEventListener(
                        "keydown",
                        escapeHandler
                    );
                }
            });
        });

        evidenceImage.style.cursor = "zoom-in";
    }


    /* ---------------------------------------------------------
       Smooth scrolling for internal links
       --------------------------------------------------------- */

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });


    /* ---------------------------------------------------------
       Declaration / violation row interaction
       --------------------------------------------------------- */

    document.querySelectorAll(".inspection-row").forEach(function (row) {

        row.addEventListener("mouseenter", function () {
            row.classList.add("row-hover");
        });

        row.addEventListener("mouseleave", function () {
            row.classList.remove("row-hover");
        });
    });


    /* ---------------------------------------------------------
       Result status animation
       --------------------------------------------------------- */

    const resultStatus = document.querySelector(".result-status");

    if (resultStatus) {

        resultStatus.classList.add("result-status-ready");

        const score = resultStatus.querySelector(".result-score strong");

        if (score) {
            score.classList.add("score-ready");
        }
    }


    /* ---------------------------------------------------------
       Compliance score animation
       --------------------------------------------------------- */

    const scoreElement = document.querySelector(
        ".result-score strong"
    );

    if (scoreElement) {

        const scoreText = scoreElement.textContent.trim();

        const numericScore = parseInt(
            scoreText.replace("%", ""),
            10
        );

        if (!Number.isNaN(numericScore)) {

            let currentScore = 0;

            scoreElement.textContent = "0%";

            const duration = 900;
            const startTime = performance.now();

            function animateScore(currentTime) {

                const elapsed = currentTime - startTime;

                const progress = Math.min(
                    elapsed / duration,
                    1
                );

                currentScore = Math.round(
                    numericScore * progress
                );

                scoreElement.textContent =
                    currentScore + "%";

                if (progress < 1) {
                    requestAnimationFrame(animateScore);
                }
            }

            requestAnimationFrame(animateScore);
        }
    }


    /* ---------------------------------------------------------
       PDF report button
       --------------------------------------------------------- */

    const reportButton = document.querySelector(
        'a[href*="generate_report"]'
    );

    if (reportButton) {

        reportButton.addEventListener("click", function () {

            reportButton.classList.add("loading");

            const originalText = reportButton.innerHTML;

            reportButton.innerHTML = "Generating Report...";

            setTimeout(function () {

                reportButton.classList.remove("loading");

                reportButton.innerHTML = originalText;

            }, 3000);
        });
    }


    /* ---------------------------------------------------------
       New inspection button protection
       --------------------------------------------------------- */

    document.querySelectorAll(
        'a[href*="scan_product"]'
    ).forEach(function (button) {

        button.addEventListener("click", function () {

            button.classList.add("button-clicked");

        });
    });


    /* ---------------------------------------------------------
       Notification button
       --------------------------------------------------------- */

    const notificationButton = document.querySelector(
        ".notification-btn"
    );

    if (notificationButton) {

        notificationButton.addEventListener("click", function () {

            const existingNotification =
                document.querySelector(".notification-popup");

            if (existingNotification) {
                existingNotification.remove();
                return;
            }

            const popup = document.createElement("div");

            popup.className = "notification-popup";

            popup.innerHTML = `
                <div class="notification-popup-header">
                    <strong>Notifications</strong>
                    <button type="button"
                            class="notification-close">
                        ×
                    </button>
                </div>

                <div class="notification-popup-body">
                    <p>No new notifications.</p>
                </div>
            `;

            document.body.appendChild(popup);

            const closeButton =
                popup.querySelector(".notification-close");

            closeButton.addEventListener("click", function () {
                popup.remove();
            });
        });
    }


    /* ---------------------------------------------------------
       Responsive resize handling
       --------------------------------------------------------- */

    window.addEventListener("resize", function () {

        if (window.innerWidth > 900 && sidebar) {

            sidebar.classList.remove("mobile-open");

            document.body.classList.remove("menu-open");
        }
    });


    /* ---------------------------------------------------------
       Scroll reveal
       --------------------------------------------------------- */

    const revealElements = document.querySelectorAll(
        ".result-card, .panel, .result-status, .result-actions"
    );

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "reveal-visible"
                        );

                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.08
            }
        );

        revealElements.forEach(function (element) {

            element.classList.add("reveal-element");

            observer.observe(element);
        });
    } else {

        revealElements.forEach(function (element) {
            element.classList.add("reveal-visible");
        });
    }


    /* ---------------------------------------------------------
       Prevent accidental double-click on report buttons
       --------------------------------------------------------- */

    document.querySelectorAll(".primary-btn, .secondary-btn")
        .forEach(function (button) {

            button.addEventListener("dblclick", function (event) {
                event.preventDefault();
            });
        });


    /* ---------------------------------------------------------
       Page ready
       --------------------------------------------------------- */

    document.body.classList.add("inspection-page-ready");

});