const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../middleware/asyncHandler');
const { createNotification, logActivity, emitSocketEvent } = require('../utils/activityHelpers');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  // If role is Member, only show tasks assigned to them
  if (req.user.role === 'Member') {
    reqQuery.assignedTo = req.user.id;
  }

  query = Task.find(reqQuery).populate('assignedTo', 'name email').populate('projectId', 'name');

  const tasks = await query;

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('assignedTo', 'name email').populate('projectId', 'name');

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  // Member can only view their own tasks
  if (req.user.role === 'Member' && task.assignedTo._id.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this task' });
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = asyncHandler(async (req, res, next) => {
  const task = await Task.create(req.body);

  if (req.body.assignedTo) {
    await Project.findByIdAndUpdate(
      req.body.projectId,
      { $addToSet: { members: req.body.assignedTo } }
    );

    await createNotification({
      userId: req.body.assignedTo,
      message: `You have been assigned to task \"${task.title}\"`,
      type: 'task_assigned',
      taskId: task._id,
      projectId: task.projectId
    });
  }

  await logActivity({
    user: req.user,
    action: 'created_task',
    targetId: task._id,
    targetType: 'Task',
    projectId: task.projectId,
    meta: { assignedTo: req.body.assignedTo }
  });

  emitSocketEvent(req, 'taskCreated', task, task.projectId.toString());

  res.status(201).json({
    success: true,
    data: task
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  // Make sure user is task assignee or admin
  if (req.user.role !== 'Admin' && (!task.assignedTo || task.assignedTo.toString() !== req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
  }

  // If Member, they can only update status
  if (req.user.role === 'Member') {
    const { status } = req.body;
    if (status) {
        task.status = status;
        await task.save();
        return res.status(200).json({ success: true, data: task });
    }
    return res.status(400).json({ success: false, message: 'Members can only update status' });
  }

  // Admin can update anything
  const originalAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (req.body.assignedTo) {
    await Project.findByIdAndUpdate(
      task.projectId,
      { $addToSet: { members: req.body.assignedTo } }
    );

    if (originalAssignedTo !== req.body.assignedTo) {
      await createNotification({
        userId: req.body.assignedTo,
        message: `You have been assigned to task \"${task.title}\"`,
        type: 'task_assigned',
        taskId: task._id,
        projectId: task.projectId
      });
    }
  }

  if (task.assignedTo) {
    await createNotification({
      userId: task.assignedTo,
      message: `Task \"${task.title}\" has been updated`,
      type: 'task_updated',
      taskId: task._id,
      projectId: task.projectId
    });
  }

  await logActivity({
    user: req.user,
    action: 'updated_task',
    targetId: task._id,
    targetType: 'Task',
    projectId: task.projectId,
    meta: {
      fields: Object.keys(req.body),
      assignedToChanged: originalAssignedTo !== req.body.assignedTo
    }
  });

  emitSocketEvent(req, 'taskUpdated', task, task.projectId.toString());

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  await task.deleteOne();

  await logActivity({
    user: req.user,
    action: 'deleted_task',
    targetId: task._id,
    targetType: 'Task',
    projectId: task.projectId,
    meta: { title: task.title }
  });

  emitSocketEvent(req, 'taskDeleted', { _id: task._id, projectId: task.projectId }, task.projectId.toString());

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats/dashboard
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    let queryObj = {};
    if (req.user.role === 'Member') {
        queryObj.assignedTo = req.user.id;
    }

    const tasks = await Task.find(queryObj);
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    
    // Check overdue
    const now = new Date();
    const overdue = tasks.filter(t => t.status !== 'completed' && new Date(t.deadline) < now).length;

    res.status(200).json({
        success: true,
        data: {
            total,
            completed,
            pending,
            inProgress,
            overdue
        }
    });
});
