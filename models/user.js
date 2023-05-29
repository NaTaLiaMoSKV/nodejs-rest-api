const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { handleMongooseError } = require('../helpers');

const emailRegexp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const userSchema = new Schema({
    password: {
        type: String,
        required: [true, 'Set password for user']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: emailRegexp
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    token: String
}, { versionKey: false, timestamps: true })


userSchema.post('save', handleMongooseError);

const registerSchema = Joi.object({
    password: Joi.string().required().min(6),
    email: Joi.string().required().pattern(emailRegexp),
    subscription: Joi.string()
})

const loginSchema = Joi.object({
    password: Joi.string().required().min(6),
    email: Joi.string().required().pattern(emailRegexp)
})

const schemas = {
    registerSchema,
    loginSchema,
}

const User = model('user', userSchema);

module.exports = {
    User,
    schemas,
}
