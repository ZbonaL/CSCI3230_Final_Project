$(document).ready(function () {
    // Get the current driver's name
    let driver_name = $("#driver-name").text();

    $(".update-btn").click(function () {
        // Show the dialog
        $("#confirm-modal").modal('show');
    });
    // If the user clicks no in the modal, just hide the modal
    $("#modal-no-btn").click(function () {
        $("#confirm-modal").modal('hide');
    });
    // If the user clicks yes in the modal, hide the modal and send the data
    $("#modal-yes-btn").click(function () {
        $("#confirm-modal").modal('hide');
        $.ajax({
            url: "/addToReview",
            method: "POST",
            data: tableToJSON($(".table")),
        });
    });

    if (driver_name == "New Driver" || driver_name == "Driver Not Found") {
        // Append the default picture
        getPicUrl(driver_name, function (data) {
            $("<img class='driver-portrait' src=" + data + ">").appendTo($("#driver-image"));
        }, true);

        if (driver_name == "New Driver") {
            $.ajax({
                url: "/columns",
                method: "GET",
                success: function (result) {
                    // Get the driver's results
                    let driver_data = result;
                    // Add the driver's data into the table
                    let table = $(".table");
                    createTable(table, driver_data);
                }
            });
        } else {
            $(".update-btn").hide();
        }
    } else {
        // Append the google image picture
        getPicUrl(driver_name, function (data) {
            $("<img class='driver-portrait' src=" + data + ">").appendTo($("#driver-image"));
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
                createTable(table, driver_data);
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


function enableTableEdit() {
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
            let confirm_button = $('<input type="button" value="✓" class="f1-font btn btn-danger confirm-btn"/>');

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
    });
}