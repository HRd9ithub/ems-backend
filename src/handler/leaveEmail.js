
const nodemailer = require('nodemailer');
const { SMTP_EMAIL, SMTP_PASSWORD } = process.env

const leaveEmail = async (res, mailsubject, email, content) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASSWORD
        }
    })

    const from = `D9ithub <${SMTP_EMAIL}>`

    // multiple send mail 
    const mailOptions = {
        from: from,
        to: email,
        subject: mailsubject,
        html: content
    };
    await transporter.sendMail(mailOptions);
}

module.exports = leaveEmail;