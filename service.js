var express = require('express');
var app = express(); // creating instance of Express
var port = process.env.port || 1337;
var mongo = require('mongodb').MongoClient;
var dburl = 'mongodb://localhost:27017';

function get(dbo, bundleId, callback) {
         
        dbo.collection("builds").findOne({id:bundleId}, function(err, res){
            if(err) throw err;
            // TODO: handle if not found.          
            callback(res);            
        }); 
}

function createOrUpdate(dbo, bundleId, newBuildNum, callback) {        
        var newValue= parseInt(0);
        if(newBuildNum == null)
            newValue = {$inc : {build: parseInt(1)}} // increment it's property called "build" by 1      
        else
            newValue = {$set : {build:parseInt(newBuildNum)}};
        
        
        dbo.collection("builds").updateOne({id:bundleId}, newValue, {upsert: true},function(err, res){
            if(err) throw err;
            if(res == null) {           
                console.log("1 document inserted");                           
            }
            else {          
                if(newBuildNum == null)
                    console.log("bumped the build number.");
                else
                    console.log('1 document updated');                
            }
            callback(res);
        });          
}


app.listen(port, function(){
    var datetime = new Date();
    var message = "Server running on Port: " + port + " Started at: " + datetime;
    console.log(message);
});



app.get("/api/read/:bundleId", function(request, response){    
    var param = request.params.bundleId;
    mongo.connect(dburl, function(err, db){
        var dbo = db.db("mydb");
        get(dbo, param, function(res){
            response.json(res);
            db.close();
        });
    });          
});

app.post('/api/set/:bundleId/:buildNum', function(request, response){
    // TODO: validate parameters.
    
    var bundleId = request.params.bundleId;
    var newBuildNum = request.params.buildNum;    
    mongo.connect(dburl, function(err, db){
        if(err) throw err;
        var dbo = db.db("mydb");
        get(dbo, bundleId, function(doc){
          
            if(doc == null) {
                createOrUpdate(dbo, bundleId, 0, function(r){
                    response.json(r);
                    db.close();
                });    
            }
            else if(isNaN(doc.build) || doc.build < newBuildNum) {
                createOrUpdate(dbo, bundleId, newBuildNum, function(r){
                    response.json(r);
                    db.close();
                });
            }
            else {
                response.json("invalid new build number");
                db.close();
            }           
        });        
    });        
});

function connectDB(callback){
    mongo.connect(dburl, function(err, db){
        var dbo = db.db("mydb");
        callback(dbo)
    });
}

app.post('/api/bump/:bundleId', function(req, response){        
    // TODO: validate parameter.
    var bundleId = req.params.bundleId;
    mongo.connect(dburl, function(err, db){
        var dbo = db.db("mydb");
        createOrUpdate(dbo, bundleId, null, function(r){
            response.json(r);
            db.close();
        });    
    });
    
});