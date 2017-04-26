var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var traffic = require('./traffic');
var notifications = require('./notifications');

var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/home.html'));
});
app.get('/logo', function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/logo.png'));
});
app.put('/api/movement-notification', function(req, res){
    var timestamp = new Date();
    notifications.add(req.body).then(function(){
        console.log(`NOTIFICATION ADDED: ${req.body.email} logged at ${timestamp}.`);
        res.sendStatus(200);
    })
    .catch(function(error){
        res.status(500);
        res.json({error: error});
    });
});
app.delete('/api/movement-notification', function(req, res){
    var timestamp = new Date();
    notifications.remove(req.body).then(function(){
        console.log(`NOTIFICATION REMOVED: ${req.body.email} logged at ${timestamp}.`);
        res.sendStatus(200);
    })
    .catch(function(error){
        res.status(500);
        res.json({error: error});
    });
});
app.get('/api/getNearbyWaiters', function(req, res){
    var coords = { latitude: req.query.lat, longitude: req.query.lng };
    traffic.getNearbyWaiters(coords).then(function(results){
        res.send(results);
    })
    .catch(function(error){
        res.status(500);
        res.json({error: error});
    });
});
app.get('/api/average-duration', function(req, res){
    var coords = { latitude: req.query.lat, longitude: req.query.lng };
    traffic.getAverageDuration(coords).then(function(results){
        results.currentTime = new Date();
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
        notifications.sendOne(req.body);
        notifications.send(req.body)
            .then(() => {
                console.log("NOTIFICATION SENT");
            }).catch((err) => {
                console.log(err);
            });
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