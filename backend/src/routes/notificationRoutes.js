const express = require('express');
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllRead);

module.exports = router;
