var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');

// ================ DB CONFIG ================ 
var dbConfig = require('./config/database.js');
mongoose.connect(dbConfig.url);

require('./config/passport')(passport);

var app = express();

// ================ EXPRESS SETUP ================
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ================ SETUP HANDLEBARS FOR TEMPLATING ================
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// ================ PASSPORT SETUP ================
app.use(session({
    secret: 'BoogeyMcBoogeyBoog',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./app/routes/login.js')(app,passport);

app.get('/', function (req, res) {
    res.render('home');
});
app.get('/signup',function(req,res){
    res.render('signup');  
});

app.listen(3000);
