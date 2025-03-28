const Favorites = require('../models/Favorites'); // Path to your Favorites model
const { StatusCodes } = require('http-status-codes');

const favoritesController = {
  getFavorites: async (req, res) => {
    //TODO: Find storeId if available
    try {
      const favorites = await Favorites.findOne({ buyerId: req.user.userId }).populate(
        'favoritesItems.product'
      ); // Populate product details
      if (!favorites) {
        return res.status(StatusCodes.CREATED).json({ favoritesItems: [] }); // Return empty array if no favorites
      }
      res.status(StatusCodes.CREATED).json(favorites);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

    updateFavorites: async (req, res) => {
        try {
            const { favoritesItems } = req.body;
            const buyerStoreId = req.user && req.user.storeId ? req.user.storeId : undefined; // Safe access

            let favorites = await Favorites.findOne({ buyerId: req.user.userId });

            if (!favorites) {
                favorites = new Favorites({
                    favoritesItems,
                    buyerStoreId: buyerStoreId, // Attach storeId if available
                    buyerId: req.user.userId,
                });
            } else {
                favorites.favoritesItems = favoritesItems;
                if (buyerStoreId) { // Only update if storeId exists AND it is different from the one in the DB
                    favorites.buyerStoreId = buyerStoreId;
                }
            }

            await favorites.save();
            res.status(StatusCodes.CREATED).json(favorites);
        } catch (error) {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
        }
    },

  clearFavorites: async (req, res) => {
    //TODO: Find storeId if available

    try {
      const favorites = await Favorites.findOne({ buyerId: req.user.userId });
      if (favorites) {
        favorites.favoritesItems = [];
        await favorites.save();
      }
      res.status(StatusCodes.CREATED).json({ message: 'Favorites cleared' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = favoritesController;
