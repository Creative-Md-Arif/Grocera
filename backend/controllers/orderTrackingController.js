import Order from "../models/orderModel.js";
import OrderTracking from "../models/orderTrackingModel.js";


const trackOrderPublic = async (req, res) => {
  try {
    const { orderId, email } = req.query;

    if (!orderId || !email) {
      return res.status(400).json({
        message: "Order ID and Email are required for tracking.",
      });
    }

    // ইউজারের ইমেইল ম্যাচ করার জন্য User পপুলেট করতে হবে (কারণ shippingAddress এ ইমেইল নেই)
    const order = await Order.findOne({ orderId })
      .populate("user", "email username")
      .select("-paymentResult -manualPaymentDetails -paymentVerifiedBy"); // সেনসিটিভ ডেটা হাইড করা হলো

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // ইমেইল ভেরিফিকেশন (Case-insensitive)
    if (order.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({
        message: "Unauthorized. Email does not match with this order.",
      });
    }

    // ট্র্যাকিং লগ বের করা
    let trackingHistory = await OrderTracking.findOne({ orderId }).select(
      "events",
    );

    res.json({
      orderId: order.orderId,
      currentStatus: order.isDelivered,
      paymentStatus: order.paymentStatus,
      orderedAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      trackingHistory: trackingHistory ? trackingHistory.events : [],
      // ইউজারকে শুধু দরকারি অর্ডার আইটেম দেখাবো
      items: order.orderItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        variant: item.variantInfo?.hasVariants
          ? `${item.variantInfo.colorName} / ${item.variantInfo.sizeName}`
          : "Default",
      })),
    });
  } catch (error) {
    console.error("Track Order Error:", error.message);
    res.status(500).json({ message: "Server error while tracking order." });
  }
};

// ✅ ২. অ্যাডমিন / কুরিয়ার API থেকে ট্র্যাকিং ইভেন্ট যোগ করা (Webhook Ready)
const addTrackingEvent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, message, location, courierName, trackingId } = req.body;

    // অর্ডার আপডেট করা
    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        isDelivered: status,
        deliveredAt: status === "Delivered" ? new Date() : undefined,
      },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // ট্র্যাকিং লগে নতুন ইভেন্ট পুশ করা (Upsert লজিক)
    const updatedTracking = await OrderTracking.findOneAndUpdate(
      { orderId },
      {
        // ✅ নতুন ডকুমেন্ট তৈরি হলে শুধুমাত্র এই দুটো ফিল্ড সেট হবে
        $setOnInsert: {
          order: order._id,
          orderId: orderId,
        },
        $push: {
          events: {
            status,
            message: message || `Order status updated to ${status}`,
            location: location || "",
            courierName: courierName || "",
            trackingId: trackingId || "",
          },
        },
      },
      { new: true, upsert: true }, // setDefaultsOnInsert বাদ দেওয়া হয়েছে
    );

    res.json({
      message: "Tracking event added successfully",
      tracking: updatedTracking,
    });
  } catch (error) {
    console.error("Add Tracking Event Error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ✅ ৩. নির্দিষ্ট অর্ডারের ট্র্যাকিং হিস্ট্রি দেখা (Admin এর জন্য)
const getTrackingHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    const tracking = await OrderTracking.findOne({ orderId });

    res.json(tracking || { orderId, events: [] });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

export { trackOrderPublic, addTrackingEvent, getTrackingHistory };
