const { validationResult } = require("express-validator")
const encryptData = require("../helper/encrptData");
const decryptData = require("../helper/decryptData");
const { default: mongoose } = require("mongoose");
const ruleSchema = require("../models/ruleSchema");

//*  create rule function
const createRule = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ success: false, error: errorMessages });
    }

    // Encrypt data
    const title = encryptData(req.body.title);
    const rules = req.body.rules ? encryptData(req.body.rules) : null;

    // Create rule data
    const ruleData = new ruleSchema({
      title,
      rules
    });

    await ruleData.save();

    return res.status(201).json({ success: true, message: 'Data added successfully.', });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal server error', });
  }
};

// * Update Rule data function
const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);

    // Validate request data
    if (!errors.isEmpty()) {
      const validationErrors = errors.array().map(err => err.msg);
      return res.status(400).json({ error: validationErrors, success: false });
    }
    // Encrypt sensitive data fields
    const encryptedData = {
      title: encryptData(req.body.title),
      rules: req.body.rules ? encryptData(req.body.rules) : null
    };

    // Update the record in the database
    const updatedRecord = await ruleSchema.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          ...encryptedData
        }
      },
      { new: true }
    );

    // Send appropriate response
    if (updatedRecord) {
      return res.status(200).json({ success: true, message: "Data updated successfully." });
    } else {
      return res.status(404).json({ success: false, message: "Record Not Found." });
    }
  } catch (error) {
    // Handle unexpected server errors
    return res.status(500).json({ message: error.message || 'Internal server error', success: false });
  }
};

//* get Rules function
const getRules = async (req, res) => {
  try {
    const { permissions } = req;
    const { _id } = req.user;

    const filter = {
      deletedAt: { $exists: false }
    };

    const rules = await ruleSchema.find(filter).sort({ createdAt: -1 });

    const updatedRules = rules.map((item) => {
      return {
        _id: item._id,
        title: decryptData(item.title),
        rules: item.rules ? decryptData(item.rules) : null,
      }
    })

    return res.status(200).json({ success: true, data: updatedRules, permissions });

  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal Server Error', success: false, });
  }
};

//* single get Rule function
const getSingleRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req;

    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      deletedAt: { $exists: false }
    };

    const response = await ruleSchema.findOne(filter);

    if (response) {
      const updateRule = {
        ...response,
        _id: response._id,
        title: decryptData(response.title),
        rules: response.rules ? decryptData(response.rules) : null,
      }

      return res.status(200).json({ success: true, message: "Data fetched successfully.", data: updateRule, permissions })
    } else {
      return res.status(404).json({ success: false, message: "Record Not Found." })
    }

  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server Error', success: false })
  }
}

//* delete Rule function
const deleteRule = async (req, res) => {
  try {
    let { id } = req.params;

    let response = await ruleSchema.findByIdAndUpdate({ _id: id }, { $set: { deletedAt: new Date() } });
    if (response) {
      return res.status(200).json({ success: true, message: "Data deleted successfully." })
    } else {
      return res.status(404).json({ success: false, message: "Record Not Found." })
    }

  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server Error', success: false })
  }
}

module.exports = {
  createRule,
  updateRule,
  getRules,
  deleteRule,
  getSingleRule
}