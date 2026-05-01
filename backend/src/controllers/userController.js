const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (All Users)
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.email) updateData.email = req.body.email;
  // If we ever handle password changes here, we'd need bcrypt logic, 
  // but for now we only update name and email safely.
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Toggle User Status (Suspend/Activate)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Prevent admin from suspending themselves
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot suspend your own account' });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: !user.isActive },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// @desc    Delete user and unassign their tasks
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  }

  // Unassign tasks assigned to this user
  await Task.updateMany({ assignedTo: req.params.id }, { assignedTo: null });

  // Delete the user
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});
