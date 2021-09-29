const fs = require('fs');
const Dist = require('../model/city_dist')
const mongoose = require('mongoose')

var distance = require('google-distance');
distance.apiKey = 'Key';



// helper methods
const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                console.log(err);
            }

            callback(returnJson ? JSON.parse(data) : data);
       });
};

const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {

        fs.writeFile(filePath, fileData, encoding, (err) => {
            if (err) {
                console.log(err);
            }

            callback();
        });
    };


module.exports = {

    server_check: function (req, res) {  
            res.status(200).send();
    },
    get_distance: function (req, res) {
        if (req.query.source == null || req.query.destination == null){
            res.status(400).send()
        }
        var src = req.query.source
        var des = req.query.destination
        Dist.find({ source: src,
        destination:des },).then(item =>{ 
            if (item[0] != undefined){
                
                var new_hits = item[0].hits +1
                var new_item =  {source:src , destination:des , hits:new_hits , distance:item[0].distance }
                Dist.findOne({ source: src,
                    destination:des }).
                then(doc => Dist.updateOne({ _id: doc._id }, { hits: new_hits })).
                then(() => Dist.findOne({hits:new_hits })).
                then(doc => console.log(doc.name)); // 'Neo'
                res.status(200).send({'distance': item[0].distance})
            }
            else{
                
                distance.get(
                    {
                        origin: src,
                        destination: des
                    },
                    function(err, data) {
                        if (err) return console.log(err);
                        dist = data.distance
                        var new_item = {'source': src , 'destination':des ,'hits':0, 'distance':dist}
                        const d = new Dist(new_item);
                        d.save().then(d=>
                            res.status(201).send({'distance': d.distance})
                        ).catch(e=>res.status(400).send(e))
        
                    })
            } 
        }          
        ).catch(e => res.status(500).send())
        
        
        //res.status(200).send('source = '+source+'\n' + ' destination = ' +  destination + '' );



    },
    get_connect_status: function (req, res) {
        var connect  = mongoose.connection.readyState
        if  (connect ==1){
            res.status(200).send()
        }
        else{
            res.status(500).send()
        }
    },

    get_popular_search: function (req, res) {
        
        Dist.findOne( )
        .sort('-score')  // give me the max
        .exec(function (err, member) {
            res.status(200).send(member)
        });

    },
    post_new_distance : function (req, res) {
        if (req.body.source==null 
            || req.body.destination==null || req.body.distance==null ){
                res.status(400).send()
            
        }
        var src = req.body.source
        var des = req.body.destination
        Dist.find({ source: src,
            destination:des }).then(item =>{ 
                if (item[0] != undefined){
                    
                    var new_hits = item[0].hits +1
                    var new_item =  {source:src , destination:des , hits:new_hits , distance:item[0].distance }
                    Dist.findOne({ source: src,
                        destination:des }).
                    then(doc => Dist.updateOne({ _id: doc._id }, { hits: new_hits , distance:req.body.distance })).
                    then(() => Dist.findOne({hits:new_hits })).
                    then(doc => console.log(doc.name)); // 'Neo'
                    res.status(200).send({'distance': item[0].distance})
                }
                else{
        
        
                    const new_item  = {"source": req.body.source , "destination" : req.body.destination , "distance" : req.body.distance , "hits": 0}
                    item = new Dist(new_item)
                    item.save().then(user => {
                        res.status(201).send(item)
                    }).catch(e => {
                        res.status(400).send(e)
                    })
                }

        })
    }


};