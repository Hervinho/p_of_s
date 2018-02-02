//Node modules
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const engine = require('ejs-locals');
const session = require('client-sessions');

//Required files
const connection = require('./config/connection');
const routes = require('./config/routes');

//Designated port for the application
const PORT = 8080;

// get an instance of the router for api routes
let apiRoutes = express.Router(), viewRoutes = express.Router();

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
app.use('/page', viewRoutes);

//Set up EJS view engine.
app.engine('ejs', engine);
app.set('view engine','ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layout');

//Iniatialize Database connection.
connection.init();

//Configure all routes.
routes.configureAllAPIs(apiRoutes);
routes.configureIndex(app);
routes.configureAllViews(viewRoutes);

let server = app.listen(PORT, function(){
  console.info('Server listening on port ' + server.address().port);
});

module.exports = {app: app};