document.addEventListener("DOMContentLoaded", function () {

    /*
     * Reports page
     *
     * This JavaScript currently provides
     * small UI enhancements only.
     */


    /* =====================================================
       PDF BUTTON
    ===================================================== */

    const downloadButtons =
        document.querySelectorAll(".download-btn");


    downloadButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const originalText =
                button.innerHTML;

            button.innerHTML =
                "Generating...";

            button.style.pointerEvents =
                "none";


            /*
             * Allow browser to start
             * the PDF request.
             */

            setTimeout(function () {

                button.innerHTML =
                    originalText;

                button.style.pointerEvents =
                    "";

            }, 1500);

        });

    });



    /* =====================================================
       SCORE BAR ANIMATION
    ===================================================== */

    const scoreBars =
        document.querySelectorAll(".score-fill");


    scoreBars.forEach(function (bar) {

        const targetWidth =
            bar.style.width;

        bar.style.width = "0";


        setTimeout(function () {

            bar.style.width =
                targetWidth;

        }, 100);

    });

});