// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User       = require('../app/models/user');
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
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL USER LOGIN =============================================================
    // =========================================================================
    passport.use('local-user-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            User.findOne({ 'email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err){
                    console.log(Date() + "Error encountered",err);
                    return done(err);
                }

                // if no user is found, return the message
                if (!user){
                    console.log(Date() + 'User not found');
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                if (!user.validPassword(password))
                {
                    console.log(Date() + 'Wrong password');
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }

                // all is well, return user
                else if(req.route.path === "/ngo/login"){
                    Ngo.findOne({'email':email},function(err,ngo){
                           if(err){
                               console.log(Date() + "Error encountered " , err);
                               return done(err);
                           } 
                           if(!ngo){
                               return done(null,false,req.flash('loginMessage','No user found'));
                           }
                           return done(null,user);
                        });
                }
                else{
                    console.log(Date() + 'Successfully Authenticated',user);
                    return done(null, user);
                }
            });
    }));

    // =========================================================================
    // LOCAL USER SIGNUP ============================================================
    // =========================================================================
    passport.use('local-user-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        
        //console.log("Request Object",req.route);
 
        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                console.log(Date() + "User is not already logged in");
                
                User.findOne({ 'email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err){
                        console.log(Date() + "Error encountered while searching user",err);
                        return done(err);
                    }

                    // check to see if theres already a user with that email
                    if (user) {
                        console.log(Date() + "Email already taken",user);
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                         console.log(Date() + "New user to be created");
                        // create the user
                        var newUser            = new User();
                        newUser.name = req.body.name;
                        newUser.email    = email;
                        newUser.local.password = newUser.generateHash(password);
                        
                        if(req.route.path=='/ngo/signup'){
                            newUser.userType = 'admin';
                            
                            var newNgo = new Ngo();
                            newNgo.name = req.body.name;
                            newNgo.email = email;
                            newNgo.reg_address.address = req.body.address;
                            newNgo.reg_address.pincode = req.body.pincode;
                            newNgo.reg_address.city = req.body.city;
                            newNgo.reg_address.state = req.body.state;
                            
                            newNgo.save(function(err){
                               if(err){
                                   console.log(Date()() + "Error encountered while saving ngo",err);
                                   return done(err);
                               }
                            });
                            
                        }

                        newUser.save(function(err) {
                            if (err)
                            {
                                console.log(Date() + "Error encountered while saving user",err);
                                return done(err);
                            }
                            console.log(Date() + "New user created",newUser);
                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var newUser = req.user;
                        newUser.email = email;
                        newUser.local.password = user.generateHash(password);
                        
                        if(req.route.path=='/ngo/signup'){
                            newUser.userType = 'admin';
                        }
                        
                        newUser.save(function (err) {
                            if (err)
                                return done(err);
                            console.log(Date() + "New user created",newUser);
                            return done(null,newUser);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id', 'name', 'email'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
             console.log(Date() + "Facebook Profile " + profile.cover);
            if (!req.user) {

                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        
                        console.log(user);

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.email = (profile.emails[0].value || '').toLowerCase();

                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser            = new User();

                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        newUser.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.email = (profile.emails[0].value || '').toLowerCase();

                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                            
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.email = (profile.emails[0].value || '').toLowerCase();

                user.save(function(err) {
                    if (err)
                        return done(err);
                    console.log(Date() + "New user created",newUser);    
                    return done(null, user);
                });

            }
        });

    }));
}