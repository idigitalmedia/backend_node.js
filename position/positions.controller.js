const express = require('express');
const router = express.Router();
const positionServer = require('./positions.server');
const authorize = require('_middleware/authorize')

router.get('/getpositionprice', positionServer.getPositionPrice)
router.post('/updatepositionprice/:price', authorize(), positionServer.updatePositionPrice)

module.exports = router;