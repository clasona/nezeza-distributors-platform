const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require('../controllers/productController');

const { getSingleProductReviews } = require('../controllers/reviewController');

router.route('/:manufacturerId/products').get(authenticateUser,authorizePermissions('view_my_products'),getAllProducts);

router
  .route('/:manufacturerId/products')
  .post([authenticateUser, authorizePermissions('create_product')], createProduct)

  
  router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('upload_product_image')], uploadImage);
  
  router
  .route('/:manufacturerId/products/:id')
  .patch([authenticateUser, authorizePermissions('update_product')], updateProduct)
  .delete([authenticateUser, authorizePermissions('delete_product')], deleteProduct)
  .get(authenticateUser, authorizePermissions('view_my_product'), getSingleProduct);

router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;
