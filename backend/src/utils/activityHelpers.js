const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

exports.createNotification = async ({ userId, message, type = 'general', taskId, projectId }) => {
  return await Notification.create({ userId, message, type, taskId, projectId });
};

exports.logActivity = async ({ user, action, targetId, targetType = 'General', projectId, meta }) => {
  return await ActivityLog.create({
    user: user._id ? user._id : user,
    action,
    targetId,
    targetType,
    projectId,
    meta
  });
};

exports.emitSocketEvent = (req, event, payload, room) => {
  const io = req.app.get('io');
  if (!io) return;
  if (room) {
    io.to(room).emit(event, payload);
  } else {
    io.emit(event, payload);
  }
};
