import mongoose from "mongoose";

const shippingSchema = mongoose.Schema(
  {
    zoneName: { type: String, required: true, unique: true, trim: true },
    divisions: [{ type: String, trim: true, uppercase: true }],
    districts: [{ type: String, trim: true, uppercase: true }],
    thanas: [{ type: String, trim: true, lowercase: true }],

    baseCost: { type: Number, required: true, default: 0 },
    baseWeightKg: { type: Number, default: 1 },
    extraWeightCostPerKg: { type: Number, default: 0 },
    freeShippingMinOrder: { type: Number, default: null },
    estimatedDays: { type: String, default: "3-5 Days" },
    isActive: { type: Boolean, default: true },

    // Category & Product Restrictions (কুপনের মতোই সিস্টেম)
    applicableCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    excludedCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    excludedProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
  },
  { timestamps: true },
);

const Shipping = mongoose.model("Shipping", shippingSchema);
export default Shipping;
