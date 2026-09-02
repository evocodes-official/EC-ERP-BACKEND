// This will correctly resolve to models/index.js
const mongoose = require('mongoose');
const { Stage, Deal, User } = require('../models/crm');

// ==========================================
// Helpers
// ==========================================

// Deal fields the API is allowed to write (prevents mass-assignment)
const ALLOWED_DEAL_FIELDS = [
  'companyName',
  'amount',
  'stageId',
  'assigneeId',
  'description',
  'tagLabel',
  'tagTheme',
  'footerText',
  'footerIcon',
  'commentCount'
];

const sanitizeDealInput = (body = {}) =>
  Object.keys(body)
    .filter((key) => ALLOWED_DEAL_FIELDS.includes(key))
    .reduce((acc, key) => {
      acc[key] = body[key];
      return acc;
    }, {});

const isValidObjectId = (value) =>
  typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);

/**
 * assigneeId / stageId are plain Strings in the Deal schema (no `ref`),
 * so Mongoose populate() is not available - assignees are resolved manually.
 * Batch-fetches users for a list of deals and returns a lookup map keyed by user id.
 */
const getAssigneeMap = async (deals) => {
  const ids = [
    ...new Set(deals.map((d) => d.assigneeId).filter(isValidObjectId))
  ];
  if (!ids.length) return {};

  const users = await User.find({ _id: { $in: ids } })
    .select('name avatarUrl')
    .lean();

  return users.reduce((map, user) => {
    map[String(user._id)] = {
      id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl || ''
    };
    return map;
  }, {});
};

// ==========================================
// Board Controllers
// ==========================================
// @desc    Get the full CRM board (stages + deals). Supports ?search= and ?sort=
// @route   GET /api/board
// @access  Public
const getBoard = async (req, res) => {
  try {
    const { search, sort } = req.query;

    let dealQuery = {};
    if (search && String(search).trim()) {
      const searchTerm = String(search).trim();
      dealQuery = {
        $or: [
          { companyName: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tagLabel: { $regex: searchTerm, $options: 'i' } }
        ]
      };
      if (!isNaN(searchTerm)) {
        // Exact amount match + partial match ("12" finds 12,000)
        dealQuery.$or.push({ amount: Number(searchTerm) });
        dealQuery.$or.push({
          $expr: {
            $regexMatch: [{ $toString: '$amount' }, searchTerm]
          }
        });
      }
    }

    let sortConfig = { updatedAt: -1 }; // newest first (default)
    if (sort === 'oldest') sortConfig = { updatedAt: 1 };
    if (sort === 'value-high') sortConfig = { amount: -1 };
    if (sort === 'value-low') sortConfig = { amount: 1 };

    const stages = await Stage.find().sort({ sortOrder: 1 }).lean();
    const allDeals = await Deal.find(dealQuery).sort(sortConfig).lean();

    const assigneeMap = await getAssigneeMap(allDeals);

    const board = stages.map((stage) => {
      const stageDeals = allDeals.filter(
        (deal) => String(deal.stageId) === String(stage._id)
      );

      return {
        id: stage._id,
        name: stage.name,
        color: stage.color,
        count: stageDeals.length,
        deals: stageDeals.map((deal) => ({
          id: deal._id,
          companyName: deal.companyName,
          amount: deal.amount,
          assignee: assigneeMap[String(deal.assigneeId)] || null,
          footer: deal.footerText
            ? { icon: deal.footerIcon, text: deal.footerText }
            : null,
          tag: deal.tagLabel
            ? { label: deal.tagLabel, theme: deal.tagTheme }
            : null,
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
// @desc    Get a single deal's full details (for the detail modal)
// @route   GET /api/deals/:id
// @access  Public
const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid deal id' });
    }

    const deal = await Deal.findById(id).lean();
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    // Manual lookups — stageId/assigneeId are plain Strings, not refs
    const [stage, assignees] = await Promise.all([
      isValidObjectId(deal.stageId)
        ? Stage.findById(deal.stageId).select('name color').lean()
        : null,
      getAssigneeMap([deal])
    ]);

    res.json({
      id: deal._id,
      companyName: deal.companyName,
      amount: deal.amount,
      stage: stage
        ? { id: stage._id, name: stage.name, color: stage.color }
        : null,
      description: deal.description || '',
      lastActivity: deal.updatedAt,
      commentCount: deal.commentCount,
      footer: deal.footerText
        ? { icon: deal.footerIcon, text: deal.footerText }
        : null,
      tag: deal.tagLabel ? { label: deal.tagLabel, theme: deal.tagTheme } : null,
      assignee: assignees[String(deal.assigneeId)] || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch deal details' });
  }
};

// @desc    Create a new deal. Body: { companyName, amount, description, stageId }
// @route   POST /api/deals
// @access  Public
const createDeal = async (req, res) => {
  try {
    const payload = sanitizeDealInput(req.body);

    if (!payload.companyName || !String(payload.companyName).trim()) {
      return res.status(400).json({ error: 'companyName is required' });
    }
    if (payload.amount == null || isNaN(Number(payload.amount))) {
      return res.status(400).json({ error: 'A valid amount is required' });
    }
    if (!payload.stageId) {
      return res.status(400).json({ error: 'stageId is required' });
    }

    const stage = isValidObjectId(payload.stageId)
      ? await Stage.findById(payload.stageId).lean()
      : null;
    if (!stage) {
      return res.status(400).json({ error: 'Stage not found' });
    }

    payload.amount = Number(payload.amount);
    payload.companyName = String(payload.companyName).trim();
    if (payload.description != null) {
      payload.description = String(payload.description);
    }

    const newDeal = await Deal.create(payload);
    res.status(201).json(newDeal);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create deal' });
  }
};

// @desc    Update a deal (partial updates supported - untouched fields are ignored)
// @route   PUT /api/deals/:id
// @access  Public
const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid deal id' });
    }

    const payload = sanitizeDealInput(req.body);
    if (payload.amount != null) {
      if (isNaN(Number(payload.amount))) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      payload.amount = Number(payload.amount);
    }
    if (payload.stageId && isValidObjectId(payload.stageId)) {
      const stage = await Stage.findById(payload.stageId).lean();
      if (!stage) return res.status(400).json({ error: 'Stage not found' });
    }

    const updatedDeal = await Deal.findByIdAndUpdate(
      id,
      { $set: payload },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedDeal) return res.status(404).json({ error: 'Deal not found' });
    res.json(updatedDeal);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update deal' });
  }
};

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Public
const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid deal id' });
    }

    const deletedDeal = await Deal.findByIdAndDelete(id);
    if (!deletedDeal) return res.status(404).json({ error: 'Deal not found' });
    res.json({ message: 'Deal deleted successfully', id: deletedDeal._id });
  } catch (error) {
    console.error(error);
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