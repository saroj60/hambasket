
import express from 'express';
const router = express.Router();
import Category from '../models/category.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fetch all categories (Admin)
// @route   GET /api/categories/admin
// @access  Private/Admin
router.get('/admin', protect, isAdmin, async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ displayOrder: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, displayOrder, isActive } = req.body;

        let image = '';
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image; // Handle URL string
        }

        const category = new Category({
            name,
            image,
            displayOrder: displayOrder || 0,
            isActive: isActive === 'true' || isActive === true
        });

        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, displayOrder, isActive } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.displayOrder = displayOrder !== undefined ? displayOrder : category.displayOrder;
            category.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : category.isActive;

            if (req.file) {
                category.image = `/uploads/${req.file.filename}`;
            } else if (req.body.image) {
                category.image = req.body.image;
            }

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add Subcategory
// @route   POST /api/categories/:id/subcategory
// @access  Private/Admin
router.post('/:id/subcategory', protect, isAdmin, async (req, res) => {
    try {
        const { name, image } = req.body; // Expect JSON body for simplicity for subcats initially
        const category = await Category.findById(req.params.id);

        if (category) {
            const exists = category.subCategories.find(s => s.name === name);
            if (exists) {
                return res.status(400).json({ message: 'Subcategory already exists' });
            }

            category.subCategories.push({ name, image });
            await category.save();
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Remove Subcategory
// @route   DELETE /api/categories/:id/subcategory/:subName
// @access  Private/Admin
router.delete('/:id/subcategory/:subName', protect, isAdmin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            category.subCategories = category.subCategories.filter(s => s.name !== req.params.subName);
            await category.save();
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
