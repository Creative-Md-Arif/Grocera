import { Campaign, calculateDiscountedPrice } from "../models/campaign.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

// ---------------- Helper: slug বানানো ----------------
const generateSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ---------------- CREATE ----------------
const createCampaign = async (req, res) => {
  try {
    const {
      title,
      subtitle, 
      buttonText, 
      description,
      bannerImage,
      type,
      discountType,
      discountValue,
      scope,
      applicableCategories,
      applicableProducts,
      excludedProducts,
      maxDiscountAmount,
      minPurchaseAmount,
      startDate,
      endDate,
      priority,
      isStackable,
      usageLimit,
      usagePerUser,
    } = req.body;

    if (
      scope === "category" &&
      (!applicableCategories || applicableCategories.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "scope 'category' হলে applicableCategories দিতে হবে",
      });
    }
    if (
      scope === "product" &&
      (!applicableProducts || applicableProducts.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "scope 'product' হলে applicableProducts দিতে হবে",
      });
    }

    if (scope === "category") {
      const count = await Category.countDocuments({
        _id: { $in: applicableCategories },
      });
      if (count !== applicableCategories.length) {
        return res.status(400).json({
          success: false,
          message: "কিছু category খুঁজে পাওয়া যায়নি",
        });
      }
    }
    if (scope === "product") {
      const count = await Product.countDocuments({
        _id: { $in: applicableProducts },
      });
      if (count !== applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: "কিছু product খুঁজে পাওয়া যায়নি",
        });
      }
    }

    const slug = generateSlug(title);
    const existingSlug = await Campaign.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const now = new Date();
    const status = new Date(startDate) > now ? "upcoming" : "active";

    const campaign = await Campaign.create({
      title,
      subtitle, 
      buttonText,
      slug: finalSlug,
      description,
      bannerImage,
      type,
      discountType,
      discountValue,
      scope,
      applicableCategories: scope === "category" ? applicableCategories : [],
      applicableProducts: scope === "product" ? applicableProducts : [],
      excludedProducts: excludedProducts || [],
      maxDiscountAmount,
      minPurchaseAmount,
      startDate,
      endDate,
      priority,
      isStackable,
      usageLimit,
      usagePerUser,
      status,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- UPDATE ----------------
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.title) {
      const slug = generateSlug(updates.title);
      // চেক করুন এই স্ল্যাগটি অন্য কোনো ক্যাম্পেইনে ব্যবহার হয়েছে কিনা
      const existingSlug = await Campaign.findOne({ slug, _id: { $ne: id } });
      updates.slug = existingSlug ? `${slug}-${Date.now()}` : slug;
    }

    const campaign = await Campaign.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign পাওয়া যায়নি" });
    }

    return res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- DELETE ----------------
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign পাওয়া যায়নি" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Campaign মুছে ফেলা হয়েছে" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- TOGGLE STATUS ----------------
const toggleCampaignStatus = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign পাওয়া যায়নি" });
    }

    campaign.status = campaign.status === "disabled" ? "active" : "disabled";
    await campaign.save();

    return res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET ALL (admin) ----------------
const getAllCampaigns = async (req, res) => {
  try {
    const { status, type, scope, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (scope) filter.scope = scope;

    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Campaign.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: campaigns,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET ACTIVE (public) ----------------
const getActiveCampaigns = async (req, res) => {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ priority: -1 });

    return res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET BY ID ----------------
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("applicableCategories", "name slug")
      .populate("applicableProducts", "name price images");

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign পাওয়া যায়নি" });
    }

    return res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET ELIGIBLE PRODUCTS ----------------
const getCampaignProducts = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign পাওয়া যায়নি" });
    }

    let productQuery = {};
    if (campaign.scope === "product") {
      productQuery._id = { $in: campaign.applicableProducts };
    } else if (campaign.scope === "category") {
      productQuery.category = { $in: campaign.applicableCategories };
      productQuery._id = { $nin: campaign.excludedProducts };
    }

   const products = await Product.find(productQuery)
     .populate("category", "_id")
     .limit(100);

    const productsWithPrice = await Promise.all(
      products.map(async (product) => {
        const priceInfo = await calculateDiscountedPrice(product);
        return {
          _id: product._id,
          name: product.name,
          images: product.images,
          ...priceInfo,
        };
      }),
    );

    return res.status(200).json({ success: true, data: productsWithPrice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
  getAllCampaigns,
  getActiveCampaigns,
  getCampaignById,
  getCampaignProducts,
};
