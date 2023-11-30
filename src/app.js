require('dotenv').config()
const express = require("express");
var cors = require('cors');
const path = require("path")
var bodyParser = require('body-parser');
const AuthRoute = require("../src/routes/authRoute");
const designationRoute = require('./routes/designationRoute');
const menuRoute = require('./routes/menuRoute');
const holidayRoute = require('./routes/holidayRoute');
const leaveTypeRoute = require('./routes/leaveTypeRoute');
const accountRoute = require('./routes/accountRoute');
const timeSheetRoute = require('./routes/timesheetRoute');
const documentRoute = require('./routes/documentRoute');
const roleRoute = require('./routes/roleRoute');
const emergencyRoute = require('./routes/emergencyRoute');
const userDocumentRoute = require('./routes/userDocumentRoute');
const educationRoute = require('./routes/educationRoute');
const leaveRouter = require('./routes/leaveRoute');
const DashboardRoute = require('./routes/dashboardRoute');
const { swaggerServe, swaggerSetup } = require('./config');
const projectRoute = require('./routes/projectRoute')
const workReportRoute = require('./routes/workReportRoute')
const ReportRequestRoute = require('./routes/reportRequestRoute')
const activityRoute = require('./routes/activityRoute')
const passwordRoute = require('./routes/passwordRoute')
const attendanceRoute = require('./routes/attendanceRoute');
const userRoute = require("./routes/userRoute");

// add database
const connectDB = require("./DB/connection");

const app = express();

const port = process.env.PORT || 8000

app.use(cors())

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.json());

// image get route
app.use('/uploads', express.static(path.resolve('./public/images')))
app.use('/uploads', express.static(path.join(__dirname, '../public/document')))
app.use('/uploads', express.static(path.join(__dirname, '../public')));

// swagger route
app.use("/api-docs", swaggerServe, swaggerSetup);

// apiu route
app.use('/api/auth', AuthRoute)
app.use('/api/user', userRoute);
app.use('/api/project', projectRoute)
app.use('/api/designation', designationRoute)
app.use('/api/menu', menuRoute)
app.use('/api/holiday', holidayRoute)
app.use('/api/leaveType', leaveTypeRoute)
app.use('/api/leave', leaveRouter)
app.use('/api/timeSheet', timeSheetRoute)
app.use('/api/document', documentRoute)
app.use('/api/role', roleRoute)
app.use('/api/account', accountRoute)
app.use('/api/emergency', emergencyRoute)
app.use('/api/user_document', userDocumentRoute)
app.use('/api/education', educationRoute)
app.use('/api/dashboard', DashboardRoute)
app.use('/api/report', workReportRoute)
app.use('/api/report_request', ReportRequestRoute)
app.use('/api/activity', activityRoute)
app.use('/api/password', passwordRoute);
app.use('/api/attendance', attendanceRoute)

app.all("*", (req, res, next) => {
   let err = new Error(`Can't find ${req.originalUrl} on the server.`);
   err.status = "fail";
   err.statusCode = 404;
   next(err);
});

//An error handling middleware
app.use(function (err, req, res, next) {
   res.status(err.statusCode);
   res.json({ message: err.message, statusCode: err.statusCode })
});

connectDB().then(() => {
   app.listen(port, () => {
      console.log(`Server is running for ${port}.`)
  })
}).catch((error) => {
   console.log(error.message);
})
