const { ctrlWrapper, HttpError } = require('../helpers');
const { User } = require('../models/user');
const Jimp = require('jimp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
require('dotenv').config();

const { SECRET_KEY } = process.env;
const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
    const { email, password } = req.body;
    const result = await User.findOne({ email });

    if (result) {
        throw HttpError(409, 'Email in use');
    }

    const avatarURL = gravatar.url(email);
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL });

    res.status(201).json({
        user: {
            email: newUser.email,
            subscription: newUser.subscription
        }
    })
}

const login = async (req, res) => {
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

const getCurrent = async (req, res) => {
    const { email, subscription } = req.user;

    res.status(200).json({
        email,
        subscription
    })
}

const logout = async (req, res) => {
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, { token: '' });

    if (!user) {
        throw HttpError(401, 'Not authorized');
    }

    res.status(204).json({
        message: "Logout success"
    })

}


const updateSubscription = async (req, res) => {
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

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: tempPath, originalname } = req.file;

    const filename = `${_id}_${originalname}`; 
    const resultPath = path.join(avatarsDir, filename);
    await fs.rename(tempPath, resultPath);

    const image = await Jimp.read(resultPath);
    image.resize(250, 250);
    await image.writeAsync(filename);

    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { avatarURL: avatarURL });
    
    res.status(200).json({
        avatarURL,
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
}