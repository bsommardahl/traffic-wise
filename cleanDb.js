var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

MongoClient.connect(url, function(err, db) {
    var collection = db.collection("checkins");
    collection.remove({email: "byron@sommardahl.com"}, function(err, result) {
        if(err) {
            console.log(err);
        }
        else{
            console.log("Done.");
        }
    });
});