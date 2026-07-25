const joi = require("joi");
const mongoose = require("mongoose");
const AuthorSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true,
        minlength: 3,
        maxlength: 200
    },
    country:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
    },
    age:{
        type:Number,
        required: true,
        min: 20,
    }
    
},{
    timestamps:true
});

const Author = mongoose.model("Author",AuthorSchema);

//function to validate create author

function validateCreateData(obj) {
    const schema = joi.object({
        name: joi.string().trim().min(3).max(200).required(),
        country: joi.string().trim().min(3).max(100).required(),
        age: joi.number().min(20).required()
    });
    return schema.validate(obj);
}
//function to validate update author

function validateUpdateData(obj) {
    const schema = joi.object({
        name: joi.string().trim().min(3).max(200),
        country: joi.string().trim().min(3).max(100),
        age: joi.number().min(20)
    });
    return schema.validate(obj);
}

module.exports = {
    Author,
    validateCreateData,
    validateUpdateData,
};