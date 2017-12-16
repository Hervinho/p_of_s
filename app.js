//Node modules
var express = require('express');
var bodyParser = require("body-parser");
var app = express();

//Required files
var connection = require('./config/connection');
var routes = require('./config/routes');

//Designated port for the application
var PORT = 8080;

// get an instance of the router for api routes
var apiRoutes = express.Router();

//Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// apply prefix to all API routes.
app.use('/api/v1', apiRoutes);

//Iniatialize Database connection.
connection.init();

//Configure all routes.
routes.configureAllAPIs(apiRoutes);
routes.configureAllViews(app);

var server = app.listen(PORT, function(){
  console.info('Server listening on port ' + server.address().port);
});

module.exports = {app: app};