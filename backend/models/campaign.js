import mongoose from "mongoose";
const { Schema } = mongoose;

/* ======================================================
   1. CAMPAIGN MODEL — campaign এর মূল ডেটা স্ট্রাকচার
====================================================== */
const campaignSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
      default: "Shop Now",
    },
    description: {
      type: String,
      trim: true,
    },
    bannerImage: {
      type: String, // Cloudinary URL
    },

    // ---- STATIC ENUM: Campaign Type ----
    type: {
      type: String,
      enum: ["flash_sale", "seasonal", "clearance", "category_sale"],
      required: true,
    },

    // ---- STATIC ENUM: Discount Type ----
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // ---- STATIC ENUM: Scope ----
    scope: {
      type: String,
      enum: ["all", "category", "product"],
      required: true,
      default: "all",
    },

    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    excludedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    priority: {
      type: Number,
      default: 0,
    },
    isStackable: {
      type: Boolean,
      default: false,
    },

    // ---- STATIC ENUM: Status ----
    status: {
      type: String,
      enum: ["upcoming", "active", "expired", "disabled"],
      default: "upcoming",
    },

    usageLimit: {
      type: Number,
      default: null,
    },
    usagePerUser: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

campaignSchema.index({ status: 1, startDate: 1, endDate: 1 });
campaignSchema.index({ scope: 1 });
campaignSchema.index({ applicableProducts: 1 });
campaignSchema.index({ applicableCategories: 1 });

campaignSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    return next(new Error("endDate অবশ্যই startDate এর পরে হতে হবে"));
  }
  next();
});

const Campaign = mongoose.model("Campaign", campaignSchema);

/* ======================================================
   2. CAMPAIGN USAGE MODEL — কোন user কবে কোন campaign
   ব্যবহার করেছে তার log রাখে (usageLimit/usagePerUser
   enforce করার জন্য দরকার)
====================================================== */
const campaignUsageSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

campaignUsageSchema.index({ campaignId: 1, userId: 1 });

const CampaignUsage = mongoose.model("CampaignUsage", campaignUsageSchema);

/* ======================================================
   3. PRICING SERVICE — discount resolve ও calculate
   করার আসল business logic
====================================================== */

// একটা product এর জন্য বর্তমানে active ও eligible সব campaign খুঁজে বের করে
async function resolveApplicableCampaigns(product) {
  const now = new Date();

  const activeCampaigns = await Campaign.find({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  const productCategoryId = product.category?._id
    ? product.category._id.toString()
    : product.category?.toString();

  const eligible = activeCampaigns.filter((camp) => {
    if (camp.scope === "all") return true;

    if (camp.scope === "product") {
      return camp.applicableProducts.some(
        (id) => id.toString() === product._id.toString(),
      );
    }

    if (camp.scope === "category") {
      const inCategory = camp.applicableCategories.some(
        (id) => id.toString() === productCategoryId,
      );
      const isExcluded = camp.excludedProducts.some(
        (id) => id.toString() === product._id.toString(),
      );
      return inCategory && !isExcluded;
    }

    return false;
  });

  return eligible;
}

// একাধিক eligible campaign থাকলে conflict resolve করে winner(s) বের করে
function resolveConflict(eligibleCampaigns) {
  if (!eligibleCampaigns || eligibleCampaigns.length === 0) return [];
  if (eligibleCampaigns.length === 1) return [eligibleCampaigns[0]];

  const stackable = eligibleCampaigns.filter((c) => c.isStackable);
  const nonStackable = eligibleCampaigns.filter((c) => !c.isStackable);

  const scopeWeight = { product: 3, category: 2, all: 1 };

  if (nonStackable.length > 0) {
    nonStackable.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return scopeWeight[b.scope] - scopeWeight[a.scope];
    });
    return [nonStackable[0]];
  }

  return stackable;
}

// চূড়ান্ত discounted price বের করে
async function calculateDiscountedPrice(product, basePrice = null) {
  const eligible = await resolveApplicableCampaigns(product);
  const winning = resolveConflict(eligible);

  const startPrice = basePrice !== null ? basePrice : product.price;

  if (winning.length === 0) {
    return {
      originalPrice: startPrice,
      finalPrice: startPrice,
      appliedCampaigns: [],
    };
  }

  let finalPrice = startPrice;
  const appliedCampaigns = [];

  for (const camp of winning) {
    let discountAmt =
      camp.discountType === "percentage"
        ? (finalPrice * camp.discountValue) / 100
        : camp.discountValue;

    if (camp.maxDiscountAmount) {
      discountAmt = Math.min(discountAmt, camp.maxDiscountAmount);
    }

    finalPrice -= discountAmt;

    appliedCampaigns.push({
      campaignId: camp._id,
      title: camp.title,
      type: camp.type,
      discountType: camp.discountType,
      discountValue: camp.discountValue, // 🆕 যোগ করা হলো
      maxDiscountAmount: camp.maxDiscountAmount, // 🆕 যোগ করা হলো
      discountAmount: Math.round(discountAmt * 100) / 100,
    });
  }

  finalPrice = Math.max(Math.round(finalPrice * 100) / 100, 0);

  return {
    originalPrice: startPrice,
    finalPrice,
    appliedCampaigns,
  };
}

// Checkout এর সময় চূড়ান্ত safeguard হিসেবে campaign eligibility validate করে
async function validateCampaignEligibility(campaignId, userId, cartTotal) {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new Error("Campaign খুঁজে পাওয়া যায়নি");
  }
  if (campaign.status !== "active") {
    throw new Error("এই Campaign আর active নেই");
  }

  const now = new Date();
  if (now < campaign.startDate || now > campaign.endDate) {
    throw new Error("Campaign এর সময়সীমা পার হয়ে গেছে");
  }

  if (
    campaign.usageLimit !== null &&
    campaign.usedCount >= campaign.usageLimit
  ) {
    throw new Error("Campaign এর ব্যবহারের সীমা শেষ হয়ে গেছে");
  }

  if (cartTotal < campaign.minPurchaseAmount) {
    throw new Error(
      `Minimum purchase amount ৳${campaign.minPurchaseAmount} পূরণ হয়নি`,
    );
  }

  const userUsageCount = await CampaignUsage.countDocuments({
    campaignId,
    userId,
  });

  if (userUsageCount >= campaign.usagePerUser) {
    throw new Error("আপনি এই Campaign আর ব্যবহার করতে পারবেন না");
  }

  return campaign;
}

// Order confirm হওয়ার পর usage record ও usedCount update করার জন্য
async function recordCampaignUsage({
  campaignId,
  userId,
  orderId,
  discountAmount,
}) {
  await CampaignUsage.create({ campaignId, userId, orderId, discountAmount });
  await Campaign.findByIdAndUpdate(campaignId, { $inc: { usedCount: 1 } });
}

/* ======================================================
   EXPORTS — models ও service function গুলো একসাথে বের হচ্ছে
====================================================== */
export {
  Campaign,
  CampaignUsage,
  resolveApplicableCampaigns,
  resolveConflict,
  calculateDiscountedPrice,
  validateCampaignEligibility,
  recordCampaignUsage,
};
