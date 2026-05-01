const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');
const { createNotification, logActivity, emitSocketEvent } = require('../utils/activityHelpers');

exports.uploadTaskAttachment = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to upload file for this task' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please attach a valid file' });
  }

  const fileUrl = req.file.path;

  task.attachments = task.attachments || [];
  task.attachments.push({ fileUrl, fileName: req.file.originalname });
  await task.save();

  await createNotification({
    userId: task.assignedTo,
    message: `A new attachment was added to task "${task.title}"`,
    type: 'attachment_added',
    taskId: task._id,
    projectId: task.projectId
  });

  await logActivity({
    user: req.user,
    action: 'attachment_uploaded',
    targetId: task._id,
    targetType: 'Task',
    projectId: task.projectId,
    meta: { fileName: req.file.originalname }
  });

  emitSocketEvent(req, 'taskUpdated', task, task.projectId.toString());

  res.status(200).json({ success: true, data: task });
});
