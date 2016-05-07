// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '223780524667949', // your App ID
        'clientSecret'    : 'dd5bcdf81868dddb7dbdde6e8b0db172', // your App Secret
        'callbackURL'     : 'http://localhost:3000/auth/facebook/callback'
    }
};