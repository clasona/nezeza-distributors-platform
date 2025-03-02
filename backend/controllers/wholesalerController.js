// Wholesaler-specific logic (inventory, suborders)
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');


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
     const query = {};
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
    if (products.length < 1) {
      products = await Product.find({});  // If no products found, return all products
      return res.status(StatusCodes.OK).json({ products, total:products.length });  // Total number of filtered products
  
    }
    res.status(StatusCodes.OK).json({ products, total: totalCount,  // Total number of filtered products
      limit: parseInt(limit),
      offset: parseInt(offset),
      count: products.length,
    });
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
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId }).populate('reviews');
  
    if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
  
    res.status(StatusCodes.OK).json({ product });
  };

  

  module.exports = {
    getAllProducts,
    getSingleProduct,
    //getAllManufacturerProducts,
  };