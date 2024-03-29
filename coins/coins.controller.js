const express = require('express');
const router = express.Router();
const coinService = require('./coins.service');

router.post('/getcoinbalance', coinService.getCoinBalance);
router.post('/withdrawcoin', coinService.withdrawCoin);
router.get('/get-positioncount/:id', coinService.getPositionCount);
router.post('/genqrcode', coinService.genQrCode);
router.post('/notification', coinService.notificationStatus);
router.post('/paymentstatus', coinService.getPaymentStatus);

module.exports = router;