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
    verify: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        required: [true, 'Verify token is required'],
    },
    avatarURL: String,
    token: String
}, { versionKey: false, timestamps: true })


userSchema.post('save', handleMongooseError);

const registerSchema = Joi.object({
    password: Joi.string().required().min(6),
    email: Joi.string().required().pattern(emailRegexp),
    subscription: Joi.string()
})

const emailSchema = Joi.object({
    email: Joi.string().required().pattern(emailRegexp),
})

const loginSchema = Joi.object({
    password: Joi.string().required().min(6),
    email: Joi.string().required().pattern(emailRegexp)
})

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid('starter', 'pro', 'business').required(),
})

const schemas = {
    registerSchema,
    emailSchema,
    loginSchema,
    updateSubscriptionSchema,
}

const User = model('user', userSchema);

module.exports = {
    User,
    schemas,
}
