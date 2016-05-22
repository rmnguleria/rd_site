var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
        name : {
          type : String,
          required : true  
        },
        ngo : {
            type : String,
            required : true
        },
        causes : {
            type : [String],
            required : true
        },
        description : {
            type : String,
            required : true
        },
	    createDate : {
		    type : Date,
		    default : Date.now,
		    required : true
	    }
});

module.exports = mongoose.model('Project',ngoSchema);