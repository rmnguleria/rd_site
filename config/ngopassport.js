// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the ngo model
var Ngo        = require('../app/models/ngo');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport){
    
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(ngo, done) {
        done(null, ngo.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        Ngo.findById(id, function(err, ngo) {
            done(err, ngo);
        });
    });

    // =========================================================================
    // LOCAL USER LOGIN =============================================================
    // =========================================================================
    passport.use('local-ngo-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            Ngo.findOne({ 'email' :  email }, function(err, ngo) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!ngo)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!ngo.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, ngo);
            });
        });

    }));

    // =========================================================================
    // LOCAL USER SIGNUP ============================================================
    // =========================================================================
    passport.use('local-ngo-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.ngo) {
                Ngo.findOne({ 'email' :  email }, function(err, ngo) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a ngo with that email
                    if (ngo) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newNgo           = new Ngo();

                        newNgo.email    = email;
                        
                        newNgo.password = newUser.generateHash(password);
                        
                        newNgo.description = req.body.description;

                        newNgo.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newNgo);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.ngo.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                Ngo.findOne({ 'email' :  email }, function(err, ngo) {
                    if (err)
                        return done(err);
                    
                    if (ngo) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var ngo = req.ngo;
                        ngo.email = email;
                        ngo.password = ngo.generateHash(password);
                        ngo.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,ngo);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.ngo);
            }

        });

    }));
}