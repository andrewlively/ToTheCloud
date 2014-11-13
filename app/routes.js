/*global module, require, console, __dirname */
module.exports = function (app, passport) {
    var fs = require('fs');
    var uuid = require('uuid');
    var EntityBrowser = require('./modules/EntityBrowser/entitybrowser');
    var User = require('./modules/User/user');

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    app.get('/api/entities', isLoggedIn, function (req, res) {
        EntityBrowser.getEntitiesForLevel({
            owner: req.user._id,
            parent: req.query.parent
        }, function (err, entities) {
            res.status(err ? 422 : 200).json(entities).end();
        });
    });

    app.post('/api/file/new', isLoggedIn, function (req, res) {
        EntityBrowser.createNewFileEntity({
            file: req.files.upload,
            user: req.user._id,
            parent: req.body.parent
        }, function (err) {
            res.redirect('/');
        });
    });

    app.post('/api/file/delete', isLoggedIn, function (req, res) {
        EntityBrowser.deleteFileEntity({
            file: req.body.file,
            user: req.user._id
        }, function (err) {
            res.status(err ? 422 : 200).json({
                status: err ? 'ERROR' : 'SUCCESS'
            }).end();
        });
    });

    app.post('/api/folder/new', isLoggedIn, function (req, res) {
        EntityBrowser.createNewFolderEntity({
            folder: req.body.folder,
            user: req.user._id,
            parent: req.body.parent
        }, function (err, newFolder) {
            res.status(err ? 422 : 200).json({
                status: err ? 'ERROR' : 'SUCCESS',
                newFolder: newFolder
            }).end();
        });
    });

    app.post('/api/folder/delete', isLoggedIn, function (req, res) {
        EntityBrowser.deleteFolderEntity({
            folder: req.body.folder,
            user: req.user._id
        }, function (err) {
            console.log('Returned from removing all');
            res.status(err ? 422 : 200).json({
                status: err ? 'ERROR' : 'SUCCESS'
            }).end();
        });
    });

    app.post('/api/user/register', function (req, res) {
        User.register(req.body, function (err, user) {
            res.status(err ? 422 : 200).json({
                message: err ? 'An error occurred' : 'Account successfully created'
            }).end();
        });
    });

    // frontend routes =========================================================

    app.get('/download/:entityId', isLoggedIn, function (req, res) {
        res.status(200).sendFile(require('path').join(__dirname + '/files/' + req.user._id + '/' + req.params.entityId));
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // route to handle all angular requests
    app.get('/', function (req, res) {
        if (req.isAuthenticated()) {
            res.render('partials/app', {
                user: req.user
            });
        } else {
            res.render('partials/login', {
                loginMessage: req.flash('loginMessage')
            });
        }
    });

    app.get('*', function (req, res) {
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}