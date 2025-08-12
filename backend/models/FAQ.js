const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer']
  },
  category: {
    type: String,
    enum: ['general', 'seller', 'shopper', 'payments', 'shipping', 'returns', 'account', 'technical'],
    default: 'general'
  },
  subcategory: {
    type: String,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  userType: {
    type: String,
    enum: ['all', 'seller', 'shopper', 'wholesaler', 'retailer', 'manufacturer'],
    default: 'all'
  },
  published: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  relatedArticles: [{
    type: mongoose.Types.ObjectId,
    ref: 'ContentPage'
  }],
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add indexes for better performance
FAQSchema.index({ category: 1, published: 1 });
FAQSchema.index({ userType: 1, published: 1 });
FAQSchema.index({ featured: 1, published: 1 });
FAQSchema.index({ tags: 1 });
FAQSchema.index({ views: -1 });
FAQSchema.index({ helpfulCount: -1 });

module.exports = mongoose.model('FAQ', FAQSchema);
