
const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const { SMTP_EMAIL, SMTP_PASSWORD } = process.env

const workReportMail = async (res, maillist, contentData) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASSWORD
        }
    });

    // get file path
    const filepath = path.resolve(__dirname, "../../views/workReportTemplate.ejs");

    // read file using fs module
    const htmlstring = fs.readFileSync(filepath).toString();

    // add data dynamic
    const content = ejs.render(htmlstring, contentData);


    const from = `D9ithub <${SMTP_EMAIL}>`


    // multiple send mail 
    maillist.forEach(async (element) => {

        const mailOptions = {
            from: from,
            to: element.email,
            subject: "Work Report Request",
            html: content
        };
        await transporter.sendMail(mailOptions);
    });
}

module.exports = workReportMail;