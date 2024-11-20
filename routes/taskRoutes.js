const express = require('express');
const Task = require('../models/task');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

// Create Task
router.post('/', authenticate, async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.user.id });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

// Get Tasks
router.get('/', authenticate, async (req, res) => {
  const { priority, keyword } = req.query;
  const filter = { userId: req.user.id };

  if (priority) filter.priority = priority;
  if (keyword) {
    const regex = new RegExp(keyword, 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  try {
    const tasks = await Task.find(filter).sort({ deadline: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Update Task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete Task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;