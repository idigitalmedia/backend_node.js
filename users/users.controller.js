const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./user.service');
const tfaservice = require('./tfaservice');

router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);
router.post('/auth/forgot-password/:username', userService.forgot_password);
router.post('/auth/reset-password/:id/:token', userService.reset_password);
router.post('/tfa/setup/:uname', tfaservice.setup);
router.get('/tfa/setup/:uname', tfaservice.get_tfa);
router.delete('/tfa/setup', tfaservice._delete);
router.post('/tfa/verify', tfaservice.verify);
router.post('/setPincode', userService.pinSave);
router.post('update_tfa', userService.update_tfa);
router.post('/update_alltfa_false', userService.update_alltfa_false);
router.post('/update_alltfa_true', userService.update_alltfa_true);
router.post('/update_alletfa_false', userService.update_alletfa_false);
router.post('/update_alletfa_true', userService.update_alletfa_true);
router.post('/send-code/:username', userService.sendCode);
router.post('/verify-code', userService.verifyCode);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().min(6).required(),
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        username: Joi.string().empty(''),
        password: Joi.string().min(6).empty(''),
        tfa_allow: Joi.boolean(),
        etfa_allow: Joi.boolean(),
        pinCode: Joi.number(),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}