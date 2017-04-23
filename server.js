var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var traffic = require('./traffic');

var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/home.html'));
});
app.get('/api/prediction', function(req, res){
    var coords = { latitude: req.query.lat, longitude: req.query.lng };
    traffic.getPrediction(coords).then(function(results){
        res.send(results);
    })
    .catch(function(error){
        res.status(500);
        res.json({error: error});
    });
});
app.post('/api/waiting', function(req, res){
    var timestamp = new Date();
    traffic.addWaiting(req.body).then(function(){
        console.log(`WAIT: ${req.body.email} logged at ${timestamp}.`);
        res.sendStatus(200);
    })
    .catch(function(error){
        res.status(500);
        res.json({error: error});
    });
});
app.post('/api/moving', function(req, res){
    var timestamp = new Date();
    traffic.addMoving(req.body).then(function(){
        console.log(`MOVE: ${req.body.email} logged at ${timestamp}.`);
        res.sendStatus(200);
    })
    .catch(function(error){
        res.status(500);
        res.json({error: error});
    });
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});