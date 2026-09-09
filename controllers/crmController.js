const mongoose = require('mongoose');
const { Stage, Deal, User } = require('../models/crm');
const config = require('../config/jwt');

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
        dealQuery.$or.push({ amount: Number(searchTerm) });
        dealQuery.$or.push({
          $expr: {
            $regexMatch: [{ $toString: '$amount' }, searchTerm]
          }
        });
      }
    }

    let sortConfig = { updatedAt: -1 };
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

    res.status(200).json({
      success: true,
      data: { board },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching board',
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal id'
      });
    }

    const deal = await Deal.findById(id).lean();
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const [stage, assignees] = await Promise.all([
      isValidObjectId(deal.stageId)
        ? Stage.findById(deal.stageId).select('name color').lean()
        : null,
      getAssigneeMap([deal])
    ]);

    res.status(200).json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deal details',
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const createDeal = async (req, res) => {
  try {
    const payload = sanitizeDealInput(req.body);

    if (!payload.companyName || !String(payload.companyName).trim()) {
      return res.status(400).json({
        success: false,
        message: 'companyName is required'
      });
    }
    if (payload.amount == null || isNaN(Number(payload.amount))) {
      return res.status(400).json({
        success: false,
        message: 'A valid amount is required'
      });
    }
    if (!payload.stageId) {
      return res.status(400).json({
        success: false,
        message: 'stageId is required'
      });
    }

    const stage = isValidObjectId(payload.stageId)
      ? await Stage.findById(payload.stageId).lean()
      : null;
    if (!stage) {
      return res.status(400).json({
        success: false,
        message: 'Stage not found'
      });
    }

    payload.amount = Number(payload.amount);
    payload.companyName = String(payload.companyName).trim();
    if (payload.description != null) {
      payload.description = String(payload.description);
    }

    const newDeal = await Deal.create(payload);
    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: newDeal,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Failed to create deal',
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal id'
      });
    }

    const payload = sanitizeDealInput(req.body);
    if (payload.amount != null) {
      if (isNaN(Number(payload.amount))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }
      payload.amount = Number(payload.amount);
    }
    if (payload.stageId && isValidObjectId(payload.stageId)) {
      const stage = await Stage.findById(payload.stageId).lean();
      if (!stage) {
        return res.status(400).json({
          success: false,
          message: 'Stage not found'
        });
      }
    }

    const updatedDeal = await Deal.findByIdAndUpdate(
      id,
      { $set: payload },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedDeal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Deal updated successfully',
      data: updatedDeal,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Failed to update deal',
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal id'
      });
    }

    const deletedDeal = await Deal.findByIdAndDelete(id);
    if (!deletedDeal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully',
      data: { id: deletedDeal._id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deal',
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getBoard,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
};