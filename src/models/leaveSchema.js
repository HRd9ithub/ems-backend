const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
   user_id: {
      type: mongoose.Schema.Types.ObjectId,
      require: true
   },
   leave_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      require: true
   },
   from_date: {
      type: String,
      require: true
   },
   to_date: {
      type: String,
        require: true,
   },
   duration: {
      type: Number,
      require: true,
   },
   leave_for: {
      type: String,
      require: true,
      enum: ['Full', 'First Half', 'Second Half']
   },
   reason: {
      type: String,
      require: true,
   },
   status: {
      type: String,
      require: true,
      enum: ['Pending', 'Approved', "Declined", "Read"]
   },
   isNotification: {
      type: Boolean,
      default : true,
   },
   isNotificationStatus: {
      type: Boolean,
      default : false,
   },
   deleteAt:{
      type: Date
   }
}, {
   timestamps: true,
});

const Leave = mongoose.model('leave', leaveSchema)

module.exports = Leave