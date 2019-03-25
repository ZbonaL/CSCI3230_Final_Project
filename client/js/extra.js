let google_key = "AIzaSyC9aUb-Pe1vdRN2JvraH-sStv_0yfMMTs0";

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