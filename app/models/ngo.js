var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var ngoSchema = mongoose.Schema({
        name : {
            type : String,
            required : true
        },
		email : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        foundationYear : {
            type : Number,
            required : true
        },
        address : {
            type : String,
            required : true
        },
        cities : {
            type: [String], 
            index: true
        },
        causes : {
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