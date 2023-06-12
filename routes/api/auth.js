const express = require('express');
const { validateBody, authenticate, upload } = require('../../middlewares');
const { schemas } = require('../../models/user');
const ctrl = require('../../controllers/auth-controller');

const router = express.Router();

router.post('/register', validateBody(schemas.registerSchema), ctrl.register);

router.get('/verify/:verificationToken', ctrl.verifyEmail);

router.post('/login', validateBody(schemas.loginSchema), ctrl.login);

router.get('/current', authenticate, ctrl.getCurrent);

router.post('/logout', authenticate, ctrl.logout);

router.patch('/:userId/subscription', authenticate, validateBody(schemas.updateSubscriptionSchema), ctrl.updateSubscription);

router.patch('/avatars', authenticate, upload.single('avatarURL'), ctrl.updateAvatar);

router.post('/verify/', validateBody(schemas.emailSchema), ctrl.resendVerifyEmail);

module.exports = router;