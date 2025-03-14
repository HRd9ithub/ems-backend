const role = require("../models/roleSchema")

// TODO:  common role data get
const getRoleData = async (id, name) => {
    let value = await role.aggregate([
        { $match: { _id: id } },
        {
            $unwind: {
                path: '$permissions',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "menus",
                localField: "permissions.menuId",
                foreignField: "_id",
                as: "permissions.menu"
            }
        },
        {
            $unwind: {
                path: '$permissions.menu',
                preserveNullAndEmptyArrays: true
            }
        }
    ])
    let permission = "";
    let result = Object.assign({}, ...value)

    if (result && result.name.toLowerCase() == "admin") {
        permission = Object.assign(result, { permissions: { list: 1, create: 1, update: 1, delete: 1 } })
    } else {
        permission = value.find((val => {
            return val.permissions.menu.name.toLowerCase() == name
        }))
    }
    return permission
}

// * ==================  user route permission check ============================
const userPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "employees");

        req.permissions = permission;

        if (req.method === "POST" && req.route.path == "/") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create Employee.", success: false })
        } else if (req.method === "GET" && req.route.path == "/") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing employee to the Employee Data. please contact admin.", success: false })
        } else if (req.method === "PATCH") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update Employee.", success: false })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete Employee.", success: false })
        } else if (req.method === "GET" && req.route.path == "/:id") {
            next();
        } else if (req.method === "POST" && req.route.path == "/loginInfo") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "access denied.", success: false })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false })
    }
}

// * ================== project route check permission =========================
const projectPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "project");

        req.permissions = permission;

        if (req.method === "POST" && req.route.path == "/") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create project.", success: false })
        } else if (req.method === "GET" && req.route.path == "/") {
            permission.permissions.list !== 0 || req.query.key ? next() : res.status(403).json({ message: "You don't have permission to listing project to the Project Data. please contact admin.", permissions: req.permissions, success: false })
        } else if (req.method === "PATCH") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update project.", success: false })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete project.", success: false })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false })
    }
}

// * ================== designation route check permission =======================
const designationtPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "designation");

        req.permissions = permission;

        if (req.method === "POST" && req.route.path == "/") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create designation." })
        } else if (req.method === "GET" && req.route.path == "/") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing designation to the Designation Data. please contact admin.", permissions: req.permissions })
        } else if (req.method === "PATCH") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update designation." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete designation." })
        }

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== leave type route check permission =======================
const leaveTypePermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "leave type");

        req.permissions = permission;

        if (req.method === "POST" && req.route.path == "/") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create leave type." })
        } else if (req.method === "GET" && req.route.path == "/") {
            permission.permissions.list !== 0 || req.query.key ? next() : res.status(403).json({ message: "You don't have permission to listing leave type to the leave type Data. please contact admin." })
        } else if (req.method === "PATCH") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update leave type." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete leave type." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== leave route check permission ==========================
const leavePermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "leaves");

        req.permissions = permission;

        if (req.method === "POST" && req.route.path == "/") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create leave." })
        } else if (req.method === "GET" && req.route.path == "/") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing leave to the leave Data. please contact admin." })
        } else if (req.method === "PATCH" || req.method === "PUT" || (req.method === "POST" && req.route.path === "/status")) {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update leave." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
const leaveReportPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "leave report");

        req.permissions = permission;

        if (req.method === "GET" && req.route.path == "/report") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing leave report to the leave Data. please contact admin." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
const notificationPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "notification");

        req.permissions = permission;

        if (req.method === "POST" && req.route.path == "/notification/all") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing notification to the notification Data. please contact admin." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== holiday route check permission ===========================
const holidayPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "holiday");

        req.permissions = permission;

        if (req.method === "POST" && req.baseUrl == "/api/holiday") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create holiday." })
        } else if (req.method === "GET" && req.baseUrl == "/api/holiday") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing holiday to the Holiday Data. please contact admin." })
        } else if (req.method === "PUT") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update holiday." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete holiday." });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== activity route check permission ===========================
const activityPermission = async (req, res, next) => {

    try {
        let data = await getRoleData(req.user.role_id, "activity logs");

        req.permissions = data;

        if (req.method === "GET" && req.baseUrl == "/api/activity") {
            data.permissions.list === 1 ? next() : res.status(403).json({ message: "You don't have permission to listing activity logs to the activity Data. please contact admin.", permissions: req.permissions, success: false })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false })
    }
}

// * ================== document route check permission =========================
const documentPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "document");

        req.permissions = permission;

        if (req.method === "POST" && req.baseUrl == "/api/document") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create document." })
        } else if (req.method === "GET" && req.baseUrl == "/api/document") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing document to the Document Data. please contact admin." })
        } else if (req.method === "PUT") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update document." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete document." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== role route check permission =============================
const rolePermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "user role");

        req.permissions = permission;

        if (req.method === "POST" && req.baseUrl == "/api/role") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create user role." })
        } else if (req.method === "GET" && req.baseUrl == "/api/role") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing user role to the User Role Data. please contact admin." })
        } else if (req.method === "PUT") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update user role." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete user role." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== report route permission check ===========================
const reportPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "employee wise work report");

        req.permissions = permission;

        if (req.method === "POST" && req.route.path == "/") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create work report." })
        } else if (req.method === "GET" && (req.route.path == "/" || req.route.path == "/report-request-data")) {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing work report to the work report Data. please contact admin.", permissions: req.permissions })
        } else if (req.method === "PATCH") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update work report." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete work report." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const reportProjectPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "project wise work report");

        req.permissions = permission;

        if (req.method === "GET" && req.route.path == "/project-wise") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing work report to the work report Data. please contact admin.", permissions: req.permissions })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// * ================== password route check permission =========================
const passwordPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "password");

        req.permissions = permission;

        if (req.method === "POST" && req.baseUrl == "/api/password") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create password." })
        } else if (req.method === "GET" && req.baseUrl == "/api/password") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing password to the Password Data. please contact admin." })
        } else if (req.method === "PUT") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update password." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete password." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
// * ================== note route check permission =========================
const notePermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "notes");

        req.permissions = permission;

        if (req.method === "POST" && req.baseUrl == "/api/note") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create note." })
        } else if (req.method === "GET" && req.baseUrl == "/api/note") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing note to the note Data. please contact admin." })
        } else if (req.method === "PUT") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update note." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete note." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
// * ================== rule route check permission =========================
const rulePermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "rules");

        req.permissions = permission;

        if (req.method === "POST" && req.baseUrl == "/api/rule") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create rule." })
        } else if (req.method === "GET" && req.baseUrl == "/api/rule") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing rule to the rule Data. please contact admin." })
        } else if (req.method === "PUT") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update rule." })
        } else if (req.method === "DELETE") {
            permission.permissions.delete !== 0 ? next() : res.status(403).json({ message: "You do not have permission to delete rule." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== attendance route check permission =========================
const attendancePermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "attendance");

        req.permissions = permission;

        if (req.method === "POST" && req.baseUrl == "/api/attendance") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create attendance." })
        } else if (req.method === "GET" && req.baseUrl == "/api/attendance") {
            if (req.method === "GET" && req.route.path == "/regulation/:id") {
                permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to listing attendance to the attendance request Data. please contact admin." })
            } else {
                permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing attendance to the attendance Data. please contact admin." })
            }
        } else if (req.method === "PUT") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update attendance." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== invoice route check permission =========================
const invoicePermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "invoices");

        req.permissions = permission;

        if (req.method === "GET" && req.baseUrl == "/api/invoice" || req.baseUrl == "/api/invoice/:id") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to list invoices to the invoice Data. please contact admin." })
        } else if (req.method === "GET" && req.baseUrl == "/api/invoice/account") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to the invoice Data. please contact admin." })
        } else if (req.method === "POST") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to create an invoice to the invoice Data. please contact admin." })
        } else if (req.method === "PUT") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to update an invoice to the invoice Data. please contact admin." })
        } else if (req.method === "DELETE") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to delete an invoice from the invoice Data. please contact admin." })
        } else if (req.method === "PATCH") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to restore an invoice to the invoice Data. please contact admin." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


// * ================== client route check permission =========================
const clientPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "clients");

        req.permissions = permission;

        if (req.method === "GET" && req.baseUrl == "/api/invoice/client" || req.baseUrl == "/api/invoice/client/name") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to list clients to the client Data. please contact admin." })
        } else if (req.method === "POST") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to create an client to the client Data. please contact admin." })
        } else if (req.method === "PUT") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to update an client to the client Data. please contact admin." })
        } else if (req.method === "DELETE") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to delete an client from the client Data. please contact admin." })
        } else if (req.method === "PATCH") {
            permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to restore an client to the client Data. please contact admin." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// * ================== leave setting route check permission =========================
// const leaveSettingPermission = async (req, res, next) => {
//     try {
//         let permission = await getRoleData(req.user.role_id, "leave setting");

//         req.permissions = permission;

//         if (req.method === "GET" && req.baseUrl == "/api/leave-setting" || req.baseUrl == "/api/leave-setting/:id") {
//             permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to list the leave setting Data. please contact admin.", success : false })
//         } else if (req.method === "POST") {
//             permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to create a leave setting for the leave setting Data. please contact admin.", success : false })
//         } else if (req.method === "PUT") {
//             permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to update a leave setting to the leave setting Data. please contact admin.", success : false })
//         } else if (req.method === "DELETE") {
//             permission.name.toLowerCase() === "admin" ? next() : res.status(403).json({ message: "You don't have permission to delete a leave setting from the leave setting Data. please contact admin.", success : false })
//         }
//     } catch (error) {
//         return res.status(500).json({ message: error.message, success : false })
//     }
// }

module.exports = {
    userPermission,
    passwordPermission,
    rolePermission,
    clientPermission,
    invoicePermission,
    projectPermission,
    activityPermission,
    attendancePermission,
    reportPermission,
    designationtPermission,
    documentPermission,
    leavePermission,
    leaveTypePermission,
    holidayPermission,
    notificationPermission,
    reportProjectPermission,
    notePermission,
    rulePermission,
    leaveReportPermission
}