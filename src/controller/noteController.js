const { validationResult } = require("express-validator")
const noteSchema = require("../models/noteSchema");
const encryptData = require("../helper/encrptData");
const decryptData = require("../helper/decryptData");
const { default: mongoose } = require("mongoose");

//*  create note function
const createNote = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ success: false, error: errorMessages });
    }

    // Encrypt data
    const title = encryptData(req.body.title);
    const note = req.body.note ? encryptData(req.body.note) : null;

    // Create note data
    const noteData = new noteSchema({
      title,
      note,
      createdBy: req.user._id,
    });

    await noteData.save();

    return res.status(201).json({ success: true, message: 'Data added successfully.', });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal server error', });
  }
};

// * Update Note data function
const updateNote = async (req, res) => {
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
      note: req.body.note ? encryptData(req.body.note) : null
    };

    // Update the record in the database
    const updatedRecord = await noteSchema.findByIdAndUpdate(
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

//* get notes function
const getNotes = async (req, res) => {
  try {
    const { permissions } = req;
    const { _id } = req.user;

    const filter = {
      deletedAt: { $exists: false }
    };

    const notes = await noteSchema.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                first_name: 1,
                last_name: 1
              }
            }
          ],
          as: 'created'
        }
      },
      {
        $project: {
          title: 1,
          note: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: 1,
          created: { $arrayElemAt: ['$created', 0] }
        }
      }
    ])

    const updatedNotes = notes.map((item) => {
      return {
        _id: item._id,
        title: decryptData(item.title),
        note: item.note ? decryptData(item.note) : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        createdBy: item.createdBy,
        created: {
          ...item.created,
          first_name: decryptData(item.created?.first_name || ""),
          last_name: decryptData(item.created?.last_name || ""),
        }
      }
    })

    return res.status(200).json({ success: true, data: updatedNotes, permissions });

  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal Server Error', success: false, });
  }
};

//* single get note function
const getSingleNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req;

    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      deletedAt: { $exists: false }
    };

    const response = await noteSchema.aggregate([
      {
        $match: filter
      },
      {
        $project: {
          title: 1,
          note: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: 1,
        }
      }
    ])

    if (response.length !== 0) {
      const updatedNote = response.map((item) => {
        return {
          _id: item._id,
          title: decryptData(item.title),
          note: item.note ? decryptData(item.note) : null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy
        }
      })

      return res.status(200).json({ success: true, message: "Data fetched successfully.", data: updatedNote[0], permissions })
    } else {
      return res.status(404).json({ success: false, message: "Record Not Found." })
    }

  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server Error', success: false })
  }
}

//* delete note function
const deleteNote = async (req, res) => {
  try {
    let { id } = req.params;

    let response = await noteSchema.findByIdAndUpdate({ _id: id }, { $set: { deletedAt: new Date() } });
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
  createNote,
  updateNote,
  getNotes,
  deleteNote,
  getSingleNote
}