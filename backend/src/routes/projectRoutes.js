const express = require('express');
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('Admin'), updateProject)
  .delete(authorize('Admin'), deleteProject);

module.exports = router;
