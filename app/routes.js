/*global module, require, console, __dirname */
module.exports = function (app, passport) {
    var fs = require('fs');
    var uuid = require('uuid');
    var async = require('async');
    var EntityBrowser = require('./modules/EntityBrowser/entitybrowser');
    var EntityShare = require('./modules/EntityShare/entityShare');
    var User = require('./modules/User/user');

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    app.get('/api/entity', isLoggedIn, function (req, res) {
        EntityBrowser.getEntitiesForLevel({
            owner: req.user._id,
            parent: req.query.parent
        }, function (err, entities) {
            res.status(err ? 422 : 200).json(entities).end();
        });
    });

    app.post('/api/entity/rename', isLoggedIn, function (req, res) {
        EntityBrowser.renameEntity(req.body, function (err) {
            res.status(err ? 422 : 200).json({
                status: err ? 'ERROR' : 'SUCCESS'
            }).end();
        });
    });

    app.post('/api/entity/share', isLoggedIn, function (req, res) {
        EntityShare.create(req.body, function (err, url) {
            res.status(err ? 422 : 200).json({
                status: err ? 'ERROR' : 'SUCCESS',
                url: url
            }).end();
        });
    });

    app.post('/api/file/new', isLoggedIn, function (req, res) {
        EntityBrowser.createNewFileEntity({
            file: req.files.file,
            user: req.user._id,
            parent: req.body.parent
        }, function (err, entity) {
            res.status(err ? 422 : 200).json({
                entity: entity
            }).end();
        });
    });

    app.post('/api/file/rename', isLoggedIn, function (req, res) {
        EntityBrowser.renameFile(req.body, function (err) {
            res.status(err ? 422 : 200).json({
                status: err ? 'ERROR' : 'SUCCESS'
            }).end();
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
            res.status(err ? 422 : 200).json({
                status: err ? 'ERROR' : 'SUCCESS'
            }).end();
        });
    });

    app.post('/api/user/register', function (req, res) {
        User.register(req.body, function (err, user) {
            res.status(err ? 422 : 200).json({
                message: err ? 'An error occurred. Please try again.' : 'Account successfully created. You may now log in to your account.'
            }).end();
        });
    });

    app.post('/api/user/reset-password', function (req, res) {
        User.resetPassword(req.body, function (err) {
            res.status(err ? 422 : 200).json({
                message: err ? 'An error occurred. Please try again.' : 'Password request successful. You will recieve an email shortly with further instructions.'
            }).end();
        });
    });

    // frontend routes =========================================================

    app.get('/download/:entityId', isLoggedIn, function (req, res) {
        res.status(200).sendFile(require('path').join(__dirname + '/files/' + req.user._id + '/' + req.params.entityId));
    });


    // http://cloud.andrewlively.com/share?id=3ce05a67f8db4407b68ed2995c4e1615
    app.get('/share', function (req, res) {
        async.waterfall([

            function (callback) {
                EntityShare.getEntityIdForKey(req.query.id, function (err, id) {
                    callback(err || !id ? 'An error occurred' : null, id);
                });
            },
            function (id, callback) {
                EntityBrowser.getEntityInfoForId(id, function (err, info) {
                    callback(err, {
                        path: info.owner + '/' + info.key,
                        name: info.name
                    });
                });
            }
        ], function (err, data) {
            if (err) {
                // TODO: Return 404 page
                console.log(err);
            } else {
                res.download(require('path').join(__dirname + '/files/' + data.path), data.name);
            }
        });
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