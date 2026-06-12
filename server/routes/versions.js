const express = require('express');
const router = express.Router();
const { getVersions, getVersion } = require('../controllers/versionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getVersions);
router.get('/:id', getVersion);

module.exports = router;
