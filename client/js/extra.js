/*
 * This class is used to store functions that are required by many 
 * functions on the site
 */
let google_key = "";

function getPicUrl(query, func, default_pic = false) {

    // Get the image of the driver from google
    $.get({
        url: "https://www.googleapis.com/customsearch/v1?key=" + google_key + "&cx=016545330576617661627:07nzt7b2mne&searchType=image&q=" + query,
        success: function (google_result) {
            if (default_pic) {
                // Fallback function, send a stock image in case it doesnt load
                func("img/defaultprofile.png");
            } else {
                // Return the link to the top image result
                func(google_result.items[0].link);
            }

        },
        error: function () {
            // Fallback function, send a stock image in case it doesnt load
            func("img/defaultprofile.png");
        }
        // ,
        // async: true
    });
}

// Fade text into a different value
function fadeInOut(text_element, value) {
    text_element.fadeOut(250, function () {
        $(this).text(value).fadeIn(250);
    })
}

function populateResults(result, location, onclick) {
    for (let i = 0; i < result.length; i++) {
        // The div for the row, image and name containers
        let row = $("<div class='row result-card p-2 dropshadow'></div>").appendTo(location);
        let image_col = $("<div class='col-2 pr-0 pl-0'></div>").appendTo(row);
        let result_col = $("<div class='col mt-3 pl-2'></div>").appendTo(row);

        let pic_query = result[i]["forename"] + "+" + result[i]["surname"] + "+F1+driver+picture";
        getPicUrl(pic_query, function (data) {
            $("<img class='driver-thumbnail' src=" + data + ">").appendTo(image_col);
        });

        // Append the drivers name and number
        $("<h3 class='driver-name f1-font'>" + result[i].forename + " " + result[i].surname + "</h3>").appendTo(result_col);
        $("<h6 class='f1-font'>#" + result[i].number + "</h6>").appendTo(result_col);


        row.click(onclick);
    }
}

function createTable(table, driver_data, edit = true) {
    // Iterate through every data point in the json
    for (let col in driver_data) {
        // Add it to the table
        let row = $("<tr></tr>");
        $("<th></th>").text(col).appendTo(row);
        $("<td></td>").text(driver_data[col]).appendTo(row);
        row.appendTo(table);

        // On enter keypress confirm
        row.on('keypress', function (event) {
            if (event.which == 13) {
                $(".confirm-btn").click();
            }
        });
    }
    if (edit) {
        enableTableEdit();
    }
}

function tableToJSON(table) {
    // Get the rows from the table
    let table_rows = table.find("tr");
    let json_data = {};

    // Iterate through the rows using 
    // the first column as the key into the json
    for (let row of table_rows) {
        let key = $($(row).children()[0]).text();
        json_data[key] = $($(row).children()[1]).text();
    }

    return json_data;
}