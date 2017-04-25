var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

var api_key = process.env.MAILGUN_API_KEY;
var domain = process.env.MAILGUN_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

var milesToRadian = (miles) => {
    var earthRadiusInMiles = 3959;
    return miles / earthRadiusInMiles;
};
var getNearbyNotifications = (coords, miles) => {
    return new Promise((resolve, reject) => {
        var distance = milesToRadian(miles);
        var coordArray = [ Number(coords.longitude), Number(coords.latitude) ];
        var twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours()-2);
        var query = {
            "loc" : {
                $geoWithin : {
                    $centerSphere : [ coordArray, distance ]
                }
            },
            "timestamp": { $gte: twoHoursAgo }
        };
        MongoClient.connect(url, function(err, db) {
            if(err){
                console.log(err);
                reject(err);
            } else {
                db.collection("notifications")
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
var sendAll = (coords) => {
    return getNearbyNotifications(coords, 2) //2 miles
        .then((notificationRequests)=>{
            notificationRequests
                //.filter((r) => { return r.email !== coords.email })
                .forEach((r) => {
                    mailgun.messages().send({
                        from: "Basta Trafico <no-reply@bastatrafico.com>",
                        to: r.email,
                        subject: "La Cola Se Mueve",
                        text: "Se esta moviendo la cola en la zona de donde pidio que le notificara.",
                    }, function(err, body){
                        console.log(err);
                    });
                    removeNotification(r);
                });
        });
};
var addNewNotification = (coords) => {
    return new Promise((resolve, reject) => {
        if(!coords || !coords.latitude || !coords.longitude) {
            reject("Invalid coords. Properties 'latitude' and 'longitude' required.");
        }
        MongoClient.connect(url, function(err, db) {
            coords.timestamp = new Date();

            var checkin = {
                timestamp: coords.timestamp,
                email: coords.email,
                loc : {
                    type : "Point",
                    coordinates : [coords.longitude, coords.latitude]
                }
            };
            var collection = db.collection("notifications");
            var query = { "email": checkin.email, "loc": checkin.loc };
            var updateOptions = { upsert: true };
            collection.update(query, checkin, updateOptions, function(err, result) {
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
};
var removeNotification = (coords) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            var query = coords.loc ? coords.loc : {
                email: coords.email,
                loc : {
                    type : "Point",
                    coordinates : [coords.longitude, coords.latitude]
                }
            };

            var collection = db.collection("notifications");
            collection.remove(query, function(err, result) {
                if(err) {
                    reject(err)
                }
                else{
                    resolve();
                }
            });
        });
    });
};

module.exports = {
    add: addNewNotification,
    remove: removeNotification,
    send: sendAll
};