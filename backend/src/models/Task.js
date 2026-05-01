const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [100, 'Title can not be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline']
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: true
    },
    attachments: [
      {
        fileUrl: {
          type: String,
          required: true
        },
        fileName: {
          type: String,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
