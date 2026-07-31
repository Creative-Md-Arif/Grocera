import mongoose from "mongoose";

const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  // কুরিয়ার API ইন্টিগ্রেশনের জন্য
  courierName: {
    type: String,
    default: "",
  },
  trackingId: {
    type: String,
    default: "", // কুরিয়ারের ট্র্যাকিং আইডি (যেমন: Steadfast ট্র্যাকিং নম্বর)
  },
});

const orderTrackingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    events: [trackingEventSchema],
  },
  { timestamps: true },
);

const OrderTracking = mongoose.model("OrderTracking", orderTrackingSchema);
export default OrderTracking;
