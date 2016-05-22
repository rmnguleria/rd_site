var Ngo = require('../models/ngo');
var fs = require('fs');
var path = require('path');
module.exports = function (app, passport) {

    app.get('/ngo', function (req, res) {
        res.render('ngo');
    });

    app.get('/ngo/filldetails', isLoggedIn, function (req, res) {
        res.render('ngodetails', {

        })
    });

    app.post('/ngo/image', isLoggedIn, function (req, res) {
        console.log(req.files);
    });

    // PROFILE SECTION =========================
    app.get('/ngo/profile', isLoggedIn, function (req, res) {
        res.render('ngoprofile', {
            user: req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/ngo/login', function (req, res) {
        res.render('ngologin', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/ngo/login', function (req, res, next) {
        passport.authenticate('local-user-login', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/ngo/login'); }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                Ngo.findOne({ 'email': user.email }, function (err, ngo) {
                    if (ngo.description != null) {
                        return res.redirect('/ngo/profile');
                    }
                    return res.redirect('/ngo/filldetails');
                });
            });
        })(req, res, next);
    });

    // SIGNUP =================================
    // show the signup form
    app.get('/ngo/signup', function (req, res) {
        res.render('ngosignup', { message: req.flash('signupMessage') });
    });
    // process the signup form
    app.post('/ngo/signup', passport.authenticate('local-user-signup', {
        successRedirect: '/ngo/filldetails', // redirect to the secure profile section
        failureRedirect: '/ngo/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    if (req.route.path.startsWith('/ngo')) {
        res.redirect('/ngo/login');
    } else {
        res.redirect('/user/login');
    }
}