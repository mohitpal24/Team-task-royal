const Project = require('../models/Project');
const asyncHandler = require('../middleware/asyncHandler');
const { createNotification, logActivity, emitSocketEvent } = require('../utils/activityHelpers');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'Admin') {
    query = Project.find().populate('members', 'name email').populate('createdBy', 'name email');
  } else {
    // Members only see projects they are part of
    query = Project.find({ members: req.user.id }).populate('members', 'name email').populate('createdBy', 'name email');
  }

  const projects = await query;

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name email');

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  // Check if user is admin or member of the project
  if (req.user.role !== 'Admin' && !project.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;

  const project = await Project.create(req.body);

  if (project.members && project.members.length > 0) {
    await Promise.all(project.members.map((memberId) =>
      createNotification({
        userId: memberId,
        message: `You were added to project \"${project.name}\"`,
        type: 'project_created',
        projectId: project._id
      })
    ));
  }

  await logActivity({
    user: req.user,
    action: 'created_project',
    targetId: project._id,
    targetType: 'Project',
    projectId: project._id,
    meta: { memberCount: project.members?.length || 0 }
  });

  emitSocketEvent(req, 'projectCreated', project, project._id.toString());

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  await logActivity({
    user: req.user,
    action: 'updated_project',
    targetId: project._id,
    targetType: 'Project',
    projectId: project._id,
    meta: { updatedFields: Object.keys(req.body) }
  });

  emitSocketEvent(req, 'projectUpdated', project, project._id.toString());

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  await project.deleteOne();

  await logActivity({
    user: req.user,
    action: 'deleted_project',
    targetId: project._id,
    targetType: 'Project',
    projectId: project._id,
    meta: { name: project.name }
  });

  emitSocketEvent(req, 'projectDeleted', { _id: project._id }, project._id.toString());

  res.status(200).json({
    success: true,
    data: {}
  });
});
