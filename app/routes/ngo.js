module.exports = function(app, passport) {

    // PROFILE SECTION =========================
    app.get('/ngo/profile', isLoggedIn, function(req, res) {
        res.render('ngoprofile', {
            ngo : req.ngo
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/ngo/login', function(req, res) {
            res.render('ngologin', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/ngo/login', passport.authenticate('local-ngo-login', {
            successRedirect : '/ngo/profile', // redirect to the secure profile section
            failureRedirect : '/ngo/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/ngo/signup', function(req, res) {
            res.render('ngosignup', { message: req.flash('signupMessage') });
        });
        // process the signup form
        app.post('/ngo/signup', passport.authenticate('local-ngo-signup', {
            successRedirect : '/ngo/profile', // redirect to the secure profile section
            failureRedirect : '/ngo/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-ngo-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}