const getAdminEmail = require("./helper/getAdminEmail");
const cron = require('node-cron');
const user = require("./models/userSchema");
const moment = require("moment");
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require("path");
const ejs = require('ejs');
const decryptData = require("./helper/decryptData");

function changeTimezone() {
    const currentDate = new Date();

    // Convert the date to the Asia/Kolkata timezone
    const options = { timeZone: 'Asia/Kolkata' };
    const convertDate = currentDate.toLocaleDateString('en-US', options);

    return convertDate;
}

const sendBirthdayMail = async () => {
    const { SMTP_EMAIL, SMTP_PASSWORD } = process.env

    // Set the timezone to Asia/Kolkata
    const timeZone = 'Asia/Kolkata';

    try {
        const birthCronJob = cron.schedule("0 0 * * *", async () => {
            // Convert the date to the Asia/Kolkata timezone
            const currentDate = changeTimezone();

            const dateOfMonth = moment(currentDate, "MM/DD/YYYY").format("MM-DD");

            // find employee this date
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
                    html: content,
                    attachments: [
                        {
                            filename: 'd9_logo_black.png',
                            path: path.join(__dirname, "../../public/d9_logo_black.png"),
                            cid: 'fixedImage',
                        },
                    ],
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending birthday notification email:', error);
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