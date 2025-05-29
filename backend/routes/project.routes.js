const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/project.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Project routes - all protected by authentication
router.use(authenticateToken);

router.get('/', ProjectController.getAllProjects);
router.get('/:id', ProjectController.getProjectById);
router.post('/', ProjectController.create);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

module.exports = router;
