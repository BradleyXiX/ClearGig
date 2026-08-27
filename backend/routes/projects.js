const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// GET /api/v1/projects - Returns a list of all estimates (projects)
router.get('/', projectController.getAllProjects);

// POST /api/v1/projects - Creates a new project wrapper
router.post('/', projectController.createProject);

// GET /api/v1/projects/:id - Returns project details, including joined line_items
router.get('/:id', projectController.getProjectById);

// PATCH /api/v1/projects/:id - Updates project details (contingency, profit margin, status, etc)
router.patch('/:id', projectController.updateProject);

// POST /api/v1/projects/:id/line-items - Adds a cost item to a specific project
// Route can be handled in lineItems routes, but spec specifically lists POST /projects/:id/line-items
router.post('/:id/line-items', projectController.addLineItemToProject);

module.exports = router;
