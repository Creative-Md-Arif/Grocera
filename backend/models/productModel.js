import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;
import slugify from "slugify";

// Review Schema
// Review Schema
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
 
    isFeatured: { type: Boolean, default: false },
    reply: {
      text: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);



// Variant Schema - For Color/Size combinations
const variantSchema = mongoose.Schema({
  color: {
    name: { type: String, required: true },
    hexCode: { type: String, default: "" },
    image: { type: String, required: true },
    images: [{ type: String }],
  },
  sizes: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
      countInStock: { type: Number, required: true, default: 0 },
      sku: { type: String, default: "" },
      isAvailable: { type: Boolean, default: true },
    },
  ],
  isActive: { type: Boolean, default: true },
});

// Product Schema
const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true },
    images: [{ type: String, required: true }],
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: { type: ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    keyFeatures: [{ type: String }],
    specifications: [
      {
        label: String,
        value: String,
      },
    ],
    descriptionImages: [{ type: String }],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    discountedAmount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    warranty: { type: String, default: "" },
    weight: { type: Number, default: 0.5 },

    // ====== Product Wise Shipping Details ======
    shippingDetails: {
      isFreeShipping: { type: Boolean, default: false },
      isIndividualShipping: { type: Boolean, default: false },
      individualShippingCost: { type: Number, default: 0 },
      extraShippingCost: { type: Number, default: 0 },
    },

    hasVariants: { type: Boolean, default: false },
    variants: [variantSchema],

    defaultColorIndex: { type: Number, default: 0 },
    defaultSizeIndex: { type: Number, default: 0 },

    salesCount: { type: Number, default: 0 },
    showOnHomepage: { type: Boolean, default: false },
    homepageOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Pre-save hook for Auto-calculations
productSchema.pre("save", function (next) {
  // 1. Slug Generate
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // 2. Discount Auto-Calculation
  const price = Number(this.price) || 0;
  const discountPercentage = Number(this.discountPercentage) || 0;
  const discountedAmount = Number(this.discountedAmount) || 0;

  if (discountPercentage > 0) {
    // If percentage is given, calculate amount
    this.discountedAmount = Math.round((price * discountPercentage) / 100);
  } else if (discountedAmount > 0 && price > 0) {
    // If amount is given directly, calculate percentage
    this.discountPercentage = Math.round((discountedAmount / price) * 100);
  } else {
    // If no discount, reset both
    this.discountedAmount = 0;
    this.discountPercentage = 0;
  }

  // 3. Variant Stock Calculation & Quantity Sync
  if (this.hasVariants && this.variants && this.variants.length > 0) {
    let totalStock = 0;
    this.variants.forEach((variant) => {
      if (variant.sizes && variant.sizes.length > 0) {
        variant.sizes.forEach((size) => {
          totalStock += size.countInStock || 0;
        });
      }
    });
    this.countInStock = totalStock;
    this.quantity = totalStock; // Sync quantity with total variant stock
  } else {
    // If no variants, countInStock should equal quantity
    this.countInStock = Number(this.quantity) || 0;
  }

  next();
});

// Helper Methods
productSchema.methods.getVariantPrice = function (colorIndex, sizeIndex) {
  if (!this.hasVariants || !this.variants[colorIndex]) {
    return this.price;
  }
  const variant = this.variants[colorIndex];
  if (!variant.sizes || !variant.sizes[sizeIndex]) {
    return this.price;
  }
  return variant.sizes[sizeIndex].price;
};

productSchema.methods.getVariantStock = function (colorIndex, sizeIndex) {
  if (!this.hasVariants || !this.variants[colorIndex]) {
    return this.countInStock;
  }
  const variant = this.variants[colorIndex];
  if (!variant.sizes || !variant.sizes[sizeIndex]) {
    return 0;
  }
  return variant.sizes[sizeIndex].countInStock;
};

productSchema.methods.getColorImages = function (colorIndex) {
  if (!this.hasVariants || !this.variants[colorIndex]) {
    return this.images;
  }
  const variant = this.variants[colorIndex];
  return variant.color.images && variant.color.images.length > 0
    ? variant.color.images
    : [variant.color.image];
};

productSchema.methods.getEffectivePrice = function (
  colorIndex = 0,
  sizeIndex = 0,
) {
  let basePrice = this.price;

  // If product has variants, get the variant price
  if (
    this.hasVariants &&
    this.variants[colorIndex] &&
    this.variants[colorIndex].sizes[sizeIndex]
  ) {
    basePrice = this.variants[colorIndex].sizes[sizeIndex].price;
  }

  // Apply discount
  if (this.discountPercentage > 0) {
    return basePrice - (basePrice * this.discountPercentage) / 100;
  }
  return basePrice;
};

productSchema.methods.getStockStatus = function (
  colorIndex = 0,
  sizeIndex = 0,
  lowStockThreshold = 5,
) {
  const stock = this.getVariantStock(colorIndex, sizeIndex);
  if (stock <= 0) return "out_of_stock";
  if (stock <= lowStockThreshold) return "low_stock";
  return "in_stock";
};

productSchema.methods.getColorAvailability = function () {
  if (!this.hasVariants) return {};
  const availability = {};
  this.variants.forEach((variant, idx) => {
    availability[idx] = variant.sizes?.some((s) => s.countInStock > 0) || false;
  });
  return availability;
};

productSchema.index({
  name: "text",
  brand: "text",
  description: "text",
});

const Product = mongoose.model("Product", productSchema);

export default Product;
