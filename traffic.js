var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

var milesToRadian = function(miles){
    var earthRadiusInMiles = 3959;
    return miles / earthRadiusInMiles;
};

function getNearbyMovingCheckins(coords, miles){
    return new Promise((resolve, reject) => {
        var query = {
            "loc" : {
                $geoWithin : {
                    $centerSphere : [
                        [ parseFloat(coords.longitude), parseFloat(coords.latitude)],
                        milesToRadian(miles) ]
                }
            },
            "status": "moving"
            //also need to limit the time stamps
        };

        MongoClient.connect(url, function(err, db) {
            db.collection("checkins")
                .find(query)
                .sort( { timestamp: -1 } )
                .toArray(function(err,result){
                    if(err){
                        console.log(err);
                        reject(err);
                    }
                    else{
                        resolve(result);
                    }
                });
            });
        });
}
function getPrediction(coords){
    return getNearbyMovingCheckins(coords, 2) //2 miles
        .then(function(checkins){
            console.log(checkins);

            //group the checkins by relative time
            //calculate the average time between grouped checkins
            //find out the last time the cola moved
            //how long have they been waiting so far?
            //average time - waiting time = time left to wait
            //predict the cola will move in X minutes
            return checkins;
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

            var checkin = {
                timestamp: new Date(),
                status: status,
                email: coords.email,
                loc : {
                    type : "Point",
                    coordinates : [coords.longitude, coords.latitude]
                }
            };
            var collection = db.collection("checkins");
            collection.insertOne(checkin, function(err, result) {
                if(err) {
                    reject(err)
                }
                else{
                    resolve();
                }
            });
            collection.ensureIndex({
                loc : "2dsphere"
            });
        });
    });
}

module.exports = {
    getPrediction: getPrediction,
    addWaiting: function(coords){
        return logCheckin(coords, "waiting");
    },
    addMoving: function(coords){
        return logCheckin(coords, "moving");
    },
};