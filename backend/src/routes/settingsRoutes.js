const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middlewares/authMiddleware');

router.get('/preferences', auth, settingsController.getPreferences);
router.put('/preferences', auth, settingsController.updatePreferences);

module.exports = router;
