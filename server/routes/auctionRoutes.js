const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

// Routes
router.get('/', auctionController.getAuctions);
router.get('/active', auctionController.getActiveAuction);
router.get('/:id', auctionController.getAuctionById);
router.post('/', auctionController.createAuction);
router.post('/create-with-item/:itemId', auctionController.createAuctionWithItem); // New route
router.put('/:id', auctionController.updateAuction);
router.delete('/:id', auctionController.deleteAuction);
router.post('/match/:itemId/:collectorId', auctionController.matchItemWithCollector);
router.post('/match', auctionController.matchItems); // New route for matching multiple items

module.exports = router;
