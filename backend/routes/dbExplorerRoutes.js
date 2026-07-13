const express = require('express');
const router = express.Router();
const { getDBStats, getCollectionData, getExplorerPage } = require('../controllers/dbExplorerController');

router.get('/collections', getDBStats);
router.get('/collection/:collectionName', getCollectionData);
router.get('/ui', getExplorerPage);

module.exports = router;
