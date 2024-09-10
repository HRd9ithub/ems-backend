require('dotenv').config();
const role = require('./src/models/roleSchema');
const user = require('./src/models/userSchema');
const menu = require('./src/models/menuSchema');
const { default: mongoose } = require('mongoose');
const connectDB = require("./src/DB/connection");
const encryptData = require('./src/helper/encrptData');

// add database

const menuData = [{
    "name": "Dashboard",
    "path": "/",
    "icon": "fa-solid fa-house"
},
{
    "name": "Employees",
    "path": "/employees",
    "icon": "fa-solid fa-user"
},
{
    "name": "Project",
    "path": "/project",
    "icon": "fa-solid fa-user"
},
{
    "name": "Designation",
    "path": "/designation",
    "icon": "fa-solid fa-user"
},
{
    "name": "Leave Type",
    "path": "/leave-type",
    "icon": "fa-solid fa-calendar"
},
{
    "name": "Leaves",
    "path": "/leaves",
    "icon": "fa-solid fa-calendar"
},
{
    "name": "Holiday",
    "path": "/holiday",
    "icon": "fa-solid fa-calendar"
},
{
    "name": "Attendance",
    "path": "/attendance",
    "icon": "fa-solid fa-user-check"
},
{
    "name": "Activity Logs",
    "path": "/activity",
    "icon": "fa-solid fa-clock-rotate-left"
},
{
    "name": "Document",
    "path": "/documents",
    "icon": "fa-solid fa-book"
},
{
    "name": "User Role",
    "path": "/user-role",
    "icon": "fa-solid fa-gear"
},
{
    "name": "Employee Wise Work Report",
    "path": "/work-report/employee",
    "icon": "fa-solid fa-gear"
},
{
    "name": "Password",
    "path": "/password",
    "icon": "fa-solid fa-gear"
},
// {
//     "name": "Leave Setting",
//     "path": "/leave-setting",
//     "icon": "fa-solid fa-gear"
// },
{
    "name": "Invoices",
    "path": "/invoice",
    "icon": "fa-solid fa-dollar-sign"
},
{
    "name": "Clients",
    "path": "/client",
    "icon": "fa-solid fa-dollar-sign"
},
{
    "name": "Project Wise Work Report",
    "icon": "fa-solid fa-gear",
    "path": "/work-report/project"
}
]

const defaultUser = async () => {
    try {
        const roleData = new role({
            name: "Admin",
            permissions: []
        });

        const response = await roleData.save();
        if (response) {
            const defaultUser = {
                employee_id: "D9-001",
                first_name: encryptData("Admin"),
                last_name: encryptData("Admin"),
                email: "hardik.d9ithub+1@gmail.com",
                phone: encryptData("7894561230"),
                joining_date: "2023-10-01",
                status: "Active",
                gender: encryptData("Male"),
                password: "Employee@123",
                role_id: "6583be26152ce726ff3f1b91",
            }

            const userData = await user.create(defaultUser)
            if (userData) {
                console.log("Successfully created.")
            }
            await menu.insertMany(menuData)
        }
    } catch (error) {
        console.log('error', error)
    }
}

connectDB().then(() => {
    defaultUser().then(() => {
        mongoose.connection.close();
    })
})
