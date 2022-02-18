const express = require('express');
const { protect, restrictTo } = require('../controllers/authCon');
const { createCategory, deleteCategory, getCategories, getCategory, updateCategory } = require('../controllers/categoryCon');
const { createCategoryValidator } = require('../validation/validator');

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, restrictTo('admin'), createCategoryValidator, createCategory);
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);
router.put('/:id', protect, restrictTo('admin'), createCategoryValidator, updateCategory);

module.exports = router;
