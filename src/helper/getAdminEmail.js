const user = require("../models/userSchema");

const getAdminEmail = async () => {
    const list = await user.aggregate([
        {
            $lookup:
            {
                from: "roles",
                localField: "role_id",
                foreignField: "_id",
                as: "role"
            }
        },
        { $unwind: { path: "$role" } },
        {
            $match:
            {
                "role.name": { $in: ["ADMIN", "admin", "Admin"] }
            }
        },
        {
            $project:
            {
                email: 1
            }
        }
    ]);
    return list
}

module.exports = getAdminEmail;