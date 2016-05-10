var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
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

module.exports = mongoose.model('Ngo',ngoSchema);