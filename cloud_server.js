// server.js

// modules =================================================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passport = require('passport');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var multer  = require('multer');

// configuration ===========================================

// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 1337;

// connect to our mongoDB database 
// (uncomment after you enter in your own credentials in config/db.js)
 mongoose.connect(db.mongodb.url); 

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(multer({ dest: './uploads/'}));
app.use(cookieParser()); // read cookies (needed for auth)
// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch',
    resave: true,
    saveUninitialized: true
})); // session secret

app.use(session({
    store: new RedisStore(),
    secret: '^[(R5ejCl3T5=81%6p+J)4~UB})@Gs"MoM?25=51H%8~c!lio$_J]n4^}*08z',
    resave: true,
    saveUninitialized: true
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// routes ==================================================
require('./app/routes')(app, passport); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user                     
console.log('Magic happens on port ' + port);

// expose app           
exports = module.exports = app;