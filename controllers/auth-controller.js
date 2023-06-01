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
            email: newUser.email,
            subscription: newUser.subscription
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

    const payload = {
        id: user.id,
        password: user.password,
        email: user.email,
        subscription: user.subscription
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
       token: token,
        user: {
            email: user.email,
            subscription: user.subscription
        }
    })
}

const getCurrent = async (req, res, next) => {
    const { email, subscription } = req.user;

    res.status(200).json({
        email,
        subscription
    })
}

const logout = async (req, res, next) => {
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, { token: '' });

    if (!user) {
        throw HttpError(401, 'Not authorized');
    }

    res.status(204).json({
        message: "Logout success"
    })

}


const updateSubscription = async (req, res, next) => {
    const { userId } = req.params;

    if (!req.body) {
        throw HttpError(400, 'missing field subscription');
    }

    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (!user) {
        throw HttpError(404);
    }

    res.status(200).json(user);

}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateSubscription: ctrlWrapper(updateSubscription),
}