 
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate, isAdmin } = require('../middleware/auth');

// GET all tasks (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};

    if (projectId) where.projectId = parseInt(projectId);
    if (status) where.status = status;

    if (req.user.role !== 'ADMIN') {
      where.assigneeId = req.user.id;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
        assignee: true,
        creator: true
      }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET overdue tasks
router.get('/overdue', authenticate, async (req, res) => {
  try {
    const where = {
      dueDate: { lt: new Date() },
      status: { not: 'DONE' }
    };

    if (req.user.role !== 'ADMIN') {
      where.assigneeId = req.user.id;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: { project: true, assignee: true }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET single task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { project: true, assignee: true, creator: true }
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// CREATE task (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, description, status, dueDate, projectId, assigneeId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: parseInt(projectId),
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        creatorId: req.user.id
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// UPDATE task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, status, dueDate, assigneeId } = req.body;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Member can only update status of their own tasks
    if (req.user.role !== 'ADMIN' && task.assigneeId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title: req.user.role === 'ADMIN' ? title : undefined,
        description: req.user.role === 'ADMIN' ? description : undefined,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId: req.user.role === 'ADMIN' && assigneeId ? parseInt(assigneeId) : undefined
      }
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// DELETE task (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;