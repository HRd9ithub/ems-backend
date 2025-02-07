const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const { SMTP_EMAIL, SMTP_PASSWORD } = process.env

// Function to send email with EJS template
const sendAttendanceEmail = async (email, data) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD
    }
  })

  // Render EJS template
  const templatePath = path.join(__dirname, "../../views/attendance_email.ejs");
  const htmlContent = await ejs.renderFile(templatePath, data);

  const from = `D9ithub <${SMTP_EMAIL}>`

  const mailOptions = {
    from: from,
    to: email,
    subject: "Attendance Record",
    html: htmlContent,
    attachments: [
      {
        filename: 'd9_logo_black.png',
        path: path.join(__dirname, "../../public/d9_logo_black.png"),
        cid: 'fixedImage',
      },
    ],
  };
  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully!"); ``
};

module.exports = sendAttendanceEmail;
