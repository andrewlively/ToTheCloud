 // app/routes.js


 module.exports = function (app, passport) {

     // server routes ===========================================================
     // handle things like api calls
     // authentication routes

     app.get('/api/files', isLoggedIn, function (req, res) {
         res.status(200).json([{
             _id: 123,
             type: 'file',
             name: 'testfile.html',
             dateCreated: new Date(),
             lastModified: new Date()
         }, {
             _id: 456,
             type: 'folder',
             name: 'Images',
             dateCreated: new Date(),
             lastModified: new Date()
         }, {
             _id: 789,
             type: 'file',
             name: 'app.js',
             dateCreated: new Date(),
             lastModified: new Date()
         }]).end();
     });
     
     app.post('/api/upload', isLoggedIn, function (req, res) {
         console.log(req);
     });

     // frontend routes =========================================================

     app.get('/download/:fileId', isLoggedIn, function (req, res) {
         console.log(req.params.fileId);
         // TODO: Find file
         res.status(200).sendFile(require('path').join(__dirname + '/../views/head.ejs'));
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