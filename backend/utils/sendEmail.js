const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `"Crisis Pulse" <${process.env.EMAIL}>`,
        to,
        subject,
        text
    });
};

module.exports = sendEmail;
