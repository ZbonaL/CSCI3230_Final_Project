/**
 * This class is used to store functions that are required by many 
 * functions on the site`
 */

let google_key = "AIzaSyBphDItx-Lx0JtGqGfPmgg3BV34iLiN08s";

function getPicUrl(query, func) {

    // Get the image of the driver from google
    $.get({
        url: "https://www.googleapis.com/customsearch/v1?key=" + google_key + "&cx=016545330576617661627:07nzt7b2mne&searchType=image&q=" +query,
        success: function (google_result) {
            func(google_result);
        }
        // ,
        // async: true
    });
}

function removeSelected(element){
    let td = element.find("td");
    for(let i = 0; i <td.length; i++){
        // makes element not editable
        $(td[i]).attr('contenteditable', 'false');
        $(td[i]).remove(".confirm-btn")
    }
}

