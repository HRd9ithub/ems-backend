const getAdminEmail = require("./helper/getAdminEmail");
const cron = require('node-cron');
const user = require("./models/userSchema");
const moment = require("moment");
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require("path");
const ejs = require('ejs');
const decryptData = require("./helper/decryptData");

const sendBirthdayMail = async () => {
    const { SMTP_EMAIL, SMTP_PASSWORD } = process.env

    // Set the timezone to Asia/Kolkata
    const timeZone = 'Asia/Kolkata';

    try {
        const birthCronJob = cron.schedule("0 0 * * *", async () => {

            const dateOfMonth = moment().format("MM-DD");
            const userData = await user.aggregate([
                {
                    $match: { date_of_birth: { $exists: true } },
                },
                {
                    $project: {
                        first_name: 1,
                        last_name: 1,
                        date_of_birth: {
                            $dateToString: {
                                format: "%m-%d",
                                date: "$date_of_birth",
                            },
                        },
                    },
                },
                {
                    $match: {
                        date_of_birth: { $eq: dateOfMonth }
                    }
                }
            ]);


            if (userData.length !== 0) {
                const adminMail = await getAdminEmail();
                const BirthdayList = userData.map((user) => {
                    return { name: decryptData(user?.first_name).concat(" ", decryptData(user?.last_name)) }
                })
                console.log('userData, currentDateofMonth() :>> ', BirthdayList);

                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    auth: {
                        user: SMTP_EMAIL,
                        pass: SMTP_PASSWORD
                    }
                });

                // get file path
                const filepath = path.resolve(__dirname, "../views/birthdayTemplate.ejs");

                // read file using fs module
                const htmlstring = fs.readFileSync(filepath).toString();
                // add data dynamic
                const content = ejs.render(htmlstring, { employeeList: BirthdayList });


                const from = `D9ithub <${SMTP_EMAIL}>`
                const mailOptions = {
                    from: from,
                    to: adminMail,
                    subject: "Birthday Announcement",
                    html: content
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending birthday notification email:', error);
                    } else {
                        console.log('Birthday notification email sent:', info.response);
                    }
                })
            }
        }, {
            timezone: timeZone
        });

        // Start the cron job
        birthCronJob.start();
    } catch (error) {
        console.log(error, "catch-error");
    }
}

module.exports = sendBirthdayMail;