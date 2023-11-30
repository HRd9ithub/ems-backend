const activity_log = require("../models/activitySchema");
let moment = require("moment");

const createActivity = async(id,title) => {
    let activitiesData = new activity_log({
        user_id: id,
        title: title,
        date : moment(new Date()).format("YYYY-MM-DD")
    });
   return await activitiesData.save();
}

module.exports = createActivity