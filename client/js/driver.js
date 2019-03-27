$(document).ready(function () {
    // Get the current driver's name
    let driver_name = $("#driver-name").text();

    if (driver_name == "New Driver" || driver_name == "Driver Not Found") {
        // Default image here
    } else {
        // Append the driver picture
        getPicUrl(driver_name, function (data) {
            $("<img class='driver-portrait' src=" + data.items[0].link + ">").appendTo($("#driver-image"));
        });

        $(".update-btn").click(function () {
            // update db here
            let test = updateDB($(".table"));
            console.log(test);


            $.ajax({
                url: "/driverupdates",
                method: "POST",
                data: updateDB($(".table")),
            })
        });

        $.ajax({
            url: "/driverdetails",
            method: "POST",
            data: {
                "forename": driver_name.split(" ")[0],
                "surname": driver_name.split(" ")[1]
            },
            success: function (result) {
                // Get the driver's results
                let driver_data = result[0];

                // Add the driver's data into the table
                let table = $(".table");
                for (let col in driver_data) {
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

                // Allow the rows to be edited
                $(".table").click(function (event) {
                    // Get the clicked element
                    let target = $(event.target);

                    // Remove all the previously selected rows
                    removeSelected($(".table"), $(target.parent()), true);

                    // If the row is not already selected
                    if (target.prop("tagName") == "TD" && !event.target.isContentEditable) {
                        // Get the original text
                        let original_content = target.text();
                        // Make a button to confirm the row edit
                        let confirm_button = $('<input type="button" value="confirm" class="f1-font btn btn-danger confirm-btn"/>');

                        // Set the column to be editable
                        target.attr('contenteditable', true);
                        // Focus on the newly editable content
                        target.focus();
                        // Set the id of the td to the previous val
                        target.prop("id", original_content);

                        // On click, change the value of the button and remove the id
                        confirm_button.click(function (event) {
                            removeSelected($(".table"), $($(event.target).parent()));
                        });
                        // Append the button to the row
                        confirm_button.appendTo($(target.parent()));
                    }
                })
            }
        });
    }
});

// Deselect the table if clicking anywhere
$(document).click(function (event) {
    // Get the clicked element
    let target = $(event.target);

    // Remove all the previously selected rows
    removeSelected($(".table"), $(target.parent()), true);
});

function removeSelected(element, target_parent, revert_val) {
    // Get all the contenteditable tds
    let editable_tds = element.find("td[contenteditable='true']");
    for (let i = 0; i < editable_tds.length; i++) {
        // Get the specific td
        let td = $(editable_tds[i]);

        // If the td is not the same as the current one or we are updating the value
        if (!$(td.parent()).is(target_parent) || !revert_val) {
            // If we are reverting the value copy the id back into the element
            if (revert_val) {
                let original_val = td.prop("id");
                if (original_val != td.text()) {
                    // Animate the text fading out
                    fadeInOut(td, original_val);
                }
            }
            // Remove the id and the contenteditable attributes
            td.removeAttr('id');
            td.removeAttr('contenteditable');
            // Remove the confirm button
            $(td.parent()).find(".confirm-btn").remove();
        }
    }
}

function updateDB(table) {
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