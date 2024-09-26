const express = require("express")
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { createReport, getReport, updateReport, generatorPdf, downloadReport, getWorkReportsByProject } = require("../controller/workReportController");
const { reportPermission, reportProjectPermission } = require("../middlewares/permission");

const workReportRoute = express.Router();

let workReportValidation = [
    check("date", "Invalid Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: "YYYY-MM-DD" }),
    check("totalHours", "Total hours is a required field.").notEmpty(),
    check("extraTotalHours", "Extra total hours is a required field.").notEmpty(),
    check('work', "Work data Insert values ​​into the array.").isArray(),
    check('work.*.projectId', "Project is a required field.").notEmpty(),
    check('work.*.description', "Description is a required field.").notEmpty(),
    check('work.*.hours', "Working hours is a required field.").notEmpty().custom(async (totalHours, { req }) => {
        if (totalHours && (totalHours.toString() > 24 || totalHours.toString() < 0)) {
            throw new Error('Working hours range from 0 to 24 hours.')
        }
    }),
    check('extraWork', "Extra work data Insert values ​​into the array.").isArray(),
    check('extraWork.*.projectId', "Extra project is a required field.").notEmpty(),
    check('extraWork.*.description', "Extra description is a required field.").notEmpty(),
    check('extraWork.*.hours', "Extra working hours is a required field.").notEmpty().custom(async (totalHours, { req }) => {
        if (totalHours && (totalHours.toString() > 24 || totalHours.toString() < 0)) {
            throw new Error('Extra working hours range from 0 to 24 hours.')
        }
    })
]

// create  api
workReportRoute.post('/', Auth, reportPermission, workReportValidation, createReport);

// update  api
workReportRoute.patch('/:id', Auth, reportPermission, workReportValidation, updateReport);

// get  api
workReportRoute.get('/project-wise', Auth, reportProjectPermission, getWorkReportsByProject);
// get  api
workReportRoute.get('/', Auth, reportPermission, getReport);

// preview api
workReportRoute.post('/report-preview', generatorPdf);
// pdf api
workReportRoute.get('/report-download', downloadReport);


module.exports = workReportRoute