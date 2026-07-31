import mongoose from "mongoose";
import shortid from "shortid";

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      default: shortid.generate,
      unique: true,
    },
   
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
        discountPercentage: { type: Number, default: 0 },
        offer: { type: String, default: "" },
        weight: { type: Number, default: 0 },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        variantInfo: {
          hasVariants: { type: Boolean, default: false },
          colorIndex: { type: Number, default: null },
          colorName: { type: String, default: "" },
          colorHex: { type: String, default: "" },
          sizeIndex: { type: Number, default: null },
          sizeName: { type: String, default: "" },
          variantPrice: { type: Number, default: null },
          sku: { type: String, default: "" },
        },
      },
    ],

    shippingAddress: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      division: { type: String },
      district: { type: String },
      thana: { type: String },
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Cash on Delivery",
        "bKash",
        "Nagad",
        "Rocket",
        "Bank",
        "SSLCommerz",
      ],
    },

    manualPaymentDetails: {
      transactionId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true,
      },
      senderNumber: { type: String, trim: true },
      paymentScreenshot: { type: String },
      selectedPaymentMethod: {
        type: String,
        enum: ["bKash", "Nagad", "Rocket", "Bank"],
      },
      sentAmount: { type: Number },
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
      val_id: { type: String }, // ✅ SSLCommerz Validation ID (IPN এবং Refund এর জন্য দরকার)
      bank_tran_id: { type: String }, // ✅ Bank Transaction ID
      card_type: { type: String }, // ✅ VISA, MASTER, DBBL-VISA, etc.
      card_no: { type: String }, // ✅ Masked Card Number (e.g., 411111******1111)
      currency_type: { type: String }, // ✅ BDT
      gateway_type: { type: String },
    },

    paymentStatus: {
      type: String,
      enum: [
        "paid",
        "due",
        "pending",
        "failed",
        "awaiting_verification",
        "refunded",
      ],
      default: function () {
        if (["bKash", "Nagad", "Rocket", "Bank"].includes(this.paymentMethod)) {
          return "awaiting_verification";
        }
        if (this.paymentMethod === "SSLCommerz") {
          return "pending";
        }
        return this.paymentMethod === "Cash on Delivery" ? "due" : "pending";
      },
    },

    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    paymentVerifiedAt: { type: Date },
    paymentVerificationNotes: { type: String },

    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    totalSavings: {
      type: Number,
      default: 0.0,
    },

    // ====== NEW: Coupon Fields ======
    appliedCuppon: {
      cupponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cuppon",
        default: null,
      },
      code: { type: String, default: null },
      discountType: { type: String, default: null },
      discountValue: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: String,
      enum: [
        "Order Placed",
        "Confirmed",
        "Processing",
        "Packed",
        "Picked Up by Courier",
        "In Transit",
        "At Local Hub",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Order Placed",
    },

    hasActiveReturn: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    courierName: {
      type: String,
      default: "",
    },
    courierTrackingId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index(
  { "manualPaymentDetails.transactionId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "manualPaymentDetails.transactionId": { $exists: true },
    },
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
