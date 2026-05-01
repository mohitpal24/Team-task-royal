const express = require('express');
const upload = require('../config/fileUpload');
const { getTasks, getTask, createTask, updateTask, deleteTask, getDashboardStats } = require('../controllers/taskController');
const { uploadTaskAttachment } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats/dashboard', getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(authorize('Admin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('Admin'), deleteTask);

router.post('/:id/attachments', upload.single('file'), uploadTaskAttachment);

module.exports = router;
