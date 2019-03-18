let express = require('express');
const app = express();
const port = 5432;

app.set("view engine", "pug");
app.use(express.static(`${__dirname}/client`));

app.get('/', function(req,res) {
    res.render('index');
});

app.get('/driver', function(req,res) {
    res.render('driver', {});
});

app.get('/constructors', function(req, res){
    res.render('constructors', {})
});

app.get('/tracks', function(req, res){
    res.render('tracks', {})
})

app.listen(port, () => console.log("Listening on port " + port + "..."));