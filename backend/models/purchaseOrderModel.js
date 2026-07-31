import mongoose from "mongoose";
import shortid from "shortid";

const paymentHistorySchema = mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: "" },
});

const purchaseOrderSchema = mongoose.Schema(
  {
    poId: { type: String, default: shortid.generate, unique: true },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Supplier",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        unitCost: { type: Number, required: true },
        variantInfo: {
          hasVariants: { type: Boolean, default: false },
          colorName: { type: String, default: "" },
          sizeName: { type: String, default: "" },
          sku: { type: String, default: "" },
        },
        receivedQty: { type: Number, default: 0 },
      },
    ],

    totalCost: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: ["pending", "partially_received", "received", "cancelled"],
      default: "pending",
    },

    // Payment & Invoice Info
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paidAmount: { type: Number, default: 0 },
    payments: [paymentHistorySchema],

    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceDate: { type: Date },

    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;
