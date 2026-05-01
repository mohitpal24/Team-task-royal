const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: ['login', 'registered', 'created_task', 'updated_task', 'deleted_task', 'created_project', 'updated_project', 'deleted_project', 'attachment_uploaded', 'marked_notification_read', 'updated_profile']
    },
    targetId: {
      type: mongoose.Schema.ObjectId
    },
    targetType: {
      type: String,
      enum: ['Task', 'Project', 'Notification', 'User', 'General'],
      default: 'General'
    },
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project'
    },
    meta: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
