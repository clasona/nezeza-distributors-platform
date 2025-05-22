const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

/**
 * Creates a new review in the database.
 *
 * @async
 * @function createReview
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response containing the created review.
 * @throws {Error} - If there is an error creating the review.
 */
const createReview = async (req, res) => {
  try {
    const { rating, comment, reviewableType, reviewableId } = req.body;
    if (!rating || !comment || !reviewableType || !reviewableId) {
      throw new CustomError.BadRequestError(
        'Please provide rating, comment, reviewable type and Id.'
      );
    }

    if (!req.user || !req.user.userId) {
      throw new CustomError.UnauthenticatedError(
        'Authentication required to create a review.'
      );
    }

    const userId = req.user.userId;
    if (reviewableType === 'Product') {
      // Check if the user has ordered in this product
      const hasOrdered = await Order.findOne({
        buyerId: userId,
        'orderItems.product': reviewableId,
       // You might want to add date checks here to ensure the order has been completed or shipped
    // e.g., 'orderItems.status': 'delivered' or some 'orderDate': { $lt: new Date() }
      });

      if (!hasOrdered) {
        throw new CustomError.UnauthorizedError(
          'You must have bought this product to leave a review.'
        );
      }
    }  else if (reviewableType === 'User') {
      // Not checking for now sellers
    }

    const existingReview = await Review.findOne({
      user: userId,
      reviewableType,
      reviewableId,
    });

    if (existingReview) {
      throw new CustomError.BadRequestError(
        `You have already reviewed this ${reviewableType}.`
      );
    }

    const review = await Review.create({
      rating,
      comment,
      reviewableType,
      reviewableId,
      user: userId,
    });

    // If the review is for a Product, trigger the rating update and attach the review ID
    if (reviewableType === 'Product') {
      const product = await Product.findByIdAndUpdate(
        reviewableId,
        { $push: { reviews: review._id } }, // Add the review's _id to the reviews array
        { new: true, runValidators: true } // Return the updated document
      );

      if (!product) {
        console.warn(
          `Product with ID ${reviewableId} not found while attaching review.`
        );
        // You might want to handle this case more explicitly, perhaps by throwing an error
      }
      await Product.calculateAverageRating(reviewableId);
    } else if (reviewableType === 'User') {
      //TODO: Implement for sellers
    }

    res.status(StatusCodes.CREATED).json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    if (
      error instanceof CustomError.BadRequestError ||
      error instanceof CustomError.UnauthenticatedError ||
      error instanceof CustomError.UnauthorizedError
    ) {
      res.status(error.statusCode).json({ msg: error.message });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Failed to create review', error: error.message });
    }
  }
};

/**
 * Retrieves all reviews from the database.
 *
 * @async
 * @function getAllReviews
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response containing an array of all reviews.
 * @throws {Error} - If there is an error fetching the reviews.
 */
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user');
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Failed to retrieve reviews' });
  }
};

/**
 * Retrieves a single review from the database by its ID.
 *
 * @async
 * @function getReviewById
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response containing the found review.
 * @throws {CustomError.NotFoundError} - If no review with the specified ID is found.
 * @throws {Error} - If there is an error fetching the review.
 */
const getReviewById = async (req, res) => {
  try {
    const { id: reviewId } = req.params; // Get the review ID from the request parameters
    const review = await Review.findOne({ _id: reviewId }); // Find the review by ID

    if (!review) {
      throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
    }

    res.status(StatusCodes.OK).json({ review });
  } catch (error) {
    if (error instanceof CustomError.NotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
    } else if (error.name === 'CastError') {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: `Invalid ID format: ${reviewId}` });
    } else {
      console.error('Error fetching review by ID:', error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: 'Failed to retrieve review' });
    }
  }
};

/**
 * Updates a review in the database.
 *
 * @async
 * @function updateReview
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response with the updated review or an error message.
 * @throws {Error} - If there is an error updating the review.
 */
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No review with id: ${reviewId}` });
    }
    if (review.user.toString() !== req.user.userId) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Not authorized to update this review' });
    }
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    res.status(StatusCodes.OK).json({ review });
  } catch (error) {
    if (error.name === 'CastError') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: `Invalid ID format: ${reviewId}` });
    }
    console.error('Error updating review:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Failed to update review', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No review with id: ${reviewId}` });
    }

    // Optionally check ownership
    if (review.user.toString() !== req.user.userId) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Not authorized to delete this review' });
    }

    // Remove the review's ID from the associated entity's reviews array
    const { reviewableType, reviewableId } = review;

    // Delete the review first??
    // await Review.deleteOne({ _id: reviewId });
    if (reviewableType === 'Product') {
      const product = await Product.findByIdAndUpdate(
        reviewableId,
        { $pull: { reviews: reviewId } }, // Remove the review's _id from the array
        { new: true }
      );
      if (!product) {
        console.warn(
          `Product with ID ${reviewableId} not found while deleting review.`
        );
      }

      // Delete the review first to ensure it's not counted in recalculation
      await Review.deleteOne({ _id: reviewId });

      // Recalculate the average rating after deleting the review
      await Product.calculateAverageRating(reviewableId);
    } else if (reviewableType === 'User') {
//TODO: Implement for sellers
    }

    res.status(StatusCodes.OK).json({ message: 'Review deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: `Invalid ID format: ${reviewId}` });
    }
    console.error('Error deleting review:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Failed to delete review', error: error.message });
  }
};

const getReviewsByEntityTypeAndId = async (req, res) => {
  const { type: reviewableType, id: reviewableId } = req.params;

  // 1. Validate the reviewableType (optional, but good practice)
  const allowedTypes = ['Product', 'User'];
  if (!allowedTypes.includes(reviewableType)) {
    throw new CustomError.BadRequestError(
      `Invalid reviewable type: ${reviewableType}. Allowed types are: ${allowedTypes.join(
        ', '
      )}`
    );
  }

  try {
    const reviews = await Review.find({
      reviewableType,
      reviewableId,
    }).populate('user');

    if (!reviews || reviews.length === 0) {
      return res
        .status(StatusCodes.OK) // It's OK if no reviews exist
        .json({
          msg: `No reviews found for ${reviewableType} with ID: ${reviewableId}`,
          reviews: [],
        });
    }

    res.status(StatusCodes.OK).json({ reviews });
  } catch (error) {
    console.error(
      `Error fetching reviews for ${reviewableType} with ID ${reviewableId}:`,
      error
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};
module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByEntityTypeAndId,
};
