const { ctrlWrapper, HttpError } = require('../helpers');
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { SECRET_KEY } = process.env;

const register = async (req, res, next) => {
    const { email, password } = req.body;
    const result = await User.findOne({ email });

    if (result) {
        throw HttpError(409, 'Email in use');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashPassword });

    res.status(201).json({
        user: {
            email: result.email,
            subscription: result.subscription
        }
    })
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw HttpError(401, 'Email or password is wrong');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw HttpError(401, 'Email or password is wrong');
    }

    // const token = 'dfgtyhju.rghyujik.fvbnhmjikol';

    const payload = {
        id: user.id,
        password: user.password,
        email: user.email,
        subscription: user.subscription
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });

    res.status(200).json({
       token: token,
        user: {
            email: user.email,
            subscription: user.subscription
        }
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
}