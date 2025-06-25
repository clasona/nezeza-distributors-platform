const mongoose = require('mongoose');
const Review = require('../models/Review');

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name can not be more than 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    image: {
      type: String,
      default: '/uploads/example.jpeg',
    },
    images: {
      type: [{ type: String }],
      required: [true, 'Please provide product images'],
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['food', 'electronics', 'furniture', 'clothing', 'others'],
    },

    colors: {
      type: [String],
      default: ['#222'],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Review',
      },
    ],
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
    taxRate: { type: Number, required: true, default: 0 }, // Seller-defined tax rate
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.statics.calculateAverageRating = async function (productId) {
  try {
    const pId =
      typeof productId === 'string'
        ? new mongoose.Types.ObjectId(productId)
        : productId;

    // Find all reviews for this product
    const reviews = await Review.find({
      reviewableId: pId,
      reviewableType: 'Product',
    });

    // If there are no reviews, set rating to 0
    if (!reviews || reviews.length === 0) {
      await this.findByIdAndUpdate(pId, {
        rating: 0,
        numOfReviews: 0,
      });
      console.log('No product reviews found, setting rating to 0');
      return;
    }

    // Calculate the average rating manually
    let totalRating = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
    });

    const averageRating = totalRating / reviews.length;

    // Update the product with the new rating
    await this.findByIdAndUpdate(pId, {
      rating: averageRating,
      numOfReviews: reviews.length,
    });
  } catch (error) {
    console.error('Error calculating product average rating:', error);
  }
};

module.exports = mongoose.model('Product', ProductSchema);
