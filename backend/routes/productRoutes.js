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
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require('../controllers/productController');

const { getSingleProductReviews } = require('../controllers/reviewController');

router
  .route('/')
  .post(
    [authenticateUser, authorizePermissions('create_product')],
    createProduct
  );

router.route('/all').get(authenticateUser,authorizePermissions('view_my_products'),getAllProducts);

  
  router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('upload_product_image')], uploadImage);
  
  router
  .route('/:id')
  .patch([authenticateUser, authorizePermissions('update_product')], updateProduct)
  .delete([authenticateUser, authorizePermissions('delete_product')], deleteProduct)
    // .get(authenticateUser, authorizePermissions('view_my_product'), getSingleProduct);
    .get(getSingleProduct);


// router.route('/:id')
//     .get(authenticateUser, authorizePermissions('view_product'), getProduct);

// Get reviews for a single product by its ID
router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;
