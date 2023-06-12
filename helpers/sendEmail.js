const sgMail = require('@sendgrid/mail')
require('dotenv').config;

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey('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')

const sendEmail = async (data) => {
    const email = { ...data, from: 'natashamoskv@gmail.com' };
    sgMail.send(email).then(()=> console.log('Email sended')).catch((error) => console.log('!!!' + error.message));
    return true;
}

module.exports = sendEmail;
