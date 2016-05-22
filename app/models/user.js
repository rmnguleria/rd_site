var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userTypes = ['user','admin'];

var userSchema = mongoose.Schema({
	name : {
		type : String,
		required : true
	},
	email : {
		type : String,
		required : true
	},
	local : {
		password : {
			type : String
		}
	},
	facebook : {
		id : {
			type : String,
		},
		token : {
			type : String
		}
	},
	createDate : {
		type : Date,
		default : Date.now,
		required : true
	},
	userType : {
		type : String,
		required : true,
		enum : userTypes,
		default : userTypes[0]
	}
});

// generating a hash
userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
};

// check if password is valid
userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password,this.local.password);
};

module.exports = mongoose.model('User',userSchema);