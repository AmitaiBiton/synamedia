const fs = require('fs');
const Dist = require('../model/cities_dist')
const mongoose = require('mongoose')

/* get google maps API */
var distance = require('google-distance');
/* In order to use the Google Maps API it is necessary to create it in the cloud and get a unique key that will allow access to it */
distance.apiKey = 'AIzaSyAnyhAM8IYIYSFIlbkJdpGL4cHrMO8qd1A';





module.exports = {


    /* Q1 : check the server  */
    server_check: function (req, res) {  
            res.status(200).send();
    },


    /*  Q2: calculate the distance between two cites only if the distance is not in the db */

    /* RUN-TIME: 
    O(2N)~O(N) + O(1) => (find function I guess it goes through all the items at most and I do it twice ) 
    O(1) - for the update on item
    Run Time ~ O(N)
    */
    get_distance: function (req, res) {
        
        if (req.query.source == null || req.query.destination == null){
            res.status(400).send()
        }
        
        var src = req.query.source
        var des = req.query.destination

        Dist.find({ source: src,
        destination:des },).then(item =>{ 


            /* Check if the item allready in the DB */
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


            /* the item is not in the DB*/
            else{
                Dist.find({ source: des,
                    destination:src },).then(item =>{ 
                        /* The item appears with inverse values  */
                        if (item[0]!=undefined){
                            var new_hits = item[0].hits +1
                            var new_item =  {source:des , destination:src , hits:new_hits , distance:item[0].distance }
                            Dist.findOne({ source: des,
                                destination:src }).
                            then(doc => Dist.updateOne({ _id: doc._id }, { hits: new_hits })).
                            then(() => Dist.findOne({hits:new_hits })).
                            /* res after update */
                            then(doc => res.status(200).send({'distance': item[0].distance}))
                        }


                        /* The item does not appear in any form, so we need to create one */
                        else{
                            /* caculate the distance between src and des by google maps API and store in the DB */
                            distance.get(
                                {
                                    origin: src,
                                    destination: des
                                },
                                function(err, data) {
                                    /* if the client will input city name unvalid or city that not exist the server will output 400 response*/
                                    if (err) res.status(400).send("please enter a valid city name");

                                    else{
                                        dist = data.distance
                                        console.log(dist)
                                        var new_item = {'source': src , 'destination':des ,'hits':0, 'distance':dist}
                                        const d = new Dist(new_item);
                                        d.save().then(d=>
                                            res.status(201).send({'distance': d.distance})
                                        ).catch(e=>res.status(400).send(e))
                                    }
                                    
                    
                                })
                        }
                    })
                
            } 
        }          
        ).catch(e => res.status(500).send())
        
        
        //res.status(200).send('source = '+source+'\n' + ' destination = ' +  destination + '' );
    },


    /* Q3: check the connection to the DB */
        /* RUN-TIME: O(1)*/

    get_connect_status: function (req, res) {
        var connect  = mongoose.connection.readyState
        if  (connect ==1){
            res.status(200).send()
        }
        else{
            res.status(500).send()
        }
    },



    /* Q4:  */
        /* RUN-TIME: */

    get_popular_search: function (req, res) {
        /* in Q2 we save the hits for any item we store or read so we need only get the item with the max value of hits */
        Dist.findOne()
        .sort('-score')  // give me the max
        .exec(function (err, item) {
            res.status(200).send(item)
        });

    },

    /* Q4: post new distance between two cities  */
        /* RUN-TIME: O(2N)~O(N) => (find function I guess it goes through all the items at most and I do it twice )  */
     
    post_new_distance : function (req, res) {
        /*  req - checking */
        if (req.body.source==null 
            || req.body.destination==null || req.body.distance==null ){
                res.status(400).send()     
        }


        var src = req.body.source
        var des = req.body.destination
        Dist.find({ source: src,
            destination:des }).then(item =>{ 

                /* if the item allready exist so update the hits and the distance */
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

                /* if is not exist so create item and store in the DB */
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