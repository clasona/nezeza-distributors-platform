const mongoose = require('mongoose');

const ContentPageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, 'Slug cannot exceed 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  seoTitle: {
    type: String,
    maxlength: [200, 'SEO title cannot exceed 200 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [300, 'SEO description cannot exceed 300 characters']
  },
  category: {
    type: String,
    enum: ['general', 'seller', 'shopper', 'legal', 'support'],
    default: 'general'
  },
  published: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
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
// Note: slug index is automatically created due to unique: true
ContentPageSchema.index({ category: 1, published: 1 });
ContentPageSchema.index({ tags: 1 });
ContentPageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContentPage', ContentPageSchema);
