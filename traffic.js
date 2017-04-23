var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

function getWaiting(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            db.collection("checkins")
                .find().sort({timestamp:-1}).limit(10)
                .toArray(function(err,result){
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(result);
                    }
                });
            });
        });
}
function logCheckin(coords, status){
    return new Promise((resolve, reject) => {
        if(!coords || !coords.latitude || !coords.longitude) {
            reject("Invalid coords. Properties 'latitude' and 'longitude' required.");
        }

        MongoClient.connect(url, function(err, db) {
            coords.timestamp = new Date();
            coords.status = status;
            db.collection("checkins")
                .insertOne(coords, function(err, result) {
                if(err) {
                    reject(err)
                }
                else{
                    resolve();
                }
            });
        });
    });
}

module.exports = {
    getWaiting: getWaiting,
    addWaiting: function(coords){
        return logCheckin(coords, "waiting");
    },
    addMoving: function(coords){
        return logCheckin(coords, "moving");
    },
};