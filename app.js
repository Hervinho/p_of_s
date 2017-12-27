//Node modules
var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var engine = require('ejs-locals');
var session = require('client-sessions');

//Required files
var connection = require('./config/connection');
var routes = require('./config/routes');

//Designated port for the application
var PORT = 8080;

// get an instance of the router for api routes
var apiRoutes = express.Router();

//Set up session.
app.use(session({
  cookieName: 'PhemePointOfSaleProjectSession',
  secret: '&ses%Sion}[4*d)(pr0j30I901nTo05^%#@',
  duration: 30 * 60 * 1000, //session is only valid for 30 minutes
  activeDuration: 10 * 60 * 1000, //session is only active for 10 minutes
  ephemeral: true //deletes the cookie when the browser is closed
}));

//Where engine will source CSS files and controllers
app.use('/public',require('express').static('public'));
app.use('/controllers',require('express').static('controllers'));

//Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// apply prefix to all API routes.
app.use('/api/v1', apiRoutes);

//Set up EJS view engine.
app.engine('ejs', engine);
app.set('view engine','ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layout');

//Iniatialize Database connection.
connection.init();

//Configure all routes.
routes.configureAllAPIs(apiRoutes);
routes.configureAllViews(app);

var server = app.listen(PORT, function(){
  console.info('Server listening on port ' + server.address().port);
});

module.exports = {app: app};