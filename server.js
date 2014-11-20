/*global require, console, process, __dirname, exports, module */


try {
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
    var multer = require('multer');
    var async = require('async');
    var db;
    var systemSettings;
} catch (ex) {
    console.log('ERROR: One or more modules are missing. Make sure to run `npm install`');
    process.exit(1);
}

async.series([

    function (callback) {
        try {
            db = require('./config/db');
            systemSettings = require('./config/systemSettings');

            callback(null);
        } catch (ex) {
            callback('Could not find the a config file. Make sure the config files exist and are formatted properly in the config directory.');
        }
    },
    function (callback) {
        try {
            // connect to our mongoDB database 
            mongoose.connect(db.mongodb.host, function (err) {
                if (err) throw err;

                callback(null);
            });
        } catch (ex) {
            callback('There was an issue connecting to the provided MongoDB instance. Check the connection and try again.');
        }
    },
    function (callback) {
        try {
            // configuration ===========================================
            // set the view engine to ejs
            app.set('view engine', 'ejs');
            app.use(multer({
                dest: './uploads/'
            }));
            app.use(cookieParser()); // read cookies (needed for auth)
            // required for passport
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

            callback(null);
        } catch (ex) {
            callback('There was an error configuring the server');
        }
    },
    function (callback) {
        try {
            // start app ===============================================
            var port = systemSettings.host.port;

            app.listen(port);
                    
            console.log('Magic happens on port ' + port);
            
            callback(null);
        } catch (ex) {
            callback('There was an issue starting the server');
        }
    },
    function (callback) {
        try {
            /*jshint ignore:start */
            exports = module.exports = app;
            /*jshint ignore:end */
        } catch (ex) {
            callback('There was an issue exposing the app');
        }
    }
], function (err) {
    if (err) {
        
    }
    console.log('ERROR: ' + err);
    process.exit(1);
});