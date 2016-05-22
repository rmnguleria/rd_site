var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var ngoSchema = mongoose.Schema({
        name : {
            type : String,
            required : true
        },
        profileImage : {
            type : String
        },
		email : {
            type : String,
            required : true
        },
        description : {
            type : String
        },
        foundationYear : {
            type : Number
        },
        reg_address : {
            
            address : {
                type : String,
                required : true
            },
            pincode : {
                type : Number,
                required : true
            },
            city : {
                type : String,
                required : true
            },
            state : {
                type : String,
                required : true
            },
            country : {
                type : String,
                required : true,
                default : "India"
            }
        },
        cities : {
            type: [String], 
            index: true
        },
        causes : {
            type: [String], 
            index: true
        },
         createDate : {
             type : Date,
             default : Date.now,
             required : true
         },
         verified : {
             type : Boolean,
             default : false,
             required : true
         }
});

module.exports = mongoose.model('Ngo',ngoSchema);