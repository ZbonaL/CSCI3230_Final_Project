$(document).ready(function () {
    $(".search-form").submit(function (event) {
        // Prevent the page from reloading
        event.preventDefault();

        // The search form itself
        let form = $(event.target);
        // The string query
        let query = form.find("input").val();
        query = query.toLowerCase();
        query = query.charAt(0).toUpperCase() + query.slice(1);

        // Get the checked radio button
        let query_type = form.find(".custom-radio > input:checked").val();

        // The div for the results
        let results_div = $("#search-results");
        results_div.children().remove();

        $.ajax({
            url: "/query",
            method: "POST",
            data: {
                "query": query,
                "query_type": query_type
            },
            success: function (result) {
                // Check if we have any results
                if (result.length == 0) {
                    let row = $("<div class='row result-card f1-font p-2 dropshadow'></div>").appendTo(results_div);
                    row.text("No results found");
                } else {


                    populateResults(result, results_div, function () {
                        // Get the row clicked
                        let target = $(this);

                        // Get the name of the row
                        let name = target.find(".driver-name").text().split(" ");
                        // Redirect to the edit page
                        window.location.href = "/driver?forename=" + name[0] + "&surname=" + name[1];
                    });
                }
            },
            async: true
        });
    });
});
