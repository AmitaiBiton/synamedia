const bodyParser = require('body-parser')
const express = require('express')
const routers = require('./routes/routes.js')


const app = express()
const port = 8080;


app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));

app.use('/' , routers)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})