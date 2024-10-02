const { default: mongoose } = require("mongoose")
const Leave = require("../models/leaveSchema");
const holiday = require("../models/holidaySchema");
const moment = require("moment");

const offDay = ["Saturday", "Sunday"]

exports.leaveCalculation = async (userId, type, date) => {
    const identify = true;
    let total = 0;
    const joiningDate = moment(date);

    const afterThreeMonthDate = joiningDate.add(3, 'months');

    // Check if future date is in the same year as current date
    const isSameYear = new Date(afterThreeMonthDate).getFullYear() === new Date().getFullYear();

    // If not in the same year, set to start of the current year
    const adjustedDate = isSameYear ? afterThreeMonthDate : moment().startOf('year');

    const leaveStartDate = adjustedDate.format("YYYY-MM-DD");

    // Start of the current year
    const startOfYear = moment().clone().startOf('year').format('YYYY-MM-DD');
    // End of the current year
    const endOfYear = moment().clone().endOf('year').format('YYYY-MM-DD');

    const allLeave = await Leave.aggregate([
        {
            $match: {
                user_id: !identify ? { $nin: [] } : { $eq: new mongoose.Types.ObjectId(userId) },
                status: "Approved",
                $and: [
                    { "from_date": { $gte: leaveStartDate } },
                    { "to_date": { $lte: endOfYear } },
                ],
                deleteAt: { $exists: false }
            }
        },
        {
            $lookup:
            {
                from: "leavetypes",
                localField: "leave_type_id",
                foreignField: "_id",
                as: "leaveType"
            }
        },
        {
            $match: {
                "leaveType._id": new mongoose.Types.ObjectId(type)
            }
        },
    ]);

    const holidays = await holiday.find({
        $and: [
            { "date": { $gte: startOfYear } },
            { "date": { $lte: endOfYear } },
        ]
    }, { "date": 1 });

    const holidayArray = holidays.map((val) => val.date)

    allLeave.forEach((elem) => {
        const addDate = moment(elem.to_date).add(1, "d");
        const subDate = moment(elem.from_date).subtract(1, "d")
        if ((holidayArray.includes(moment(addDate).format("YYYY-MM-DD")) || offDay.includes(moment(addDate).format("dddd"))) && (holidayArray.includes(moment(subDate).format("YYYY-MM-DD")) || offDay.includes(moment(subDate).format("dddd")))) {
            let fromNewDate = ""
            let toNewDate = "";

            if (holidayArray.includes(moment(subDate).format("YYYY-MM-DD"))) {
                if (offDay.includes(moment(subDate).format("dddd"))) {
                    moment(subDate).format("dddd") === "Saturday" ? fromNewDate = moment(subDate).format("YYYY-MM-DD") : fromNewDate = moment(moment(elem.from_date).subtract(2, "d")).format("YYYY-MM-DD");
                } else {
                    moment(subDate).format("dddd") === "Monday" ? fromNewDate = moment(moment(elem.from_date).subtract(3, "d")).format("YYYY-MM-DD") : fromNewDate = moment(subDate).format("YYYY-MM-DD");
                }
            } else {
                moment(subDate).format("dddd") === "Saturday" ? fromNewDate = moment(subDate).format("YYYY-MM-DD") : fromNewDate = moment(moment(elem.from_date).subtract(2, "d")).format("YYYY-MM-DD");
            }

            if (holidayArray.includes(moment(addDate).format("YYYY-MM-DD"))) {
                if (offDay.includes(moment(addDate).format("dddd"))) {
                    moment(addDate).format("dddd") === "Sunday" ? toNewDate = moment(addDate).format("YYYY-MM-DD") : toNewDate = moment(moment(elem.to_date).add(2, "d")).format("YYYY-MM-DD");
                } else {
                    moment(addDate).format("dddd") === "Friday" ? toNewDate = moment(moment(elem.to_date).add(3, "d")).format("YYYY-MM-DD") : toNewDate = moment(addDate).format("YYYY-MM-DD")
                }
            } else {
                moment(addDate).format("dddd") === "Sunday" ? toNewDate = moment(addDate).format("YYYY-MM-DD") : toNewDate = moment(moment(elem.to_date).add(2, "d")).format("YYYY-MM-DD");
            }
            const days = moment(toNewDate).diff(moment(fromNewDate), 'days') + 1;
            total = total + days
        } else {
            total = total + elem.duration
        }
    })

    return total
}

exports.checkJoiningDate = (joining_date) => {
    // Assuming currentDate is the current date and dateToCheck is the date you want to check
    const currentDate = moment();
    const dateToCheck = moment(joining_date); // Replace this with your desired date

    // Calculate the difference in months
    const monthsDiff = currentDate.diff(dateToCheck, 'months');

    return monthsDiff;
}
