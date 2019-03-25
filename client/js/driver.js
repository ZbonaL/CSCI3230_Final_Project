$(document).ready(function () {
    let driver_name = $("#driver-name").text();

    // Append the driver picture
    if (driver_name == "New Driver" || driver_name == "Driver Not Found") {
        // Default image here
    } else {
        getPicUrl(driver_name, function (data) {
            $("<img class='driver-portrait driver-thumbnail' src=" + data.items[0].link + ">").appendTo($("#driver-image"));
        });


        $.ajax({
            url: "/driverdetails",
            method: "POST", 
            data: {"forename": driver_name.split(" ")[0], 
                    "surname":driver_name.split(" ")[1] },
            success: function(result){
                let driver_data = result[0];
                console.log(driver_data);

                let table = $(".table");
                for(let col in driver_data){
                    let row = $("<tr></tr>");
                    $("<th></th>").text(col).appendTo(row);
                    $("<td></td>").text(driver_data[col]).appendTo(row);
                    row.appendTo(table);    
                }

                $(".table").mousedown(function(event){
                    let target = $(event.target)
                    removeSelected($(".table"));

                    if(target.prop("tagName") == "TD"){
                        let confirmButton = $('<input type="button" value="confirm" class="confirm-btn"/>')
                        target.attr('contenteditable', true)
                        target.append(confirmButton)
                    }
                })
            }
        });
    }
});