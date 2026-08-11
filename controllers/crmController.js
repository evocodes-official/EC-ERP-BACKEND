// This will correctly resolve to models/index.js
const { Stage, Deal } = require('../models/crm');

// ==========================================
// Board Controllers
// ==========================================
const getBoard = async (req, res) => {
  try {
    const { search, sort } = req.query;
    
    let dealQuery = {};
    if (search) {
      dealQuery = {
        $or: [
          { companyName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tagLabel: { $regex: search, $options: 'i' } }
        ]
      };
      if (!isNaN(search)) {
        dealQuery.$or.push({ amount: Number(search) });
      }
    }

    let sortConfig = { updatedAt: -1 }; 
    if (sort === 'oldest') sortConfig = { updatedAt: 1 };
    if (sort === 'value-high') sortConfig = { amount: -1 };
    if (sort === 'value-low') sortConfig = { amount: 1 };

    const stages = await Stage.find().sort({ sortOrder: 1 }).lean();
    const allDeals = await Deal.find(dealQuery)
      .sort(sortConfig)
      .populate('assigneeId', 'name avatarUrl')
      .lean();

    const board = stages.map(stage => {
      const stageDeals = allDeals.filter(
        deal => deal.stageId.toString() === stage._id.toString()
      );

      return {
        id: stage._id,
        name: stage.name,
        color: stage.color,
        count: stageDeals.length,
        deals: stageDeals.map(deal => ({
          id: deal._id,
          companyName: deal.companyName,
          amount: deal.amount,
          assignee: deal.assigneeId,
          footer: deal.footerText ? { icon: deal.footerIcon, text: deal.footerText } : null,
          tag: deal.tagLabel ? { label: deal.tagLabel, theme: deal.tagTheme } : null,
          commentCount: deal.commentCount,
          updatedAt: deal.updatedAt
        }))
      };
    });

    res.json({ board });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching board' });
  }
};

// ==========================================
// Deal Controllers
// ==========================================
const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('stageId', 'name color')
      .populate('assigneeId', 'name avatarUrl')
      .lean();

    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    res.json({
      id: deal._id,
      companyName: deal.companyName,
      amount: deal.amount,
      stage: {
        id: deal.stageId._id,
        name: deal.stageId.name,
        color: deal.stageId.color
      },
      description: deal.description,
      lastActivity: deal.updatedAt,
      commentCount: deal.commentCount,
      assignee: deal.assigneeId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deal details' });
  }
};

const createDeal = async (req, res) => {
  try {
    const newDeal = new Deal(req.body);
    await newDeal.save();
    res.status(201).json(newDeal);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create deal' });
  }
};

const updateDeal = async (req, res) => {
  try {
    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedDeal) return res.status(404).json({ error: 'Deal not found' });
    res.json(updatedDeal);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update deal' });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const deletedDeal = await Deal.findByIdAndDelete(req.params.id);
    if (!deletedDeal) return res.status(404).json({ error: 'Deal not found' });
    res.json({ message: 'Deal deleted successfully', id: deletedDeal._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deal' });
  }
};

// ==========================================
// Export All Controllers
// ==========================================
module.exports = {
  getBoard,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
};