const express = require('express'),
    userRoutes = require('./distance.js');

var router = express.Router();

router.get('/', (req, res) => {
   res.send('welcome to the development api-server');
});

router.get('/hello', userRoutes.server_check);


module.exports = router;