const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema(
 
    {
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    reviewableType: {
      type: String,
      enum: ['Product', 'User'],
      required: true,
    },
    reviewableId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ReviewSchema.statics.calculateAverageRating = async function (productId) {
//   const result = await this.aggregate([
//     { $match: { product: productId } },
//     {
//       $group: {
//         _id: null,
//         averageRating: { $avg: '$rating' },
//         numOfReviews: { $sum: 1 },
//       },
//     },
//   ]);

//   try {
//     await this.model('Product').findOneAndUpdate(
//       { _id: productId },
//       {
//         averageRating: Math.ceil(result[0]?.averageRating || 0),
//         numOfReviews: result[0]?.numOfReviews || 0,
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };

// ReviewSchema.post('save', async function () {
//   await this.constructor.calculateAverageRating(this.product);
// });

// ReviewSchema.post('remove', async function () {
//   await this.constructor.calculateAverageRating(this.product);
// });

module.exports = mongoose.model('Review', ReviewSchema);
