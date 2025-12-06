const express = require('express');
const Savings = require('../models/Savings');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all savings goals
router.get('/', authMiddleware, async (req, res) => {
  try {
    const savings = await Savings.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(savings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new savings goal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { goalName, targetAmount, deadline } = req.body;

    const savings = new Savings({
      userId: req.userId,
      goalName,
      targetAmount,
      deadline
    });

    await savings.save();
    res.status(201).json({ message: 'Savings goal created', savings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update savings amount (add money to goal)
router.put('/:id/add', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const savings = await Savings.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!savings) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    savings.currentAmount += parseFloat(amount);
    await savings.save();

    res.json({ message: 'Amount added to savings', savings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete savings goal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const savings = await Savings.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!savings) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    res.json({ message: 'Savings goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;