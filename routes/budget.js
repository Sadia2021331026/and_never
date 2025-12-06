const express = require('express');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all budgets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create budget
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    const budget = new Budget({
      userId: req.userId,
      category,
      limit,
      month,
      year
    });

    await budget.save();
    res.status(201).json({ message: 'Budget created', budget });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check budget warning
router.get('/check/:category', authMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Find budget
    const budget = await Budget.findOne({
      userId: req.userId,
      category,
      month: currentMonth.toString(),
      year: currentYear
    });

    if (!budget) {
      return res.json({ warning: false, message: 'No budget set for this category' });
    }

    // Calculate total expense
    const transactions = await Transaction.find({
      userId: req.userId,
      type: 'expense',
      category
    });

    const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);

    const warning = totalExpense >= budget.limit;

    res.json({
      warning,
      budget: budget.limit,
      spent: totalExpense,
      remaining: budget.limit - totalExpense
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete budget
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;