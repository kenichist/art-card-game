const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

// Routes
router.get('/', auctionController.getAuctions);
router.get('/active', auctionController.getActiveAuction);
router.get('/:id', auctionController.getAuctionById);
router.post('/', auctionController.createAuction);
router.put('/:id', auctionController.updateAuction);
router.delete('/:id', auctionController.deleteAuction);
router.post('/match/:itemId/:collectorId', auctionController.matchItemWithCollector);

module.exports = router;
