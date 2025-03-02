const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const {
  checkPermissions,
} = require('../utils');

/*
 * Create a new product.
 * User must be authenticated and have 'manufacturer' role to create a product.
 *
 * @param req - Express request object  - name, description, price, category, image (optional)
 * @param res - Express response object  - created product object
 */
const createProduct = async (req, res) => {
  // assign the authenticated user's ID to the product's manufacturer and storeId fields
  // const { manufacturerId } = req.params;
  const userId = req.user.userId;
  
  // if (userId !== req.user.userId.toString()) {
  //   throw new CustomError.UnauthorizedError(
  //     'You are not authorize to create products.'
  //   );
  // };
  
  const {storeId} = await User.findById(userId);
  if (!storeId) {
    throw new CustomError.UnauthorizedError('The buyer store does not exist.');
  };
  req.body.storeId = storeId;
  
   
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

/* 
 * Get all products.
 * Only wholestoreIds,manufacturers, and admin can view the products.
 * filter products based on category, price range, creation date, and storeId.
 * limit and offset are used for pagination.
 * sort by creation date
 * @param req - Express request object  - category, minPrice, maxPrice, createdAt, updatedAt, availability, storeId
 * @param res - Express response object  - array of products objects
 */
const getAllProducts = async (req, res) => {
  // const { manufacturerId } = req.params;
   const userId = req.user.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.UnauthorizedError(`No user with id : ${manufacturerId}`);
  }

  // if(req.user.userId.toString()!== manufacturerId) {
  //   throw new CustomError.UnauthorizedError('You are not authorize to view this product.');
  // }

  const { storeId } = user;
  if (!storeId) {
    throw new CustomError.UnauthorizedError('The user store does not exist.');
  }
  //TODO: Implement filtering and pagination
  // Extract query parameters for filtering
  const {
    category,
    minPrice,
    maxPrice,
    createdAt,
    updatedAt,
    availability,
    freeShipping,
    averageRating,
    featured,
    name,
    limit = 0,  // Default limit
    offset = 0,   // Default offset
  } = req.query;

   // Build the query object for filtering
   const query = { storeId  };
   if (name) query.name = name;
   if (category) query.category = category; 
   if (createdAt) query.createdAt = { $gte: new Date(createdAt) };  // Filter by creation date
   if (updatedAt) query.updatedAt = { $gte: new Date(updatedAt) };  // Filter by updated date
   if (availability) query.availability = availability;  // Boolean or status field for availability
   if (freeShipping) query.freeShipping = freeShipping;  // Boolean or status field for free shipping
   if (averageRating) query.averageRating = averageRating;  // average rating field filter
   if (featured) query.featured = featured;  // featured field filter
  

   if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    console.log(query);
  }


  // Get the total count of products for pagination purposes
  const totalCount = await Product.countDocuments(query);
  
  let products = await Product.find(query)
  .skip(parseInt(offset))    // Skip the number of records based on the offset
  .limit(parseInt(limit))    // Limit the number of records to return
  .sort({ createdAt: -1 });  // Sort by creation date, most recent first;
  
  res.status(StatusCodes.OK).json({ products, total: totalCount,  // Total number of filtered products
    limit: parseInt(limit),
    offset: parseInt(offset),
    count: products.length,
  });
};

const createProductsQuery = (req) => {
  // Extract query parameters for filtering
  const {
    category,
    minPrice,
    maxPrice,
    createdAt,
    updatedAt,
    availability,
    freeShipping,
    averageRating,
    featured,
    name,
    limit = 0, // Default limit
    offset = 0, // Default offset
  } = req.query;

  // Build the query object for filtering
  const query = {};
  if (name) query.name = name;
  if (category) query.category = category;
  if (createdAt) query.createdAt = { $gte: new Date(createdAt) }; // Filter by creation date
  if (updatedAt) query.updatedAt = { $gte: new Date(updatedAt) }; // Filter by updated date
  if (availability) query.availability = availability; // Boolean or status field for availability
  if (freeShipping) query.freeShipping = freeShipping; // Boolean or status field for free shipping
  if (averageRating) query.averageRating = averageRating; // average rating field filter
  if (featured) query.featured = featured; // featured field filter

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    console.log(query);
  }

  return query;
}
const getAllRetailersProducts = async (req, res) => {
  const query = createProductsQuery(req);
  try {
    // 1. Find all stores with storeType 'retail'
    const retailStores = await Store.find({ storeType: 'retail' });

    // 2. Extract storeIds from retail stores
    const retailStoreIds = retailStores.map((store) => store._id);

    // 3. Add storeId filter to the product query
    query.storeId = { $in: retailStoreIds };

    // Get the total count of products for pagination purposes
    const totalCount = await Product.countDocuments(query);

    let products = await Product.find(query)
      .populate('storeId') //Populate storeId to get store info if needed.
      .skip(parseInt(query.offset)) // Skip the number of records based on the offset
      .limit(parseInt(query.limit)) // Limit the number of records to return
      .sort({ createdAt: -1 }); // Sort by creation date, most recent first;

    res.status(StatusCodes.OK).json({
      products,
      total: totalCount, // Total number of filtered products
      limit: parseInt(query.limit),
      offset: parseInt(query.offset),
      count: products.length,
    });
  } catch (error) {
    console.error('Error in getAllRetailersProducts:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
};

const getAllWholesalersProducts = async (req, res) => {
  const query = createProductsQuery(req);
  try {
    // 1. Find all stores with storeType 'retail'
    const retailStores = await Store.find({ storeType: 'wholesale' });

    // 2. Extract storeIds from retail stores
    const retailStoreIds = retailStores.map((store) => store._id);

    // 3. Add storeId filter to the product query
    query.storeId = { $in: retailStoreIds };

    // Get the total count of products for pagination purposes
    const totalCount = await Product.countDocuments(query);

    let products = await Product.find(query)
      .populate('storeId') //Populate storeId to get store info if needed.
      .skip(parseInt(query.offset)) // Skip the number of records based on the offset
      .limit(parseInt(query.limit)) // Limit the number of records to return
      .sort({ createdAt: -1 }); // Sort by creation date, most recent first;

    res.status(StatusCodes.OK).json({
      products,
      total: totalCount, // Total number of filtered products
      limit: parseInt(query.limit),
      offset: parseInt(query.offset),
      count: products.length,
    });
  } catch (error) {
    console.error('Error in getAllWholesalersProducts:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
};

const getAllManufacturersProducts = async (req, res) => {
  const query = createProductsQuery(req);
  try {
    // 1. Find all stores with storeType 'retail'
    const retailStores = await Store.find({ storeType: 'manufacturing' });

    // 2. Extract storeIds from retail stores
    const retailStoreIds = retailStores.map((store) => store._id);

    // 3. Add storeId filter to the product query
    query.storeId = { $in: retailStoreIds };

    // Get the total count of products for pagination purposes
    const totalCount = await Product.countDocuments(query);

    let products = await Product.find(query)
      .populate('storeId') //Populate storeId to get store info if needed.
      .skip(parseInt(query.offset)) // Skip the number of records based on the offset
      .limit(parseInt(query.limit)) // Limit the number of records to return
      .sort({ createdAt: -1 }); // Sort by creation date, most recent first;

    res.status(StatusCodes.OK).json({
      products,
      total: totalCount, // Total number of filtered products
      limit: parseInt(query.limit),
      offset: parseInt(query.offset),
      count: products.length,
    });
  } catch (error) {
    console.error('Error in getAllManufacturersProducts:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
};

/*
 * Get a single product.
 * Only wholestoreIds,manufacturers, and admin can view the product.
 * @param req - Express request object  - productId
 * @param res - Express response object  - product object
 * @throws NotFoundError if product not found
 * throws ForbiddenError if user does not have 'manufacturer' role to view the product
*/

const getSingleProduct = async (req, res) => {
  // const userId = req.user.userId;
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate('reviews');

  // const user = await User.findById(userId);

  // if (!user) {
  //   throw new CustomError.UnauthorizedError(
  //     `No user with id : ${userId}`
  //   );
  // }

  // const isIndividualCustomer = !user.storeId; // True if buyer has no storeId (i.e., is a customer)

  // const storeId = isIndividualCustomer ? userId : user.storeId;
  // if(req.user.userId.toString()!== manufacturerId) {
  //   throw new CustomError.UnauthorizedError('You are not authorize to view this product.');
  // }

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }
  // if(product.storeId.toString()!== user.storeId.toString()) {
  //   throw new CustomError.UnauthorizedError('You are not authorize to view this product.');
  //   }

  res.status(StatusCodes.OK).json({ product });
};


/*
 * Update a product.
 * User must be authenticated and have 'manufacturer' role to update a product.
 *
 * @param req - Express request object  - productId, name, description, price, category, image (optional)
 * @param res - Express response object  - updated product object
 */
const updateProduct = async (req, res) => {

  const { id: productId } = req.params;
    const userId = req.user.userId;

  const productToUpdate = await Product.findOne({ _id: productId }).populate('reviews');
  const user = await User.findById(userId);

  if (!user) {
    throw new CustomError.UnauthorizedError(`No user with id : ${userId}`);
  }

  // if(req.user.userId.toString()!== manufacturerId) {
  //   throw new CustomError.UnauthorizedError('You are not authorize to view this product.');
  // }
  console.log(productToUpdate)
  if (!productToUpdate) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }
  
  // console.log(user.storeId.toString());
  // console.log(productToUpdate.storeId.toString());
  if(productToUpdate.storeId.toString()!== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError('You are not authorize to update this product.');
  }
  
  const product = await Product.findOneAndUpdate({_id: productId}, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
/*
 * Delete a product.
 * User must be authenticated and have 'manufacturer' role to delete a product.
 *
 * @param req - Express request object  - productId
 * @param res - Express response object  - message
 */
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
      const userId = req.user.userId;
  
  const productToDelete = await Product.findOne({ _id: productId }).populate('reviews');
  if (!productToDelete) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.UnauthorizedError(`No user with id : ${userId}`);
  }

  // if(req.user.userId.toString()!== manufacturerId) {
  //   throw new CustomError.UnauthorizedError('You are not authorize to view this product.');
  // }

  if(productToDelete.storeId.toString()!== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError('You are not authorize to delete this product.');
  }

  await productToDelete.deleteOne({_id: productId});
  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};
/*
 * Upload product image.
 * User must be authenticated and have 'manufacturer' role to upload an image.
 *
 * @param req - Express request object  - image
 * @param res - Express response object  - image URL
 */
const uploadImage = async (req, res) => {
  const { manufacturerId } = req.params;

  const user = await User.findById(manufacturerId);
  if (!user) {
    throw new CustomError.UnauthorizedError(`No user with id : ${manufacturerId}`);
  }
  if (!req.files) {
    throw new CustomError.BadRequestError('No File Uploaded');
  }
  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image');
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      'Please upload image smaller than 1MB'
    );
  }

  const imagePath = path.join(
    __dirname,
    '../public/uploads/' + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getAllRetailersProducts,
  getAllWholesalersProducts,
  getAllManufacturersProducts,
  getSingleProduct,
  // getProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  //getAllManufacturerProducts,
};
