let express = require('express');
var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser')
let mongo = require('mongodb').MongoClient;

const app = express();
const port = 5432;

app.set("view engine", "pug");
app.use(body_parser.urlencoded({ extended: false }));
app.use(cookie_parser());
app.use(express.static(`${__dirname}/client`));

// Set a new cookie for the client if 
// they don't have one already
app.use(function (req, res, next) {
    let cookie = req.cookies.cookieName;
    // Check if we have a cookie from the client
    if (cookie === undefined) {
        let cookie_id = Math.random().toString();
        // Set to expire in *a long time*
        res.cookie('cookieName', cookie_id, { expires: new Date(253402300000000) });
    }
    next();
});


let mongo_url = "mongodb://localhost:27017/";

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/search', function (req, res) {
    res.render('search', { page_script: "js/search.js" });
});

app.post('/query', function (req, res) {
    let query = req.body.query;
    let query_type = req.body.query_type;

    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");

        let db_query = {};
        if (query != "") {
            db_query.forename = query;
        }

        db_object.collection("Drivers").find(db_query).limit(15).toArray(function (err, result) {
            if (err) throw err;
            fixPeriod(result);
            db.close();
            res.json(result);
        });
    });

});

app.post("/driverdetails", function (req, res) {
    let driver_fname = req.body.forename;
    let driver_lname = req.body.surname;

    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");
        let db_query = { "forename": driver_fname, "surname": driver_lname };

        db_object.collection("Drivers").find(db_query).toArray(function (err, result) {
            if (err) throw err;
            fixPeriod(result);
            db.close();


            fixPeriod(result);
            res.json(result);
        });
    });
});

app.post('/driverupdates', function (req, res) {
    let id = req.body._id + "_" + req.cookies.cookieName;
    delete req.body._id;
    let update_data = { $set: req.body };

    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");

        db_object.collection("DriversToReview").update({ _id: id }, update_data, { upsert: true }, function (err, result) {
            if (err) throw err;
            // console.log(result)
            console.log("DB was updated");

            db.close();
        });
    });
});

app.get('/driver', function (req, res) {
    let driver_fname = req.query.forename;
    let driver_lname = req.query.surname;

    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");
        let db_query = { "forename": driver_fname, "surname": driver_lname };

        let render_data = {
            page_script: "js/driver.js"
        }

        db_object.collection("Drivers").find(db_query).toArray(function (err, result) {
            if (err) throw err;
            fixPeriod(result);
            db.close();

            if (result.length <= 0 || result[0].driverRef == null) {
                if (driver_fname == undefined && driver_lname == undefined) {
                    render_data.fname = "New";
                    render_data.lname = "Driver";
                } else {
                    render_data.fname = "Driver Not";
                    render_data.lname = "Found";
                }
            } else {
                render_data.fname = result[0]["forename"];
                render_data.lname = result[0]["surname"];
            }

            res.render('driver', render_data);
        });
    });
});

app.listen(port, () => console.log("Listening on port " + port + "..."));


function fixPeriod(result) {
    for (let i = 0; i < result.length; i++) {
        for (let col in result[i]) {
            if (typeof (result[i][col]) == "string") {
                while (result[i][col].indexOf("{PERIOD}") != -1) {
                    result[i][col] = result[i][col].replace("{PERIOD}", ".");
                }
            }
        }
    }
}

function reversefixPeriod(result) {
    for (let i = 0; i < result.length; i++) {
        for (let col in result[i]) {
            if (typeof (result[i][col]) == "string") {
                while (result[i][col].indexOf(".") != -1) {
                    result[i][col] = result[i][col].replace(".", "{PERIOD}");
                }
            }
        }
    }
}