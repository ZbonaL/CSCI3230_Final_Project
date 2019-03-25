$(document).ready(function () {
    let driver_name = $("#driver-name").text();

    // Append the driver picture
    if (driver_name == "New Driver" || driver_name == "Driver Not Found") {
        // Default image here
    } else {
        getPicUrl(driver_name, function (data) {
            $("<img class='driver-portrait driver-thumbnail' src=" + data.items[0].link + ">").appendTo($("#driver-image"));
        });
    }
});