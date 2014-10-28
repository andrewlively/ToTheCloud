 // app/routes.js


 module.exports = function (app) {

     // server routes ===========================================================
     // handle things like api calls
     // authentication routes

     // frontend routes =========================================================
     app.post('/login', function (req, res) {
         console.log(req.body);
         res.redirect('/');
     });
     
     // route to handle all angular requests
     app.get('/', function (req, res) {
         res.render('partials/app', {});
     });

 };