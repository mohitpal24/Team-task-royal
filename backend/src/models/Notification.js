const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'project_created', 'attachment_added', 'general'],
      default: 'general'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Task'
    },
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
