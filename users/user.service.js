const config = require('config.json');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const jwt = require("jsonwebtoken");
const express = require("express");
const Joi = require("joi");
const PasswordComplexity = require("joi-password-complexity");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey("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");

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    forgot_password,
    reset_password,
};

async function authenticate({ username, password }) {
    console.log("here authenticate", password);
    const user = await db.User.scope('withHash').findOne({ where: { username } });
    console.log("userhash------------------------------------", user.hash);
    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // save user
    await db.User.create(params);
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}
// Init email config
const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    // port: 465,
    port: 587,
    secure: true, // use TLS
    // ssl: true,
    auth: {
        user: "system@share2riches.com",
        pass: "uQmgy62aevYKfMEk3g5wDxYP"
    }
    // host: "smtp.gmail.com",
    // port: 587,
    // // ssl: true,
    // secure: false,
    //  auth: {
    //   user: "baymax.development@gmail.com",
    //   pass: "sbaetyffyhzjscgk"
    // }
});

async function forgot_password(req, res) {
    let user;
    console.log(req.params.username)
    try {
        user = await db.User.findOne({
            where: { username: req.params.username }
        });
    } catch (err) {
        return res.status(404).send("Error reading from database");
    }
    if (!user) {
        return res.status(404).send("Email never registered")
    }
    //Generate one-time use URL with jwt token
    const secret = `${user.password}-${user.createAt}`;
    const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: 3600 //expires in 1 hour
    });
    const url = `http://app.share2riches.com/#/authentication/reset-password/${user.id}/${token}`;
    const emailTemplate = {
        subject: "Password Reset Request",
        html: `
            <p>Hello ${user.username},</p>
            <p>You recently requested to reset your password.</p>
            <p>Click the following link to finish resetting your password.</p>
            <a type="button" href=${url}>${url}</a>`,
        from: "system@share2riches.com",
        to: user.username
    };

    const sendEmail = async () => {
        try {
            // console.log(url, secret, token, emailTemplate)
            const info = await sgMail.send(emailTemplate);
            // const info = await transporter.sendMail(emailTemplate);
            console.log("email sent", info.response);
            return res.status(200).send("Email sent");
        } catch (err) {
            console.log(err);
            return res.status(500).send("Email sending error");
        }
    };
    sendEmail()
};

async function reset_password(req, res) {
    const { id, token } = req.params;
    console.log("reset password")
    const { password } = req.body
    console.log("password--", password)
    let user;
    try {
        user = await db.User.findOne({
            where: { id }
        });
        console.log("here user", user)
    } catch (err) {
        console.log(err);
        return res.status(404).send("Error reading database");
    }
    if (!user) return res.status(404).send("No user with that id");
    // Generate secret token
    const secret = `${user.password}-${user.createAt}`;
    //Verify that token is valid
    const payload = jwt.decode(token, secret);
    console.log("payload", payload)
    if (!payload) {
        return res.status(404).send("Invalid id or token")
    }
    if (payload.id != id) {
        return res.status(404).send("Invalid id or token")
    }
    //Hash new password and store in database
    // const salt = await bcrypt.genSalt(10);
    new_password = await bcrypt.hash(password, 10);
    user = await db.User.update({hash : new_password}, {where: {id}})
    console.log("user.password", new_password)
    return res.status(200).send("Password Reset Success!");
}
