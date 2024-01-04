const getAdminEmail = require("./helper/getAdminEmail");
const cron = require('node-cron');
const user = require("./models/userSchema");
const moment = require("moment");
const decryptData = require("./helper/decryptData");


const sendBirthdayMail = async () => {
    
    try {
        cron.schedule("0 0 * * *", async () => {
            const userData = await user.find({}, { first_name: 1, last_name: 1, date_of_birth: 1, _id: 0 });
            const birthEmail = userData.filter((val) => {
                return moment(val.date_of_birth).format("DD-MM") === moment(new Date()).format("DD-MM")
            })

            if(birthEmail.length !== 0){
                const adminMailArray = await getAdminEmail();
    
                const adminMail = adminMailArray.map((val) => val.email);
    
                console.log(adminMail);
            }

        })





    } catch (error) {
        console.log(error);
    }
}


module.exports = sendBirthdayMail;