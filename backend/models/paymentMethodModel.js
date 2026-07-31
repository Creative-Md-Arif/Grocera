import mongoose from "mongoose";

const paymentMethodSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["bKash", "Nagad", "Rocket", "Bank", "SSLCommerz" ],
      unique: true, // প্রতিটি টাইপে একটি করে এন্ট্রি
    },
    number: {
      type: String,
      required: false,
      trim: true,
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Personal", "Agent", "Merchant", "Gateway"],
      default: "Personal",
    },
    accountName: {
      type: String,
      required: false,
      trim: true,
    },
    instructions: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
export default PaymentMethod;
