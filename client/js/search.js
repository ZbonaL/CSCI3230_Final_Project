$(document).ready(function() {
    $(".search-form").submit(function(event) {
        event.preventDefault();

        let form = $(event.target);
        let query = form.find("input").val();
        let query_type = form.find(".form-check > input:checked").val();
        
        // do some stuff here

        $.ajax({
            url: "/query",
            method: "POST",
            data: {"query": query,
                   "query_type": query_type},
            success: function(result){
            }
        })

    });
});