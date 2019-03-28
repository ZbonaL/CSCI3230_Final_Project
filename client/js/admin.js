$(document).ready(function () {
    $("#login-form").submit(function (event) {
        // Prevent the page from reloading
        event.preventDefault();

        // Get the user's info and attempt to log in
        let username = $("#username-input").val();
        let password = $("#password-input").val();
        login(username, password);
    });
});

// Login to the page to accept or deny changes made
function login(username, password) {
    $.ajax({
        url: "/login",
        method: "POST",
        data: { username: username, password: password },
        success: function (results) {
            // If logged in, display the results
            if (results.status == 1) {
                // Remove the old login page
                $("#login-page").remove();

                // Create the rows with the driver's names
                populateResults(results.results, $("#admin-results"), null);

                // For each row made
                let rows = $('.row');
                for (let row of rows) {
                    // Get the driver's name
                    let driver_fname = $(row).find('h3').text().split(" ")[0];
                    let driver_lname = $(row).find('h3').text().split(" ")[1];

                    // Find the driver's data
                    let driver_data = {};
                    for (let driver of results.results) {
                        if (driver.forename == driver_fname && driver.surname == driver_lname) {
                            driver_data = driver;
                            break;
                        }
                    }

                    // Append a button for the column and create the buttons
                    let button_col = $("<div class='col-1 mt-3 pl-2 text-center'></div>").appendTo(row);
                    let accept_change_btn = $("<button class='btn accept-change-btn f1-background'>✓</button>").appendTo(button_col);
                    let reject_change_btn = $("<button class='btn reject-change-btn mt-2 f1-background'>✕</button>").appendTo(button_col);

                    // Add the new changes to the main table
                    // also remove the changes from the "pending changes" table
                    accept_change_btn.click(function (event) {
                        let table = $(event.target).parentsUtil(".row").find("table");
                        let data = tableToJSON(table);
                        delete data.cookie_id;

                        // Send to db, update or add a new row
                        $.ajax({
                            url: "/updateDriver",
                            method: "POST",
                            data: data
                        });

                        // Remove old from db
                        $.ajax({
                            url: "/removeDriverChange",
                            method: "POST",
                            data: data
                        });

                        // Remove the card once done
                        $(table.parent()).remove();
                    });

                    // Remove the change from the "pending changes" table
                    reject_change_btn.click(function (event) {
                        let table = $(event.target).parentsUtil(".row").find("table");
                        let data = tableToJSON(table);
                        delete data.cookie_id;

                        // Send to db, remove row
                        $.ajax({
                            url: "/removeDriverChange",
                            method: "POST",
                            data: data
                        });

                        // Remove the card once done
                        $(table.parent()).remove();
                    });
                    // Append the table and populate it with the driver's info
                    let table = $("<table class='table'></table>").appendTo(row);
                    createTable(table, driver_data, false);
                }
            } else {
                // Display error message if they cant log in
                if($("#status-message")[0] == undefined){
                    $("<div class='row'><h6 id='status-message' class='f1-font'>Incorrect login, please try again.</h6></div>").appendTo($('.search-form'));
                }
                // Reset the input boxes
                $("#login-form")[0].reset();
            }
        }
    });
}


