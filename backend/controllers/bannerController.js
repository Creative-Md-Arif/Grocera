import asyncHandler from "../middlewares/asyncHandler.js";
import Banner from "../models/bannerModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

// ==================== CREATE ====================

// নতুন ব্যানার তৈরি
const createBanner = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      type,
      headline,
      subHeadline,
      image,
      mobileImage,
      buttonText,
      buttonType,
      link,
      product,
      category,
      position,
      backgroundColor,
      textColor,
      buttonColor,
      buttonTextColor,
      startDate,
      endDate,
      isActive,
      popupSettings,
      offerSettings,
      displayPages,
      displayOn,
      metaData,
    } = req.body;


    if (!name || !type || !image) {
      return res.status(400).json({
        error: "Name, type, and image are required",
      });
    }


    const validTypes = [
      "hero",
      "category",
      "promotional",
      "sidebar",
      "popup",
      "footer",
      "top-bar",
      "middle",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid banner type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // ✅ ভ্যালিড buttonType চেক
    const validButtonTypes = [
      "default",
      "weekend-deal",
      "flash-sale",
      "big-sale",
      "limited-offer",
      "special-offer",
      "clearance",
      "new-arrival",
      "best-seller",
      "trending-now",
      "hot-deal",
      "mega-sale",
      "seasonal-offer",
      "exclusive",
      "last-chance",
      "doorbuster",
      "early-bird",
      "member-exclusive",
      "bundle-deal",
      "buy-one-get-one",
    ];

    if (buttonType && !validButtonTypes.includes(buttonType)) {
      return res.status(400).json({
        error: `Invalid button type. Must be one of: ${validButtonTypes.join(", ")}`,
      });
    }

    const safeProduct = product && product !== "" ? product : null;
    if (safeProduct) {
      const productExists = await Product.findById(safeProduct);
      if (!productExists) {
        return res.status(404).json({ error: "Product not found" });
      }
    }

    const safeCategory = category && category !== "" ? category : null;
    if (safeCategory) {
      const categoryExists = await Category.findById(safeCategory);
      if (!categoryExists) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    const banner = new Banner({
      name,
      type,
      headline,
      subHeadline,
      image,
      mobileImage,
      buttonText,
      buttonType: buttonType || "default",
      link,
      product: safeProduct,
      category: safeCategory,
      position: position || 0,
      backgroundColor: backgroundColor || "#ffffff",
      textColor: textColor || "#000000",
      buttonColor: buttonColor || "#ff6b6b",
      buttonTextColor: buttonTextColor || "#ffffff",
      startDate: startDate || Date.now(),
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      popupSettings,
      offerSettings,
      displayPages: displayPages || ["all"],
      displayOn: displayOn || { desktop: true, mobile: true, tablet: true },
      metaData,
    });

    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    console.error("Banner Creation Error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== READ ====================

// সব ব্যানার পাওয়া (অ্যাডমিনের জন্য)
const getAllBanners = asyncHandler(async (req, res) => {
  try {
    const { type, isActive } = req.query;
    let query = {};

    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const banners = await Banner.find(query)
      .populate("product", "name slug price images")
      .populate("category", "name slug")
      .sort({ position: 1, createdAt: -1 });

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// নির্দিষ্ট ব্যানার পাওয়া
const getBannerById = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate("product", "name slug price images")
      .populate("category", "name slug");

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.json(banner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// সক্রিয় ব্যানার পাওয়া (ফ্রন্টএন্ডের জন্য)
const getActiveBanners = asyncHandler(async (req, res) => {
  try {
    const { type, page, device } = req.query;
    const currentDate = new Date();

    let query = {
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    };

    if (type) query.type = type;
    if (page) query.displayPages = { $in: [page, "all"] };
    if (device) {
      query[`displayOn.${device}`] = true;
    }

    const banners = await Banner.find(query)
      .populate("product", "name slug price images discountPercentage")
      .populate("category", "name slug")
      .sort({ position: 1, createdAt: -1 });

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// হিরো ব্যানার পাওয়া
const getHeroBanners = asyncHandler(async (req, res) => {
  try {
    const { device } = req.query;
    const currentDate = new Date();

    let query = {
      type: "hero",
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    };

    if (device) {
      query[`displayOn.${device}`] = true;
    }

    const banners = await Banner.find(query)
      .populate("product", "name slug price images discountPercentage")
      .populate("category", "name slug")
      .sort({ position: 1 });

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ক্যাটাগরি ব্যানার পাওয়া
const getCategoryBanners = asyncHandler(async (req, res) => {
  try {
    const { device } = req.query;
    const currentDate = new Date();

    let query = {
      type: "category",
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    };

    if (device) {
      query[`displayOn.${device}`] = true;
    }

    const banners = await Banner.find(query)
      .populate("category", "name slug")
      .sort({ position: 1 });

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// প্রমোশনাল ব্যানার পাওয়া
const getPromotionalBanners = asyncHandler(async (req, res) => {
  try {
    const { device } = req.query;
    const currentDate = new Date();

    let query = {
      type: "promotional",
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    };

    if (device) {
      query[`displayOn.${device}`] = true;
    }

    const banners = await Banner.find(query)
      .populate("product", "name slug price images")
      .sort({ position: 1 });

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// পপ-আপ ব্যানার পাওয়া
const getPopupBanner = asyncHandler(async (req, res) => {
  try {
    const { device } = req.query;
    const currentDate = new Date();

    let query = {
      type: "popup",
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    };

    if (device) {
      query[`displayOn.${device}`] = true;
    }

    const banner = await Banner.findOne(query).sort({
      position: 1,
      createdAt: -1,
    });

    if (banner) {
      // ইমপ্রেশন কাউন্ট বাড়ানো
      banner.impressions += 1;
      await banner.save();
    }

    res.json(banner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// টপ বার ব্যানার পাওয়া
const getTopBarBanner = asyncHandler(async (req, res) => {
  try {
    const currentDate = new Date();

    const banner = await Banner.findOne({
      type: "top-bar",
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    }).sort({ position: 1, createdAt: -1 });

    res.json(banner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ফুটার ব্যানার পাওয়া
const getFooterBanners = asyncHandler(async (req, res) => {
  try {
    const { device } = req.query;
    const currentDate = new Date();

    let query = {
      type: "footer",
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    };

    if (device) {
      query[`displayOn.${device}`] = true;
    }

    const banners = await Banner.find(query).sort({ position: 1 });

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// সাইডবার ব্যানার পাওয়া
const getSidebarBanners = asyncHandler(async (req, res) => {
  try {
    const { device } = req.query;
    const currentDate = new Date();

    let query = {
      type: "sidebar",
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    };

    if (device) {
      query[`displayOn.${device}`] = true;
    }

    const banners = await Banner.find(query).sort({ position: 1 });

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ==================== UPDATE ====================

// ব্যানার আপডেট
const updateBanner = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    const updateFields = { ...req.body };

    if (updateFields.buttonType) {
      const validButtonTypes = [
        "default",
        "weekend-deal",
        "flash-sale",
        "big-sale",
        "limited-offer",
        "special-offer",
        "clearance",
        "new-arrival",
        "best-seller",
        "trending-now",
        "hot-deal",
        "mega-sale",
        "seasonal-offer",
        "exclusive",
        "last-chance",
        "doorbuster",
        "early-bird",
        "member-exclusive",
        "bundle-deal",
        "buy-one-get-one",
      ];

      if (!validButtonTypes.includes(updateFields.buttonType)) {
        return res.status(400).json({
          error: `Invalid button type. Must be one of: ${validButtonTypes.join(", ")}`,
        });
      }
    }

    if (updateFields.product === "" || updateFields.product === undefined) {
      updateFields.product = null;
    }
    if (updateFields.category === "" || updateFields.category === undefined) {
      updateFields.category = null;
    }

    if (updateFields.product) {
      const productExists = await Product.findById(updateFields.product);
      if (!productExists) {
        return res.status(404).json({ error: "Product not found" });
      }
    }

    if (updateFields.category) {
      const categoryExists = await Category.findById(updateFields.category);
      if (!categoryExists) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true },
    )
      .populate("product", "name slug price images")
      .populate("category", "name slug");

    res.json(updatedBanner);
  } catch (error) {
    console.error("Update Banner Error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ব্যানার স্ট্যাটাস টগল
const toggleBannerStatus = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      banner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ব্যানার পজিশন আপডেট
const updateBannerPosition = asyncHandler(async (req, res) => {
  try {
    const { position } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    banner.position = position;
    await banner.save();

    res.json(banner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ক্লিক কাউন্ট বাড়ানো
const incrementBannerClicks = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    banner.clicks += 1;
    await banner.save();

    res.json({ message: "Click counted", clicks: banner.clicks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ==================== DELETE ====================

// ব্যানার ডিলিট
const deleteBanner = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// একাধিক ব্যানার ডিলিট
const deleteMultipleBanners = asyncHandler(async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Please provide banner IDs" });
    }

    await Banner.deleteMany({ _id: { $in: ids } });

    res.json({ message: `${ids.length} banners deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ==================== STATISTICS ====================

// ব্যানার স্ট্যাটিস্টিক্স
const getBannerStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Banner.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          totalClicks: { $sum: "$clicks" },
          totalImpressions: { $sum: "$impressions" },
        },
      },
    ]);

    const totalBanners = await Banner.countDocuments();
    const activeBanners = await Banner.countDocuments({ isActive: true });

    res.json({
      totalBanners,
      activeBanners,
      byType: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

export {
  createBanner,
  getAllBanners,
  getBannerById,
  getActiveBanners,
  getHeroBanners,
  getCategoryBanners,
  getPromotionalBanners,
  getPopupBanner,
  getTopBarBanner,
  getFooterBanners,
  getSidebarBanners,
  updateBanner,
  toggleBannerStatus,
  updateBannerPosition,
  incrementBannerClicks,
  deleteBanner,
  deleteMultipleBanners,
  getBannerStats,
};
