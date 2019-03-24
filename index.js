let express = require('express');
var bodyParser = require('body-parser')
const app = express();
const port = 5432;

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(`${__dirname}/client`));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/search', function (req, res) {
    res.render('search', { page_script: "js/search.js" });
});

app.post('/query', function (req, res) {
    let query = req.body.query;
    let query_type = req.body.query_type;
    
    res.json({"test": "test"});
});

app.get('/constructors', function (req, res) {
    res.render('constructors', {})
});

app.get('/tracks', function (req, res) {
    res.render('tracks', {})
})

app.listen(port, () => console.log("Listening on port " + port + "..."));