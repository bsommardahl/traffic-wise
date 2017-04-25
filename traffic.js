var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;
var groupByDateRanges = require('./util/dateRangeGrouper');
var trafficHelper = require('./util/trafficHelper');
var milesToRadian = function(miles){
    var earthRadiusInMiles = 3959;
    return miles / earthRadiusInMiles;
};

var getTrafficLineMovementStartTimes = (checkins) => {
    return new Promise((resolve, reject) => {
        var startTimes = groupByDateRanges(checkins, (c) => { return c.timestamp; });
        resolve(startTimes.map((t) => { return t.key; }));
    });
}
function getNearbyMovingCheckins(coords, miles){
    return new Promise((resolve, reject) => {
        var distance = milesToRadian(miles);
        var coordArray = [ Number(coords.longitude), Number(coords.latitude) ];
        var fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate()-5);
        var query = {
            "loc" : {
                $geoWithin : {
                    $centerSphere : [ coordArray, distance ]
                }
            },
            "status": "moving",
            "timestamp": { $gte: fiveDaysAgo }
        };
        MongoClient.connect(url, function(err, db) {
            if(err){
                console.log(err);
                reject(err);
            } else {
                db.collection("checkins")
                    .find(query)
                    .toArray(function(err,result){
                        if(err){
                            console.log(err);
                            reject(err);
                        }
                        else{
                            resolve(result);
                        }
                    });

            }
        });
    });
}

var getAverageDurationForCheckin = (checkin) => {
    return getNearbyMovingCheckins(checkin, 2) //2 miles
        .then(getTrafficLineMovementStartTimes)
        .then((startTimes) => {
            startTimes = startTimes.sort((a,b)=>{return new Date(a.timestamp)<new Date(b.timestamp)});
            var lastStartTime = startTimes[startTimes.length-1];
            return trafficHelper.getAverageDuration(startTimes)
                .then((avgDuration) => {
                    return {
                        lastStartTime: lastStartTime,
                        averageDuration: avgDuration,
                    };
                });
        });
};

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
    getAverageDuration: getAverageDurationForCheckin,
    addWaiting: function(coords){
        return logCheckin(coords, "waiting");
    },
    addMoving: function(coords){
        return logCheckin(coords, "moving");
    },
};