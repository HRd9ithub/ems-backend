const expressValidator = require("express-validator");
const user = require("../models/userSchema");
const report = require("../models/workReportSchema");
const Leave = require("../models/leaveSchema");
const holiday = require("../models/holidaySchema");
let moment = require("moment");
let path = require("path");
const { default: mongoose } = require("mongoose");
var fs = require('fs');
const pdf = require("html-pdf");
var ejs = require('ejs');
const createActivity = require("../helper/addActivity");
const decryptData = require("../helper/decryptData");


const createReport = async (req, res) => {
    try {
        let { userId, work, date, totalHours } = req.body;

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: [...new Set(err)], success: false })
        }

        let error = []
        // user id check 
        let users = await user.findOne({ _id: req.body.userId || req.user._id })
        if (!users) { error.push("User is not exists.") }

        if (error.length !== 0) return res.status(422).json({ error: error, success: false });

        let reports = await report.findOne({
            $and: [
                { "userId": { $eq: new mongoose.Types.ObjectId(userId || req.user._id) } },
                { "date": { $eq: date } },
            ]
        })
        if (reports) {
            return res.status(400).json({ success: true, error: ["Please note that you are only able to submit one report per day."] })
        }

        const reportData = new report({
            userId: userId || req.user._id,
            work,
            date,
            totalHours
        });
        const response = await reportData.save();
        if (req.permissions.name.toLowerCase() !== "admin") {
            createActivity(req.user._id, "Work report added by")
        }
        return res.status(201).json({ success: true, message: "Data added successfully." })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update report 
const updateReport = async (req, res) => {
    try {
        let { userId, work, date, totalHours } = req.body;

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: [...new Set(err)], success: false })
        }

        let error = []
        // user id check 
        let users = await user.findOne({ _id: req.body.userId })
        if (!users) { error.push("User is not exists.") }

        if (error.length !== 0) return res.status(422).json({ error: error, success: false });

        let reports = await report.findOne({
            $and: [
                { "userId": { $eq: new mongoose.Types.ObjectId(userId || req.user._id) } },
                { "date": { $eq: date } },
            ]
        })
        if (reports && reports._id != req.params.id) {
            return res.status(400).json({ success: true, error: ["Please note that you are only able to submit one report per day."] })
        }

        let updateData = await report.findByIdAndUpdate({ _id: req.params.id }, {
            userId: userId || req.user._id,
            work,
            date,
            totalHours
        }, { new: true })

        if (updateData) {
            return res.status(200).json({ success: true, message: "Data updated successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Record is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get report function
const getReport = async (req, res) => {
    try {
        let { id, startDate, endDate } = req.query;
        var a = moment(startDate, "YYYY-MM-DD");
        var b = moment(endDate, "YYYY-MM-DD");
        a.isValid();
        if (!a.isValid() || !b.isValid()) {
            return res.status(400).json({ message: "Please enter startDate and endDate.", success: false })
        }

        let identify = id || req.permissions.name.toLowerCase() !== "admin";

        // get project data in database
        let data = await report.aggregate([
            {
                $match: {
                    $and: [
                        { date: { $gte: moment(startDate).format("YYYY-MM-DD") } },
                        { date: { $lte: moment(endDate).format("YYYY-MM-DD") } }],
                    userId : !identify ? {$nin : []} : { $eq : new mongoose.Types.ObjectId(id || req.user._id)}
                }
            },
            {
                $unwind: {
                    path: '$work'
                }
            },
            {
                $lookup: {
                    from: "projects", localField: "work.projectId", foreignField: "_id", as: "work.project"
                }
            },
            {
                $unwind: {
                    path: '$work.project',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    _id: {
                        userId: '$userId',
                        createdAt: '$createdAt',
                        updatedAt: '$updatedAt',
                        totalHours: '$totalHours',
                        date: '$date',
                        _id: '$_id',

                    },
                    work: {
                        $push: '$work'
                    }
                }
            },
            {
                $lookup: {
                    from: "users", localField: "_id.userId", foreignField: "_id", as: "user"
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: "$_id.userId",
                    totalHours: "$_id.totalHours",
                    date: "$_id.date",
                    work: 1,
                    updatedAt: "$_id.updatedAt",
                    _id: "$_id._id",
                    "user.employee_id": 1,
                    "user.profile_image": 1,
                    "user.first_name": 1,
                    "user.status": 1,
                    "user.last_name": 1
                }
            }
        ])

        let result = data.map((val) => {
            return {
                ...val,
                user: {
                    first_name: decryptData(val.user.first_name),
                    last_name: decryptData(val.user.last_name),
                    status: val.user.status,
                }
            }
        })
        return res.status(200).json({ success: true, message: "Successfully fetch a work report data.", data: result, permissions: req.permissions })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// create preview
const generatorPdf = async (req, res) => {
    try {
        let { id, month } = req.body;
        month.concat("-", "1");
        let date = moment(new Date()).format("YYYY-MM") == month

        const startDate = moment(month).startOf('month').format('YYYY-MM-DD');
        const endDate = date ? moment(new Date()).format('YYYY-MM-DD') : moment(month).endOf('month').format('YYYY-MM-DD');

        // get project data in database
        let data = await report.aggregate([
            {
                $match: {
                    $and: [
                        { date: { $gte: moment(startDate).format("YYYY-MM-DD") } },
                        { date: { $lte: moment(endDate).format("YYYY-MM-DD") } }],
                    userId: new mongoose.Types.ObjectId(id || req.user._id)
                }
            },
            {
                $unwind: {
                    path: '$work'
                }
            },
            {
                $lookup: {
                    from: "projects", localField: "work.projectId", foreignField: "_id", as: "work.project"
                }
            },
            {
                $unwind: {
                    path: '$work.project',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    _id: {
                        userId: '$userId',
                        createdAt: '$createdAt',
                        updatedAt: '$updatedAt',
                        totalHours: '$totalHours',
                        date: '$date',
                        _id: '$_id',

                    },
                    work: {
                        $push: '$work'
                    }
                }
            },
            {
                $project: {
                    userId: "$_id.userId",
                    totalHours: "$_id.totalHours",
                    date: "$_id.date",
                    work: 1,
                    updatedAt: "$_id.updatedAt",
                    _id: "$_id._id"
                }
            }
        ])

        let data1 = await Leave.find({
            user_id: new mongoose.Types.ObjectId(id || req.user._id),
            $and: [
                { "status": { $eq: "Approved" } },
                { "from_date": { $gte: moment(startDate).format("YYYY-MM-DD") } },
                { "to_date": { $lte: moment(endDate).format("YYYY-MM-DD") } },
            ]
        })
        let data2 = await holiday.find({
            $and: [
                { "date": { $gte: moment(startDate).format("YYYY-MM-DD") } },
                { "date": { $lte: moment(endDate).format("YYYY-MM-DD") } },
            ]
        })

        let filterData = [...data, ...data2]

        data1.forEach((val) => {
            var from_date = moment(val.from_date);
            var to_date = moment(val.to_date);
            let day = to_date.diff(from_date, 'days');
            for (let index = 0; index <= day; index++) {
                var new_date = moment(val.from_date).add(index, "d");
                let result = data2.find((item) => {
                    return item.date === moment(new_date).format("YYYY-MM-DD")
                })
                if (!result) {
                    filterData.push({ date: moment(new_date).format("YYYY-MM-DD"), name: "Leave", leave_for: val.leave_for })
                }
            }
        })
        var mstartDate = moment(startDate);
        var mendDate = moment(endDate);
        let days = mendDate.diff(mstartDate, 'days');
        for (let index = 0; index <= days; index++) {
            var new_date = moment(startDate).add(index, "d");
            if (moment(new_date).format("dddd") == "Saturday" || moment(new_date).format("dddd") == "Sunday") {
                filterData.push({ date: moment(new_date).format("YYYY-MM-DD"), name: moment(new_date).format("dddd") })
            }
        }

        let finalData = [];

        filterData.map((val) => {
            if (finalData.length === 0) {
                finalData.push(val)
            } else {
                let isDublication = finalData.filter((elem) => {
                    return val.date == elem.date
                })
                if (isDublication.length === 0 || (val?.name !== "Saturday" && val?.name !== "Sunday")) {
                    finalData.push(val)
                }
            }
        });

        let Test = finalData.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date)
        });

        let userData = await user.findOne({ _id: id }, { first_name: 1, last_name: 1 });

        //  ? generate total 
        let holidayCount = data2.length;
        // let dayCount = moment(endDate).format('DD');

        function uniqByKeepLast(data, key) {

            return [...new Map(data.map(x => [key(x), x])).values()]

        }

        let dayCount = uniqByKeepLast(Test, it => it.date).length;

        let halfLeave = Test.filter((cur) => {
            return cur.leave_for && cur.leave_for === "Half"
        })
        let fullLeave = Test.filter((cur) => {
            return cur.leave_for && cur.leave_for === "Full"
        })
        let LeaveCount = fullLeave.length + (halfLeave.length / 2);

        let totalHours = data.reduce((accumulator, currentValue) => {
            return (accumulator.totalHours ? Number(accumulator.totalHours) : Number(accumulator)) + Number(currentValue.totalHours)
        }, 0)

        let summary = {
            LeaveCount,
            halfLeave: halfLeave.length,
            fullLeave: fullLeave.length,
            holidayCount,
            dayCount,
            totalHours,
        }

        let ejsData = {
            reports: Test,
            summary: summary,
            name: userData.first_name.concat(" ", userData.last_name)
        }
        // get file path
        let filepath = path.resolve(__dirname, "../../views/reportTable.ejs");

        // read file using fs module
        let htmlstring = fs.readFileSync(filepath).toString();
        // add data dynamic
        let handleData = ejs.render(htmlstring, ejsData);

        // pdf format
        let options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm"
        }
        const pathData = path.join(__dirname,`../../public/document/${id.concat(".", "pdf")}`)
        pdf.create(handleData, options).toFile(pathData, (error, response) => {
            if (error) {
                return res.status(400).json({ message: error.message || 'Something went wrong. please try again.', success: false });
            }

            return res.status(200).json({ data: Test, success: true, summary: summary })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}


// dowlonad pdf
const dowloandReport = async (req, res) => {
    try {
        let { id } = req.query;

        // * get file path
        let filepath = path.resolve(__dirname, `../../public/document/${id.concat(".", "pdf")}`);

        // response send for frontend
        res.download(filepath);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}


module.exports = { createReport, getReport, updateReport, generatorPdf, dowloandReport }