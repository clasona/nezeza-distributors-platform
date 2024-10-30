const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
    getAllProducts,
    getSingleProduct,
    //getSingleProduct,
    
  } = require('../controllers/wholesalerController');

router.route('/').get(authenticateUser,authorizePermissions('view_manufacturer_products'),getAllProducts);

router.route('/:id').get(authenticateUser, authorizePermissions('view_manufacturer_product'), getSingleProduct);


module.exports = router;