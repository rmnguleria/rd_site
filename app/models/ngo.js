var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var ngoSchema = mongoose.Schema({
        Name : {
            type : String,
            required : true
        },
		Email : {
            type : String,
            required : true
        },
        Description : {
            type : String,
            required : true
        },
        FoundationYear : {
            type : Number,
            required : true
        },
        Address : {
            type : String,
            required : true
        },
        Cities : {
            type: [String], 
            index: true
        },
        Causes : {
            type: [String], 
            index: true
        },
 		password : {
             type: String,
             required : true
         }
});

// generating a hash
ngoSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
};

// check if password is valid
ngoSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password,this.local.password);
};

module.exports = mongoose.model('Ngo',ngoSchema);