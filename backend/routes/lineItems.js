const express = require('express');
const router = express.Router();
const lineItemController = require('../controllers/lineItemController');

// DELETE /api/v1/line-items/:id - Removes a cost item
router.delete('/:id', lineItemController.deleteLineItem);

module.exports = router;
