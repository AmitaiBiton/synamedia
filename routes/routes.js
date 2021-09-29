const express = require('express'),
    d_routes = require('./distance.js');

var router = express.Router();

router.get('/', (req, res) => {
   res.send('welcome to the development api-server');
});

router.get('/hello', d_routes.server_check);
router.get('/distance' , d_routes.get_distance);
router.get('/health' , d_routes.get_connect_status);
router.get('/popularsearch' , d_routes.get_popular_search);
router.post('/distance' , d_routes.post_new_distance);



module.exports = router;