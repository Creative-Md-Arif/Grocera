import mongoose from "mongoose";

const returnSchema = mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    orderId: { type: String, required: true }, // quick reference, order.orderId এর কপি
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // ====== Return করা items ======
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        name: { type: String, required: true },
        image: { type: String },
        qty: { type: Number, required: true }, // কতটা return করা হচ্ছে
        price: { type: Number, required: true }, // per unit price (order থেকে কপি)
        variantInfo: {
          colorName: { type: String, default: "" },
          sizeName: { type: String, default: "" },
          sku: { type: String, default: "" },
        },
      },
    ],

    returnReason: { type: String, required: true },
    returnDescription: { type: String, default: "" },
    returnImages: [{ type: String }], // কাস্টমারের দেওয়া প্রুফ

    returnStatus: {
      type: String,
      enum: [
        "requested",
        "approved",
        "rejected",
        "picked_up",
        "refunded",
        "cancelled",
      ],
      default: "requested",
    },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    adminNotes: { type: String, default: "" },

    // ====== Refund তথ্য ======
    refundAmount: { type: Number, default: 0 },
    refundMethod: { type: String, default: "" },
    refundTransactionId: { type: String, default: "" },
    refundedAt: { type: Date },
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

returnSchema.index({ order: 1 });
returnSchema.index({ user: 1 });
returnSchema.index({ returnStatus: 1 });

const Return = mongoose.model("Return", returnSchema);
export default Return;
