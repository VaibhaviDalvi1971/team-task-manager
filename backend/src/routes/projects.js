const { authenticate, isAdmin } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET all projects
router.get('/', authenticate, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: { owner: true, members: { include: { user: true } }, tasks: true }
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId: req.user.id } }
        },
        include: { owner: true, members: { include: { user: true } }, tasks: true }
      });
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { owner: true, members: { include: { user: true } }, tasks: true }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// CREATE project (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: memberIds?.map(userId => ({ userId })) || []
        }
      }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// UPDATE project (Admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// DELETE project (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await prisma.task.deleteMany({
      where: { projectId: parseInt(req.params.id) }
    });
    await prisma.projectMember.deleteMany({
      where: { projectId: parseInt(req.params.id) }
    });
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// ADD member to project (Admin only)
router.post('/:id/members', authenticate, isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const member = await prisma.projectMember.create({
      data: {
        projectId: parseInt(req.params.id),
        userId
      }
    });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
