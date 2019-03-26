let express = require('express');
var bodyParser = require('body-parser');
let mongo = require('mongodb').MongoClient;


const app = express();
const port = 5432;

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(`${__dirname}/client`));

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

app.post("/driverdetails", function(req, res){
    let driver_fname = req.body.forename;
    let driver_lname = req.body.surname;

    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");
        let db_query = { "forename": driver_fname, "surname": driver_lname};

        db_object.collection("Drivers").find(db_query).toArray(function (err, result) {
            if (err) throw err;
            fixPeriod(result);
            db.close();


            fixPeriod(result);
            res.json(result);
        });
    });
});

app.post('/driverupdates', function(req, res){
    let id = { "_id": ObjectID(req.body._id)}

    delete req.body._id;
    let update = {$set: req.body}

    mongo.connect(mongo_url, {useNewUrlParser: true}, function(err,db){
        if(err) throw err
        let db_object = db.db("F1Stats");
        console.log(req.body);
        
        db_object.collection("Drivers").updateOne(id, update , function(err, result){
            if (err) throw err
            // console.log(result)
            console.log("DB was updated")

            db.close();
        })
    })

});

app.get('/driver', function (req, res) {
    let driver_fname = req.query.forename;
    let driver_lname = req.query.surname;

    mongo.connect(mongo_url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        let db_object = db.db("F1Stats");
        let db_query = { "forename": driver_fname, "surname": driver_lname};

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