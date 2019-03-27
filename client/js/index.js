$(document).ready(function () {
    // Set the driver amount on the main screen
    set_driver_amount($("#driver-amount"));
});

// Set the driver amount and prep the function to be called again
function set_driver_amount(location) {
    console.log("Getting driver amount");
    $.ajax({
        method: "GET",
        url: "/driveramount",
        success: function (result) {
            location.text(result.amount);
            setTimeout(function () {
                set_driver_amount($("#driver-amount"));
            }, 30000);
        }
    });
}
