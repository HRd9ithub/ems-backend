const expressValidator = require("express-validator");
const user = require("../models/userSchema");
const report = require("../models/workReportSchema");
const Leave = require("../models/leaveSchema");
const holiday = require("../models/holidaySchema");
const createActivity = require("../helper/addActivity");
const decryptData = require("../helper/decryptData");
const { default: mongoose } = require("mongoose");
const moment = require("moment");
const path = require("path");
const fs = require('fs');
const ejs = require('ejs');
const reportDownloadSchema = require("../models/reportDownloadSchema");
const { default: puppeteer } = require("puppeteer");
const workReportMail = require("../handler/workReportEmail");
const ReportRequestSchema = require("../models/reportRequestSchema");

const createReport = async (req, res) => {
    try {
        let { userId, work, date, totalHours, _id, extraWork, extraTotalHours } = req.body;

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: [...new Set(err)], success: false })
        }

        if (work.length < 1 && extraWork.length < 1) {
            return res.status(422).json({ error: ["Please add for work data or extra Work data, and try again."], success: false })
        }

        let error = []
        // user id check 
        const users = await user.findOne({ _id: userId || req.user._id })
        if (!users) { error.push("User is not exists.") }

        if (error.length !== 0) return res.status(422).json({ error: error, success: false });

        const reports = await report.findOne({
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
            totalHours,
            extraWork,
            extraTotalHours
        });
        const response = await reportData.save();
        if (req.permissions.name.toLowerCase() !== "admin") {
            createActivity(req.user._id, "Work report added by")
        }

        if (_id) {
            await workReportMail(res, users.email, {
                status: "added",
                timestamp: moment(req.body.date).format("DD MMM YYYY"),
                name: users?.first_name.concat(" ", users.last_name),
                isAdmin: true
            });
            await ReportRequestSchema.findByIdAndUpdate({ _id: _id }, { $set: { deleteAt: new Date(), status: "Approved" } });
        }
        return res.status(201).json({ success: true, message: "Data added successfully." })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update report 
const updateReport = async (req, res) => {
    try {
        let { userId, work, date, totalHours, _id, extraWork, extraTotalHours } = req.body;

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: [...new Set(err)], success: false })
        }

        if (work.length < 1 && extraWork.length < 1) {
            return res.status(422).json({ error: ["Please add for work data or extra Work data, and try again."], success: false })
        }

        let error = []
        // user id check 
        const users = await user.findOne({ _id: userId || req.user._id })
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

        const updateData = await report.findByIdAndUpdate({ _id: req.params.id }, {
            userId: userId || req.user._id,
            work,
            date,
            totalHours,
            extraWork,
            extraTotalHours
        }, { new: true })

        if (updateData) {
            if (_id) {
                await workReportMail(res, users.email, {
                    status: "updated",
                    timestamp: moment(req.body.date).format("DD MMM YYYY"),
                    name: users?.first_name.concat(" ", users.last_name),
                    isAdmin: true
                });
                await ReportRequestSchema.findByIdAndUpdate({ _id: _id }, { $set: { deleteAt: new Date(), status: "Approved" } });
            }
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
        const findResult = [];
        let { id, startDate, endDate } = req.query;
        var a = moment(startDate, "YYYY-MM-DD");
        var b = moment(endDate, "YYYY-MM-DD");
        a.isValid();
        if (!a.isValid() || !b.isValid()) {
            return res.status(400).json({ message: "Please enter startDate and endDate.", success: false })
        }

        const identify = id || req.permissions.name.toLowerCase() !== "admin";

        const leaveData = await Leave.aggregate([
            {
                $match: {
                    user_id: !identify ? { $nin: [] } : { $eq: new mongoose.Types.ObjectId(id || req.user._id) },
                    $and: [
                        { "status": { $eq: "Approved" } },
                    ],
                    $or: [
                        {
                            $and: [
                                { 'from_date': { $gte: startDate } },
                                { 'from_date': { $lte: endDate } },
                            ]
                        },
                        {
                            $and: [
                                { 'to_date': { $gte: startDate } },
                                { 'to_date': { $lte: endDate } },
                            ]
                        }
                    ],
                    deleteAt: { $exists: false }
                }
            },
            {
                $lookup: {
                    from: "users", localField: "user_id", foreignField: "_id", as: "user"
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    // "user.status": "Active",
                    "user.delete_at": { $exists: false },
                    "user.joining_date": { "$lte": new Date(moment(new Date()).format("YYYY-MM-DD")) },
                    $or: [
                        { "user.leaveing_date": { $eq: null } },
                        { "user.leaveing_date": { $gt: new Date(moment(new Date()).format("YYYY-MM-DD")) } },
                    ]
                }
            },
        ]);

        const workReports = await report.aggregate([
            {
                $match: {
                    $and: [
                        { date: { $gte: moment(startDate).format("YYYY-MM-DD") } },
                        { date: { $lte: moment(endDate).format("YYYY-MM-DD") } }
                    ],
                    userId: !identify ? { $nin: [] } : { $eq: new mongoose.Types.ObjectId(id || req.user._id) }
                }
            },
            {
                $unwind: {
                    path: '$extraWork',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'extraWork.projectId',
                    foreignField: '_id',
                    as: 'extraWork.project'
                }
            },
            {
                $unwind: {
                    path: '$extraWork.project',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    originalDocument: { $first: '$$ROOT' },
                    extraWork: { $push: '$extraWork' }
                }
            },
            {
                $addFields: {
                    'originalDocument.extraWork': {
                        $filter: {
                            input: '$extraWork',
                            as: 'ew',
                            cond: { $ne: ['$$ew', {}] }
                        }
                    }
                }
            },
            {
                $replaceRoot: { newRoot: '$originalDocument' }
            },
            {
                $unwind: {
                    path: '$work',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'work.projectId',
                    foreignField: '_id',
                    as: 'work.project'
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
                    originalDocument: { $first: '$$ROOT' },
                    work: { $push: '$work' }
                }
            },
            {
                $addFields: {
                    'originalDocument.work': {
                        $filter: {
                            input: '$work',
                            as: 'w',
                            cond: { $ne: ['$$w', {}] }  // This filters out empty objects from the array
                        }
                    }
                }
            },
            {
                $replaceRoot: { newRoot: '$originalDocument' }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$userId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$userId'] },
                                delete_at: { $exists: false },
                                joining_date: { $lte: new Date(moment(new Date()).format('YYYY-MM-DD')) },
                                $or: [
                                    { leaveing_date: { $eq: null } },
                                    { leaveing_date: { $gt: new Date(moment(new Date()).format('YYYY-MM-DD')) } }
                                ]
                            }
                        },
                        { $project: { first_name: 1, last_name: 1, status: 1 } }
                    ],
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    date: 1,
                    userId: 1,
                    totalHours: 1,
                    work: 1,
                    extraWork: 1,
                    user: 1,
                    updatedAt: 1,
                    createdAt: 1,
                    extraTotalHours: {
                        $reduce: {
                            input: "$extraWork",
                            initialValue: 0,
                            in: { $add: ["$$value", { $toDouble: "$$this.hours" }] }
                        }
                    }
                }
            }
        ]);

        const result = workReports.map((val) => {
            return {
                ...val,
                user: {
                    first_name: decryptData(val.user.first_name),
                    last_name: decryptData(val.user.last_name),
                    status: val.user.status,
                }
            }
        })

        leaveData.forEach((val) => {
            var from_date = moment(val.from_date);
            var to_date = moment(val.to_date);
            let day = to_date.diff(from_date, 'days');
            for (let index = 0; index <= day; index++) {
                var new_date = moment(val.from_date).add(index, "d");
                findResult.push({
                    date: moment(new_date).format("YYYY-MM-DD"), name: "Leave", leave_for: val.leave_for, user: {
                        first_name: decryptData(val.user.first_name),
                        last_name: decryptData(val.user.last_name),
                        status: val.user.status,
                    },
                    userId: val.user_id,
                    _id: val._id
                })
            }
        });

        result.push(...findResult);

        let finalRecord = []
        result.map((value) => {
            const entry = findResult.find((elem) => {
                return elem.date === value.date && (elem.leave_for === "Half" || elem.leave_for === "First Half" || elem.leave_for === "Second Half") && elem.userId.toString() == value.userId.toString()
            });
            if (!entry) {
                finalRecord.push(value);
            } else if (entry && !value.name) {
                finalRecord.push({ ...value, leave_for: entry.leave_for + " Leave" });
            }
        })

        const record = finalRecord.filter((val) => {
            return new Date(val.date) <= new Date(endDate) && new Date(val.date) >= new Date(startDate)
        });

        // Custom sorting function
        function customSort(a, b) {
            // First, compare dates
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;

            // If dates are equal, compare IDs
            if (a.userId < b.userId) return -1;
            if (a.userId > b.userId) return 1;

            // If both dates and IDs are equal
            return 0;
        }

        // Sort the array using the custom sorting function
        record.sort(customSort);
        return res.status(200).json({ success: true, message: "Successfully fetch a work report data.", data: record, permissions: req.permissions })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// create preview
const generatorPdf = async (req, res) => {
    try {
        const findResult = [];
        let { id, month } = req.body;
        month.concat("-", "1");
        const date = moment(new Date()).format("YYYY-MM") == month

        const startDate = moment(month).startOf('month').format('YYYY-MM-DD');
        const endDate = date ? moment(new Date()).format('YYYY-MM-DD') : moment(month).endOf('month').format('YYYY-MM-DD');

        // get report data in database
        const reportData = await report.aggregate([
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
                    path: '$extraWork',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'extraWork.projectId',
                    foreignField: '_id',
                    as: 'extraWork.project'
                }
            },
            {
                $unwind: {
                    path: '$extraWork.project',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    originalDocument: { $first: '$$ROOT' },
                    extraWork: { $push: '$extraWork' }
                }
            },
            {
                $addFields: {
                    'originalDocument.extraWork': {
                        $filter: {
                            input: '$extraWork',
                            as: 'ew',
                            cond: { $ne: ['$$ew', {}] }
                        }
                    }
                }
            },
            {
                $replaceRoot: { newRoot: '$originalDocument' }
            },
            {
                $unwind: {
                    path: '$work',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'work.projectId',
                    foreignField: '_id',
                    as: 'work.project'
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
                    originalDocument: { $first: '$$ROOT' },
                    work: { $push: '$work' }
                }
            },
            {
                $addFields: {
                    'originalDocument.work': {
                        $filter: {
                            input: '$work',
                            as: 'w',
                            cond: { $ne: ['$$w', {}] }  // This filters out empty objects from the array
                        }
                    }
                }
            },
            {
                $replaceRoot: { newRoot: '$originalDocument' }
            },
            {
                $project: {
                    _id: 1,
                    date: 1,
                    userId: 1,
                    totalHours: 1,
                    work: 1,
                    extraWork: 1,
                    updatedAt: 1,
                    createdAt: 1,
                    extraTotalHours: {
                        $reduce: {
                            input: "$extraWork",
                            initialValue: 0,
                            in: { $add: ["$$value", { $toDouble: "$$this.hours" }] }
                        }
                    }
                }
            }
        ])

        // leave data get
        const leaveData = await Leave.find({
            user_id: new mongoose.Types.ObjectId(id || req.user._id),
            $and: [
                { "status": { $eq: "Approved" } },
            ],
            $or: [
                {
                    $and: [
                        { 'from_date': { $gte: startDate } },
                        { 'from_date': { $lte: endDate } },
                    ]
                },
                {
                    $and: [
                        { 'to_date': { $gte: startDate } },
                        { 'to_date': { $lte: endDate } },
                    ]
                }
            ],
            deleteAt: { $exists: false }
        })

        // holiday data get
        const holidayData = await holiday.find({
            $and: [
                { "date": { $gte: moment(startDate).format("YYYY-MM-DD") } },
                { "date": { $lte: moment(endDate).format("YYYY-MM-DD") } },
            ]
        })


        // leave between days add
        leaveData.forEach((val) => {
            var from_date = moment(val.from_date);
            var to_date = moment(val.to_date);
            let day = to_date.diff(from_date, 'days');
            for (let index = 0; index <= day; index++) {
                var new_date = moment(val.from_date).add(index, "d");
                let result = holidayData.find((item) => {
                    return item.date === moment(new_date).format("YYYY-MM-DD")
                })
                if (!result) {
                    findResult.push({ date: moment(new_date).format("YYYY-MM-DD"), name: "Leave", leave_for: val.leave_for, _id: val._id })
                }
            }
        });

        const halfleaveData = [];
        const filterData = reportData.map((val) => {
            const entry = findResult.find((elem) => {
                return elem.date === val.date
            });
            if (entry && (entry.leave_for === "Half" || entry.leave_for === "Fisrt Half" || entry.leave_for === "Second Half")) {
                halfleaveData.push(entry._id)
                return { ...val, leave_for: entry.leave_for + " Leave" }
            } else {
                return val
            }
        });

        const removehlafleave = findResult.filter((val) => {
            return !halfleaveData.includes(val._id)
        })
        filterData.push(...removehlafleave, ...holidayData);


        // add saturday and sunday
        var mstartDate = moment(startDate);
        var mendDate = moment(endDate);
        let days = mendDate.diff(mstartDate, 'days');
        for (let index = 0; index <= days; index++) {
            var new_date = moment(startDate).add(index, "d");
            if (moment(new_date).format("dddd") == "Saturday" || moment(new_date).format("dddd") == "Sunday") {
                filterData.push({ date: moment(new_date).format("YYYY-MM-DD"), name: moment(new_date).format("dddd") })
            }
        }

        let removeDuplicateData = [];

        filterData.map((val) => {
            if (removeDuplicateData.length === 0) {
                removeDuplicateData.push(val)
            } else {
                let isDublication = removeDuplicateData.filter((elem) => {
                    return val.date == elem.date
                })
                if (isDublication.length === 0 || (val?.name !== "Saturday" && val?.name !== "Sunday")) {
                    removeDuplicateData.push(val)
                }
            }
        });

        const record = removeDuplicateData.filter((val) => {
            return new Date(val.date) <= new Date(endDate) && new Date(val.date) >= new Date(startDate)
        });

        // final data store
        const finalRecord = record.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date)
        });

        const userData = await user.findOne({ _id: id }, { first_name: 1, last_name: 1 });

        // ==================================  summary section
        const holidayCount = holidayData.length;
        // let dayCount = moment(endDate).format('DD');

        function uniqByKeepLast(data, key) {

            return [...new Map(data.map(x => [key(x), x])).values()]

        }

        const dayCount = uniqByKeepLast(finalRecord, it => it.date).length;

        const halfLeave = finalRecord.filter((cur) => {
            return cur.leave_for && (cur.leave_for === "Half Leave" || cur.leave_for === "First Half Leave" || cur.leave_for === "Second Half Leave")
        })
        const fullLeave = finalRecord.filter((cur) => {
            return cur.leave_for && cur.leave_for === "Full"
        })

        const totalHours = reportData.reduce((accumulator, currentValue) => {
            return (currentValue.totalHours ? accumulator + Number(currentValue.totalHours) : accumulator)
        }, 0)

        const extraHours = reportData.reduce((accumulator, currentValue) => {
            return (currentValue.extraTotalHours ? accumulator + Number(currentValue.extraTotalHours) : accumulator)
        }, 0)

        const summary = {
            halfLeave: halfLeave.length,
            fullLeave: fullLeave.length,
            holidayCount,
            dayCount,
            totalHours,
            extraHours
        }

        const response = await reportDownloadSchema.create({
            name: userData.first_name.concat(" ", userData.last_name),
            summary: summary,
            reports: finalRecord
        })

        return res.status(200).json({ data: finalRecord, success: true, summary: summary, id: response._id })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// download pdf
const downloadReport = async (req, res) => {
    try {
        const { id } = req.query;

        const data = await reportDownloadSchema.findOne({ _id: id });

        if (!data) {
            return res.status(404).json({ message: 'Record not found', success: false })
        }

        const ejsData = {
            reports: data.reports,
            summary: data.summary,
            name: data.name
        }
        // get file path
        const filepath = path.resolve(__dirname, "../../views/workReport.ejs");

        // read file using fs module
        const htmlstring = fs.readFileSync(filepath).toString();
        // add data dynamic
        const htmlContent = ejs.render(htmlstring, ejsData);

        // Launch a headless browser using puppeteer
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            timeout: 10000,
        });
        const page = await browser.newPage();

        // Set the content and styles for the PDF
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        // Generate the PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            displayHeaderFooter: false, // Set to false to remove the duplicate head
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px',
            },
            printBackground: true,
        });

        // Close the browser
        await browser.close();

        // Send the generated PDF as a downloadable file
        const pdfFileName = '../../public/work-report.pdf';
        const pdfPath = path.join(__dirname, pdfFileName);
        // Save the PDF to a file
        fs.writeFileSync(pdfPath, pdfBuffer);

        // * get file path
        // let filepath = path.resolve(__dirname, `../../public/document/${id.concat(".", "pdf")}`);

        // response send for frontend
        res.download(pdfPath)
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

const getWorkReportsByProject = async (req, res) => {
    try {
        let { startDate, endDate, projectId } = req.query;
        var a = moment(startDate, "YYYY-MM-DD");
        var b = moment(endDate, "YYYY-MM-DD");

        if (!a.isValid() || !b.isValid()) {
            return res.status(400).json({ message: "Please enter valid startDate and endDate.", success: false });
        }

        const matchCondition = [
            { date: { $gte: startDate, $lte: endDate } }
        ];

        // Check if projectId is provided
        if (projectId) {
            matchCondition.push({
                $or: [
                    { 'work.projectId': new mongoose.Types.ObjectId(projectId) },
                    { 'extraWork.projectId': new mongoose.Types.ObjectId(projectId) }
                ]
            });
        }

        const pipeline = [
            { $match: { $and: matchCondition } },
            // Unwind and lookup for extraWork
            { $unwind: { path: '$extraWork', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'extraWork.projectId',
                    foreignField: '_id',
                    as: 'extraWork.project'
                }
            },
            { $unwind: { path: '$extraWork.project', preserveNullAndEmptyArrays: true } },
            // Group back extraWork
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    extraWork: { $push: '$extraWork' }
                }
            },
            { $addFields: { 'doc.extraWork': '$extraWork' } },
            { $replaceRoot: { newRoot: '$doc' } },
            // Filter extraWork if projectId is provided
            {
                $addFields: {
                    extraWork: {
                        $filter: {
                            input: '$extraWork',
                            cond: projectId
                                ? { $eq: ['$$this.projectId', new mongoose.Types.ObjectId(projectId)] }
                                : { $ne: ['$$this', {}] }
                        }
                    }
                }
            },
            // Lookup for user
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$userId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$userId'] },
                                delete_at: { $exists: false },
                                joining_date: { $lte: new Date() },
                                $or: [
                                    { leaveing_date: null },
                                    { leaveing_date: { $gt: new Date() } }
                                ]
                            }
                        },
                        { $project: { first_name: 1, last_name: 1, status: 1 } }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            // Unwind and lookup for work
            { $unwind: { path: '$work', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'work.projectId',
                    foreignField: '_id',
                    as: 'work.project'
                }
            },
            { $unwind: { path: '$work.project', preserveNullAndEmptyArrays: true } },
            // Group back work
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    work: { $push: '$work' }
                }
            },
            { $addFields: { 'doc.work': '$work' } },
            { $replaceRoot: { newRoot: '$doc' } },
            // Filter work if projectId is provided
            {
                $addFields: {
                    work: {
                        $filter: {
                            input: '$work',
                            cond: projectId
                                ? { $eq: ['$$this.projectId', new mongoose.Types.ObjectId(projectId)] }
                                : { $ne: ['$$this', {}] }
                        }
                    }
                }
            },
            // Final projection
            {
                $project: {
                    _id: 1,
                    date: 1,
                    userId: 1,
                    totalHours: {
                        $reduce: {
                            input: '$work',
                            initialValue: 0,
                            in: { $add: ['$$value', { $toDouble: '$$this.hours' }] }
                        }
                    },
                    extraTotalHours: {
                        $reduce: {
                            input: '$extraWork',
                            initialValue: 0,
                            in: { $add: ['$$value', { $toDouble: '$$this.hours' }] }
                        }
                    },
                    work: 1,
                    extraWork: 1,
                    user: 1,
                    updatedAt: 1,
                    createdAt: 1
                }
            }
        ];

        const workReports = await report.aggregate(pipeline);

        const result = workReports.map((val) => {
            return {
                ...val,
                user: {
                    first_name: decryptData(val.user?.first_name || ""),
                    last_name: decryptData(val.user?.last_name || ""),
                    status: val.user.status,
                }
            }
        })

        return res.status(200).json({
            success: true,
            data: result,
            message: "Work report data fetch successfully.",
            permissions: req.permissions
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error.",
            success: false
        })
    }
}

module.exports = { createReport, getReport, updateReport, generatorPdf, downloadReport, getWorkReportsByProject }