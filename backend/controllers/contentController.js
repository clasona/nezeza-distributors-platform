const ContentPage = require('../models/ContentPage');
const FAQ = require('../models/FAQ');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// Content Pages Controllers
const getAllContentPages = async (req, res) => {
  try {
    const { category, featured, published = true, tag } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    if (published !== undefined) query.published = published === 'true';
    if (tag) query.tags = { $in: [tag] };
    
    const pages = await ContentPage.find(query)
      .select('title excerpt slug category featured published createdAt updatedAt')
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'firstName lastName');
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: pages,
      count: pages.length
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

const getContentPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const page = await ContentPage.findOne({ slug, published: true })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    if (!page) {
      throw new NotFoundError(`Page with slug ${slug} not found`);
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: page
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

const createContentPage = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;
    const page = await ContentPage.create(req.body);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: page
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new BadRequestError('A page with this slug already exists');
    }
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};

const updateContentPage = async (req, res) => {
  try {
    const { id } = req.params;
    req.body.updatedBy = req.user.userId;
    
    const page = await ContentPage.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!page) {
      throw new NotFoundError(`Page with id ${id} not found`);
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: page
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};

const deleteContentPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const page = await ContentPage.findByIdAndDelete(id);
    
    if (!page) {
      throw new NotFoundError(`Page with id ${id} not found`);
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// FAQ Controllers
const getAllFAQs = async (req, res) => {
  try {
    const { category, userType, featured, published = true, tag } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (userType) query.$or = [{ userType }, { userType: 'all' }];
    if (featured !== undefined) query.featured = featured === 'true';
    if (published !== undefined) query.published = published === 'true';
    if (tag) query.tags = { $in: [tag] };
    
    const faqs = await FAQ.find(query)
      .select('question answer category userType featured views helpfulCount')
      .sort({ featured: -1, order: 1, helpfulCount: -1 })
      .populate('relatedArticles', 'title slug');
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: faqs,
      count: faqs.length
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findById(id)
      .populate('relatedArticles', 'title slug excerpt');
    
    if (!faq) {
      throw new NotFoundError(`FAQ with id ${id} not found`);
    }
    
    // Increment view count
    faq.views += 1;
    await faq.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

const createFAQ = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;
    const faq = await FAQ.create(req.body);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};

const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    req.body.updatedBy = req.user.userId;
    
    const faq = await FAQ.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!faq) {
      throw new NotFoundError(`FAQ with id ${id} not found`);
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};

const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findByIdAndDelete(id);
    
    if (!faq) {
      throw new NotFoundError(`FAQ with id ${id} not found`);
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

const markFAQHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful
    
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      throw new NotFoundError(`FAQ with id ${id} not found`);
    }
    
    if (helpful) {
      faq.helpfulCount += 1;
    } else {
      faq.notHelpfulCount += 1;
    }
    
    await faq.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        helpfulCount: faq.helpfulCount,
        notHelpfulCount: faq.notHelpfulCount
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

const searchContent = async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;
    
    if (!query) {
      throw new BadRequestError('Search query is required');
    }
    
    const searchRegex = new RegExp(query, 'i');
    let results = {};
    
    if (type === 'all' || type === 'pages') {
      const pages = await ContentPage.find({
        $and: [
          { published: true },
          {
            $or: [
              { title: searchRegex },
              { content: searchRegex },
              { excerpt: searchRegex },
              { tags: { $in: [searchRegex] } }
            ]
          }
        ]
      }).select('title excerpt slug category');
      
      results.pages = pages;
    }
    
    if (type === 'all' || type === 'faqs') {
      const faqs = await FAQ.find({
        $and: [
          { published: true },
          {
            $or: [
              { question: searchRegex },
              { answer: searchRegex },
              { tags: { $in: [searchRegex] } }
            ]
          }
        ]
      }).select('question answer category userType');
      
      results.faqs = faqs;
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: results,
      query
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  // Content Pages
  getAllContentPages,
  getContentPageBySlug,
  createContentPage,
  updateContentPage,
  deleteContentPage,
  
  // FAQs
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  markFAQHelpful,
  
  // Search
  searchContent
};
