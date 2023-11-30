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

// * ================== timesheet route check permission ==========================
const timesheetPermission = async (req, res, next) => {
    try {
        let permission = await getRoleData(req.user.role_id, "timesheet");

        req.permissions = permission;

        if (req.method === "GET") {
            permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing timesheet to the Timesheet Data. please contact admin." })
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
        let permission = await getRoleData(req.user.role_id, "work report");

        req.permissions = permission;

        if (req.method === "POST" && req.route.path == "/") {
            permission.permissions.create !== 0 ? next() : res.status(403).json({ message: "You do not have permission to create work report." })
        } else if (req.method === "GET" && req.route.path == "/") {
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
            }else{
                permission.permissions.list !== 0 ? next() : res.status(403).json({ message: "You don't have permission to listing attendance to the attendance Data. please contact admin." })
            }
        }  else if (req.method === "PUT") {
            permission.permissions.update !== 0 ? next() : res.status(403).json({ message: "You do not have permission to update attendance." })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = { userPermission, passwordPermission, rolePermission, projectPermission, activityPermission, attendancePermission, reportPermission, designationtPermission, documentPermission, leavePermission, leaveTypePermission, holidayPermission, timesheetPermission }