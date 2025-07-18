const Cart = require('../models/Cart'); // Path to your Cart model
const { StatusCodes } = require('http-status-codes');

const cartController = {
  getCart: async (req, res) => {
    //TODO: Find storeId if available
    try {
      const cart = await Cart.findOne({ buyerId: req.user.userId }).populate(
        'cartItems.product'
      ); // Populate product details
      if (!cart) {
        return res.status(StatusCodes.CREATED).json({ cartItems: [] }); // Return empty array if no cart
      }
      res.status(StatusCodes.CREATED).json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

    updateCart: async (req, res) => {
        try {
            const { cartItems } = req.body;
            const buyerStoreId = req.user && req.user.storeId ? req.user.storeId : undefined; // Safe access

            let cart = await Cart.findOne({ buyerId: req.user.userId });

            if (!cart) {
                cart = new Cart({
                    cartItems,
                    buyerStoreId: buyerStoreId, // Attach storeId if available
                    buyerId: req.user.userId,
                });
            } else {
                cart.cartItems = cartItems;
                if (buyerStoreId) { // Only update if storeId exists AND it is different from the one in the DB
                    cart.buyerStoreId = buyerStoreId;
                }
            }

            await cart.save();
            res.status(StatusCodes.CREATED).json(cart);
        } catch (error) {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
        }
    },

  clearCart: async (req, res) => {
    //TODO: Find storeId if available

    try {
      const cart = await Cart.findOne({ buyerId: req.user.userId });
      if (cart) {
        cart.cartItems = [];
        await cart.save();
      }
      res.status(StatusCodes.CREATED).json({ message: 'Cart cleared' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = cartController;
