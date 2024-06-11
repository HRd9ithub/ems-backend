require('dotenv').config()
const express = require("express");
var cors = require('cors');
const path = require("path")
var bodyParser = require('body-parser');
const AuthRoute = require("./src/routes/authRoute");
const designationRoute = require('./src/routes/designationRoute');
const menuRoute = require('./src/routes/menuRoute');
const holidayRoute = require('./src/routes/holidayRoute');
const leaveTypeRoute = require('./src/routes/leaveTypeRoute');
const accountRoute = require('./src/routes/accountRoute');
const documentRoute = require('./src/routes/documentRoute');
const roleRoute = require('./src/routes/roleRoute');
const emergencyRoute = require('./src/routes/emergencyRoute');
const userDocumentRoute = require('./src/routes/userDocumentRoute');
const educationRoute = require('./src/routes/educationRoute');
const leaveRouter = require('./src/routes/leaveRoute');
const DashboardRoute = require('./src/routes/dashboardRoute');
const { swaggerServe, swaggerSetup } = require('./src/config');
const projectRoute = require('./src/routes/projectRoute')
const workReportRoute = require('./src/routes/workReportRoute')
const ReportRequestRoute = require('./src/routes/reportRequestRoute')
const activityRoute = require('./src/routes/activityRoute')
const passwordRoute = require('./src/routes/passwordRoute')
const attendanceRoute = require('./src/routes/attendanceRoute');
const userRoute = require("./src/routes/userRoute");
const invoiceRoute = require("./src/routes/invoiceRoute");
const invoiceBusinessRoute = require('./src/routes/invoiceBusinessRoute');
const invoiceClientRoute = require('./src/routes/invoiceClientRoute');
const invoiceAccountRoute = require('./src/routes/invoiceAccountRoute');
const leaveSettingRoute = require('./src/routes/leaveSettingRoute');

const sendBirthdayMail = require('./src/cron-job');
// add database
const connectDB = require("./src/DB/connection");

const app = express();

const port = process.env.PORT || 8000

app.use(cors({
   "origin": process.env.RESET_PASSWORD_URL,
   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
   "preflightContinue": false,
   "optionsSuccessStatus": 204
 }));

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.json());

// image get route
app.use('/uploads', express.static(path.resolve('./public/images')))
app.use('/uploads', express.static(path.join(__dirname, './public/document')))
app.use('/uploads', express.static(path.join(__dirname, './public')));

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
app.use('/api/invoice/business', invoiceBusinessRoute)
app.use('/api/invoice/client', invoiceClientRoute)
app.use('/api/invoice/account', invoiceAccountRoute)
app.use('/api/invoice', invoiceRoute)
app.use('/api/leave-setting', leaveSettingRoute)

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

sendBirthdayMail();
