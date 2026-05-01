require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const tasks = await Task.find({ assignedTo: { $ne: null } });
  for (let task of tasks) {
    await Project.findByIdAndUpdate(task.projectId, { $addToSet: { members: task.assignedTo } });
  }
  console.log('Fixed project members');
  process.exit(0);
}).catch(console.error);
