const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');

exports.getActivityLogs = asyncHandler(async (req, res, next) => {
  const query = req.user.role === 'Admin' ? {} : { user: req.user.id };

  const logs = await ActivityLog.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(100);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
});
