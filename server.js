var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/home.html'));
});

app.post('/api/waiting', function(req, res){
    traffic.waiting(req.body).then(function(){
        res.sendStatus(200);
    })
    .catch(function(error){
        res.sendStatus(500).send({error: error});
    });
});
app.post('/api/moving', function(req, res){
    traffic.moving(req.body).then(function(){
        res.sendStatus(200);
    })
    .catch(function(error){
        res.sendStatus(500).send({error: error});
    });
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});