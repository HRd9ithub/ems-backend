const { default: mongoose } = require("mongoose");
const menu = require("../models/menuSchema");
const role = require("../models/roleSchema");

// create menu function
const createMenu = async (req, res) => {
    try {
        // find menu name in database
        const data = await menu.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } })
        if (data) {
            // exists menu name for send message
            return res.status(400).json({ message: "Menu name already exists.", success: false })
        }

        // not exists menu name for add database
        const menuData = new menu(req.body);
        const response = await menuData.save();
        return res.status(201).json({ success: true, message: "Successfully added a new menu." })

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error", success: false })
    }
}

// update menu function
const updateMenu = async (req, res) => {
    try {
        // find menu name in database
        const data = await menu.findOne({ name: req.body.name })
        if (data && data._id != req.params.id) {
            // exists menu name for send message
            return res.status(400).json({ message: "The menu name already exists.", success: false })
        }

        // not exists menu name for update database
        const response = await menu.findByIdAndUpdate({ _id: req.params.id }, req.body)
        if (response) {
            return res.status(200).json({ success: true, message: "Successfully edited a menu." })
        } else {
            return res.status(404).json({ success: false, message: "Menu is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error", success: false })
    }
}

// update menu function
const deleteMenu = async (req, res) => {
    try {
        const response = await menu.findByIdAndDelete({ _id: req.params.id })
        if (response) {
            return res.status(200).json({ success: true, message: "Successfully deleted a menu." })
        } else {
            return res.status(404).json({ success: false, message: "Menu is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error", success: false })
    }
}

// get menu function
const getMenu = async (req, res) => {
    try {
        let data = ""
        const roleName = await role.findOne({ _id: req.user.role_id}, { name: 1, _id: 0 })
        // get menu data in database
        if (roleName && roleName.name.toLowerCase() !== "admin") {
            data = await role.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(req.user.role_id) } },
                { "$unwind": "$permissions" },
                { $match: { "permissions.list": 1 } },
                {
                    $lookup: {
                        from: "menus",
                        localField: "permissions.menuId",
                        foreignField: "_id",
                        as: "menu"
                    }
                }, 
                { $sort : { "menu.createdAt" : 1 } },
                {
                    $project: {
                        "name": { $first: "$menu.name" },
                        "_id": { $first: "$menu._id" },
                        "path": { $first: "$menu.path" },
                        "icon": { $first: "$menu.icon" }
                    }
                }

            ])
        } else {
            data = await menu.find({}, { name: 1,path :1,icon :1 }).sort({_id : 1})
        }

        return res.status(200).json({ success: true, message: "Successfully fetch a menu data.", data: data})

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error", success: false })
    }
}

module.exports = { createMenu, updateMenu, deleteMenu, getMenu }