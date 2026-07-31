import Cuppon from "../models/cupponModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// ============================================
//  ADMIN: Create Coupon
// ============================================
const createCuppon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      perUserLimit,
      applicableCategories,
      applicableProducts,
      excludedCategories,
      excludedProducts,
      isFirstTimeOnly,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // coupon code already exists কিনা চেক
    const existingCuppon = await Cuppon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingCuppon) {
      return res.status(400).json({
        error: `Coupon code "${code.toUpperCase().trim()}" already exists.`,
      });
    }

    // endDate validation
    if (new Date(endDate) <= new Date(startDate || Date.now())) {
      return res.status(400).json({
        error: "End date must be after start date.",
      });
    }

    // percentage হলে maximumDiscountAmount check
    if (
      discountType === "percentage" &&
      maximumDiscountAmount !== null &&
      maximumDiscountAmount <= 0
    ) {
      return res.status(400).json({
        error: "Maximum discount amount must be greater than 0 or left empty.",
      });
    }

    const cuppon = new Cuppon({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount: maximumDiscountAmount || null,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || 1,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      excludedCategories: excludedCategories || [],
      excludedProducts: excludedProducts || [],
      isFirstTimeOnly: isFirstTimeOnly || false,
      startDate: startDate || Date.now(),
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    const createdCuppon = await cuppon.save();
    res.status(201).json(createdCuppon);
  } catch (error) {
    console.error("Create Cuppon Error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({ error: "Coupon code already exists." });
    }

    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Get All Coupons
// ============================================
const getAllCuppons = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // optional filters
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }
    if (req.query.discountType) {
      filter.discountType = req.query.discountType;
    }
    if (req.query.search) {
      filter.code = { $regex: req.query.search, $options: "i" };
    }

    const total = await Cuppon.countDocuments(filter);
    const cuppons = await Cuppon.find(filter)
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      cuppons,
      page,
      totalPages: Math.ceil(total / limit),
      totalCuppons: total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Get Coupon by ID
// ============================================
const getCupponById = async (req, res) => {
  try {
    const cuppon = await Cuppon.findById(req.params.id).populate(
      "createdBy",
      "username email",
    );

    if (!cuppon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json(cuppon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Update Coupon
// ============================================
const updateCuppon = async (req, res) => {
  try {
    const cuppon = await Cuppon.findById(req.params.id);

    if (!cuppon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // code আপডেট হলে uniqueness check
    if (req.body.code && req.body.code.toUpperCase().trim() !== cuppon.code) {
      const existing = await Cuppon.findOne({
        code: req.body.code.toUpperCase().trim(),
      });
      if (existing) {
        return res.status(400).json({ error: "Coupon code already exists." });
      }
      cuppon.code = req.body.code.toUpperCase().trim();
    }

    const updatableFields = [
      "description",
      "discountType",
      "discountValue",
      "minimumOrderAmount",
      "maximumDiscountAmount",
      "usageLimit",
      "perUserLimit",
      "applicableCategories",
      "applicableProducts",
      "excludedCategories",
      "excludedProducts",
      "isFirstTimeOnly",
      "startDate",
      "endDate",
      "isActive",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        cuppon[field] = req.body[field];
      }
    });

    // endDate validation
    if (cuppon.endDate <= cuppon.startDate) {
      return res.status(400).json({
        error: "End date must be after start date.",
      });
    }

    // percentage validation
    if (
      cuppon.discountType === "percentage" &&
      (cuppon.discountValue <= 0 || cuppon.discountValue > 100)
    ) {
      return res.status(400).json({
        error: "Percentage discount must be between 1 and 100.",
      });
    }

    const updatedCuppon = await cuppon.save();
    res.json(updatedCuppon);
  } catch (error) {
    console.error("Update Cuppon Error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({ error: "Coupon code already exists." });
    }

    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Delete Coupon
// ============================================
const deleteCuppon = async (req, res) => {
  try {
    const cuppon = await Cuppon.findById(req.params.id);

    if (!cuppon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    await cuppon.deleteOne();
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Toggle Active Status
// ============================================
const toggleCupponStatus = async (req, res) => {
  try {
    const cuppon = await Cuppon.findById(req.params.id);

    if (!cuppon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    cuppon.isActive = !cuppon.isActive;
    const updated = await cuppon.save();

    res.json({
      message: `Coupon ${updated.isActive ? "activated" : "deactivated"} successfully`,
      isActive: updated.isActive,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  USER: Validate Coupon — চেক করে coupon valid কিনা
// ============================================
const validateCuppon = async (req, res) => {
  try {
    const { code, itemsPrice, productIds } = req.body;
    const userId = req.user._id;

    const cuppon = await Cuppon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!cuppon) {
      return res.status(404).json({
        valid: false,
        error: "Invalid or inactive coupon code.",
      });
    }

    // ১) Date check
    const now = new Date();
    if (now < cuppon.startDate) {
      return res.status(400).json({
        valid: false,
        error: "This coupon is not yet active.",
      });
    }
    if (now > cuppon.endDate) {
      return res.status(400).json({
        valid: false,
        error: "This coupon has expired.",
      });
    }

    // ২) Total usage limit check
    if (cuppon.usageLimit !== null && cuppon.usageCount >= cuppon.usageLimit) {
      return res.status(400).json({
        valid: false,
        error: "This coupon has reached its usage limit.",
      });
    }

    // ৩) Per-user usage check
    if (cuppon.perUserLimit !== null && userId) {
      const userUsageCount = await Order.countDocuments({
        user: userId,
        "appliedCuppon.cupponId": cuppon._id,
      });

      if (userUsageCount >= cuppon.perUserLimit) {
        return res.status(400).json({
          valid: false,
          error: `You have already used this coupon ${userUsageCount} time(s). Limit is ${cuppon.perUserLimit}.`,
        });
      }
    }

    // ৪) First-time user check
    if (cuppon.isFirstTimeOnly && userId) {
      const previousOrders = await Order.countDocuments({ user: userId });
      if (previousOrders > 0) {
        return res.status(400).json({
          valid: false,
          error: "This coupon is only for first-time buyers.",
        });
      }
    }

    // ৫) Minimum order amount check
    const orderAmount = Number(itemsPrice) || 0;
    if (orderAmount < cuppon.minimumOrderAmount) {
      return res.status(400).json({
        valid: false,
        error: `Minimum order amount is ৳${cuppon.minimumOrderAmount}. Your current subtotal is ৳${orderAmount}.`,
      });
    }

    // ৬) Product/Category restriction check
    if (productIds && productIds.length > 0) {
      // excluded products check
      if (cuppon.excludedProducts.length > 0) {
        const hasExcluded = productIds.some((pid) =>
          cuppon.excludedProducts.includes(pid.toString()),
        );
        if (hasExcluded) {
          return res.status(400).json({
            valid: false,
            error:
              "This coupon is not applicable to one or more products in your cart.",
          });
        }
      }

      // applicable products — যদি specified থাকে, তাহলে অন্তত একটি product match করতে হবে
      if (cuppon.applicableProducts.length > 0) {
        const hasApplicable = productIds.some((pid) =>
          cuppon.applicableProducts.includes(pid.toString()),
        );
        if (!hasApplicable) {
          return res.status(400).json({
            valid: false,
            error: "This coupon is not applicable to any product in your cart.",
          });
        }
      }
    }

    // ৭) Discount calculate
    let discountAmount = 0;

    if (cuppon.discountType === "percentage") {
      discountAmount = (orderAmount * cuppon.discountValue) / 100;

      // maximum discount cap
      if (
        cuppon.maximumDiscountAmount !== null &&
        discountAmount > cuppon.maximumDiscountAmount
      ) {
        discountAmount = cuppon.maximumDiscountAmount;
      }
    } else {
      // fixed
      discountAmount = cuppon.discountValue;

      // fixed discount order amount এর বেশি হতে পারবে না
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
      }
    }

    const finalPrice = orderAmount - discountAmount;

    res.json({
      valid: true,
      cuppon: {
        _id: cuppon._id,
        code: cuppon.code,
        description: cuppon.description,
        discountType: cuppon.discountType,
        discountValue: cuppon.discountValue,
        minimumOrderAmount: cuppon.minimumOrderAmount,
        maximumDiscountAmount: cuppon.maximumDiscountAmount,
      },
      discountAmount: Number(discountAmount.toFixed(2)),
      itemsPrice: Number(orderAmount.toFixed(2)),
      finalPrice: Number(finalPrice.toFixed(2)),
    });
  } catch (error) {
    console.error("Validate Cuppon Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  USER: Get Active Coupons (public listing)
// ============================================
const getActiveCuppons = async (req, res) => {
  try {
    const now = new Date();

    const cuppons = await Cuppon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).select(
      "code description discountType discountValue minimumOrderAmount maximumDiscountAmount endDate",
    );

    res.json(cuppons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Coupon Usage Stats
// ============================================
const getCupponUsageStats = async (req, res) => {
  try {
    const cuppon = await Cuppon.findById(req.params.id);

    if (!cuppon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // এই coupon ব্যবহার করা সব order বের করো
    const orders = await Order.find({
      "appliedCuppon.cupponId": cuppon._id,
    })
      .populate("user", "username email")
      .select("orderId totalPrice appliedCuppon createdAt")
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.appliedCuppon?.discountAmount || 0),
      0,
    );

    res.json({
      cuppon: {
        code: cuppon.code,
        usageCount: cuppon.usageCount,
        usageLimit: cuppon.usageLimit,
      },
      totalDiscountGiven: Number(totalRevenue.toFixed(2)),
      ordersCount: orders.length,
      recentOrders: orders.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createCuppon,
  getAllCuppons,
  getCupponById,
  updateCuppon,
  deleteCuppon,
  toggleCupponStatus,
  validateCuppon,
  getActiveCuppons,
  getCupponUsageStats,
};
