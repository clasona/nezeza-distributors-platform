const express = require('express');
const router = express.Router();

const {
  getAllContentPages,
  getContentPageBySlug,
  createContentPage,
  updateContentPage,
  deleteContentPage,
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  markFAQHelpful,
  searchContent
} = require('../controllers/contentController');

const { authenticateUser } = require('../middleware/authentication');

// Public routes
router.get('/pages', getAllContentPages);
router.get('/pages/:slug', getContentPageBySlug);
router.get('/faqs', getAllFAQs);
router.get('/faqs/:id', getFAQById);
router.get('/search', searchContent);
router.post('/faqs/:id/helpful', markFAQHelpful);

// Protected routes (Admin only - YVES TO TAKE A LOOK for permission middleware)
router.post('/pages', authenticateUser, createContentPage);
router.put('/pages/:id', authenticateUser, updateContentPage);
router.delete('/pages/:id', authenticateUser, deleteContentPage);
router.post('/faqs', authenticateUser, createFAQ);
router.put('/faqs/:id', authenticateUser, updateFAQ);
router.delete('/faqs/:id', authenticateUser, deleteFAQ);

module.exports = router;
