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
        let query_type = form.find(".form-check > input:checked").val();

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
                for (let i = 0; i < result.length; i++) {
                    // The div for the row, image and name containers
                    let row = $("<div class='row result-card p-2 dropshadow'></div>").appendTo(results_div);
                    let image_col = $("<div class='col-2 pl-0'></div>").appendTo(row);
                    let result_col = $("<div class='col mt-3 pl-2'></div>").appendTo(row);

                    let pic_query = result[i]["forename"] + "+" + result[i]["surname"] + "+F1+picture";
                    getPicUrl(pic_query, function (data) {
                        $("<img class='driver-portrait driver-thumbnail' src=" + data.items[0].link + ">").appendTo(image_col);
                    });

                    // Append the drivers name and number
                    $("<h3 class='driver-name f1-font'>" + result[i].forename + " " + result[i].surname + "</h3>").appendTo(result_col);
                    $("<h6 class='f1-font'>#" + result[i].number + "</h6>").appendTo(result_col);


                    row.click(function () {
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
