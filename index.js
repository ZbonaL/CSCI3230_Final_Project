let express = require('express');
var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
let mongo = require('mongodb').MongoClient;

const app = express();
const port = 5432;

app.set("view engine", "pug");
app.use(body_parser.urlencoded({ extended: false }));
app.use(cookie_parser());
app.use(express.static(`${__dirname}/client`));

let mongo_url = "mongodb://localhost:27017/";

app.listen(port, function () {
    console.log("Listening on port " + port + "...");
});

// Set a new cookie for the client if 
// they don't have one already
app.use(function (req, res, next) {
    let cookie = req.cookies.cookieName;
    // Check if we have a cookie from the client
    if (cookie === undefined) {
        // Generate a random string for the cookie
        let cookie_id = Math.random().toString();
        // Set to expire in *a long time*
        res.cookie('cookieName', cookie_id, { expires: new Date(2018, 0, 1, 0, 0, 0, 0) });
    }
    next();
});

app.get('/', function (req, res) {
    res.render('index', { page_script: "js/index.js" });
});

app.get('/admin', function (req, res) {
    res.render('admin', { page_script: "js/admin.js" });
});

// A *very* basic login function
// Checks if the user exists and if it does returns 1
// else returns 0
app.post('/login', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");

        let db_query = { username: username, password: password };
        db_object.collection("Users").find(db_query).toArray(function (err, result) {
            if (err) throw err;

            let message = {};
            if (result.length >= 1) {
                // If the user can log in send them the relevant info
                message.status = 1;
                db_object.collection("DriversToReview").find({}).toArray(function (err, pending_results) {
                    for (let row of pending_results) {
                        let _id = row._id.split("_")[0];
                        let cookie = row._id.split("_")[1];
                        row._id = _id;
                        row.cookie_id = cookie;
                    }
                    message.results = pending_results;
                    db.close();
                    res.json(message);
                });
            } else {
                message.status = 0;
                db.close();
                res.json(message);
            }
        });
    });
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

        // Get the specific info to query
        let db_query = {};
        if (query != "") {
            switch (query_type) {
                case "fname":
                    db_query.forename = query;
                    break;
                case "lname":
                    db_query.surname = query;
                    break;
            }
        }

        // Return the results (15 max)
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

    // Get the info of a specific driver
    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");
        let db_query = { "forename": driver_fname, "surname": driver_lname };

        db_object.collection("Drivers").find(db_query).toArray(function (err, result) {
            if (err) throw err;
            fixPeriod(result);
            db.close();

            res.json(result);
        });
    });
});

app.post('/addToReview', function (req, res) {
    let id = req.body._id + "_" + req.cookies.cookieName;
    delete req.body._id;
    let update_data = { $set: req.body };

    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");

        // Update a row in the db
        db_object.collection("DriversToReview").updateOne({ _id: id }, update_data, { upsert: true }, function (err, result) {
            if (err) throw err;
            console.log("DB was updated");
            db.close();
        });
    });
});

app.post('/updateDriver', function (req, res) {
    let data = req.body;
    delete data._id;

    // Update the row in the main driver collection
    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");

        db_object.collection("Drivers").updateOne({ forename: data.forename, surname: data.surname }, data, { upsert: true }, function (err, result) {
            if (err) throw err;
            console.log("The drivers table was updated");
            db.close();
        });
    });
});

app.post('/removeDriverChange', function (req, res) {
    let data = req.body;
    delete data._id;
    delete data.cookie_id

    // Remove the driver from the review table
    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");
        db_object.collection("DriversToReview").removeOne({ forename: data.forename, surname: data.surname }, { upsert: true }, function (err, result) {
            if (err) throw err;
            console.log("The driver change table was updated");
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

        // Render the specific driver data and render a page
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

app.get('/driveramount', function (req, res) {
    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");

        // Return the amount of drivers in the main collection
        db_object.collection("Drivers").countDocuments({}, function (err, result) {
            res.json({ amount: result });
        });
    });
});

app.get('/columns', function (req, res) {
    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");

        // Find all columns from a collections
        db_object.collection("Drivers").findOne({}, function (err, result) {
            let fields = {};
            for (let field in result) {
                fields[field] = "";
            }
            res.json(fields);
        });
    });
});

// Fix the periods encoded in {PERIOD} in the db to normal '.'
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