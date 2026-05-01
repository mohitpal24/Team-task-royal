const express = require('express');
const { getUsers, updateProfile, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Accessible by all authenticated users
router.route('/profile')
  .put(updateProfile);

// Admin only routes
router.use(authorize('Admin'));

router.route('/')
  .get(getUsers);

router.route('/:id/status')
  .put(toggleUserStatus);

router.route('/:id')
  .delete(deleteUser);

module.exports = router;
