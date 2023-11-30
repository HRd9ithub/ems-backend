
const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const { SMTP_EMAIL, SMTP_PASSWORD } = process.env

const regulationMail = async (res,maillist,clockIn, clockOut, explanation, timestamp,name) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: SMTP_EMAIL,
                pass: SMTP_PASSWORD
            }
        });

        // get file path
        const filepath = path.resolve(__dirname, "../../views/attendanceRegulize.ejs");

        // read file using fs module
        const htmlstring = fs.readFileSync(filepath).toString();
        // add data dynamic
        const content = ejs.render(htmlstring, { clock_in_time : clockIn, clock_out_time : clockOut, explanation, timestamp, name });


        const from = `D9ithub <${SMTP_EMAIL}>`

        // multiple send mail 
        maillist.forEach(async(element) => {

            const mailOptions = {
                from: from,
                to: element.email,
                subject: "Change Request",
                html: content
            };
            await transporter.sendMail(mailOptions);
        });

    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

module.exports = regulationMail;