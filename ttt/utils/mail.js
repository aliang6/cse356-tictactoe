const nodemailer = require('nodemailer')
require('dotenv').config();

async function sendVerificationEmail(email, key){
    console.log(process.env.APP_PASS);
    let account = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
    service: "Gmail",
    //host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS
    }
    });


    /*
    Username	flossie.kemmer@ethereal.email
    Password	nKkvrK2DVhsCjbQTuZ
    */
    let mailOptions = {
        from: '"no-reply" <no-reply@tic-tac-terminator.com>',
        to: email,
        subject: "Test",
        text: "The verification code is abracadabra.",
        html: "<p>The verification code is abracadabra.</p>"
    }

    let info = await transporter.sendMail(mailOptions)
}

module.exports.sendVerificationEmail = sendVerificationEmail;