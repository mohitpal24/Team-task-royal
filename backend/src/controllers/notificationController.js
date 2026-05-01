const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { logActivity } = require('../utils/activityHelpers');

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort('-createdAt')
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  await logActivity({
    user: req.user,
    action: 'marked_notification_read',
    targetId: notification._id,
    targetType: 'Notification'
  });

  res.status(200).json({ success: true, data: notification });
});

exports.markAllRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });

  await logActivity({
    user: req.user,
    action: 'marked_notification_read',
    targetType: 'Notification',
    meta: { bulk: true }
  });

  res.status(200).json({ success: true, data: {} });
});
