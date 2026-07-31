import Order from "../models/orderModel.js";
import Return from "../models/returnModel.js";
import { createAndSendNotification } from "./notificationController.js";

const RETURN_WINDOW_DAYS = 7;

// --- ১. Customer: Return Request করা ---
const requestOrderReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, returnReason, returnDescription, returnImages } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized for this order" });
    }

    if (order.isDelivered !== "Delivered") {
      return res
        .status(400)
        .json({ error: "Only delivered orders can be returned" });
    }

    const daysSinceDelivery =
      (Date.now() - new Date(order.deliveredAt).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      return res
        .status(400)
        .json({
          error: `Return window of ${RETURN_WINDOW_DAYS} days has expired`,
        });
    }

    if (order.hasActiveReturn) {
      return res
        .status(400)
        .json({ error: "A return is already active for this order" });
    }

    if (!items || items.length === 0 || !returnReason) {
      return res
        .status(400)
        .json({ error: "Items and return reason are required" });
    }

    // items validate করা — order-এর মধ্যে সেই product/qty আছে কিনা
    const returnItems = items.map((reqItem) => {
      const orderItem = order.orderItems.find(
        (oi) => oi.product.toString() === reqItem.productId,
      );

      if (!orderItem) {
        throw new Error(
          `Product not found in this order: ${reqItem.productId}`,
        );
      }

      if (reqItem.qty > orderItem.qty) {
        throw new Error(`Return qty exceeds ordered qty for ${orderItem.name}`);
      }

      return {
        product: orderItem.product,
        name: orderItem.name,
        image: orderItem.image,
        qty: reqItem.qty,
        price: orderItem.price,
        variantInfo: {
          colorName: orderItem.variantInfo?.colorName || "",
          sizeName: orderItem.variantInfo?.sizeName || "",
          sku: orderItem.variantInfo?.sku || "",
        },
      };
    });

    const newReturn = await Return.create({
      order: order._id,
      orderId: order.orderId,
      user: req.user._id,
      items: returnItems,
      returnReason,
      returnDescription: returnDescription || "",
      returnImages: returnImages || [],
    });

    order.hasActiveReturn = true;
    await order.save();

    await createAndSendNotification(req, {
      userId: order.user,
      title: "Return Requested 📦",
      message: `A return request has been submitted for order #${order.orderId}.`,
      type: "order",
      actionUrl: `/order/${order.orderId}`,
      sendEmailFlag: true,
    });

    res.status(201).json(newReturn);
  } catch (error) {
    console.error("Request Return Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// --- ২. Admin: সব Return Request দেখা ---
const getReturnRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { returnStatus: status } : {};

    const returns = await Return.find(filter)
      .populate("user", "username email")
      .populate("order", "orderId totalPrice paymentMethod")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- ৩. Customer: নিজের Return গুলো দেখা ---
const getMyReturns = async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- ৪. Admin: Approve / Reject ---
const reviewReturnRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNotes } = req.body; // "approve" | "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const returnDoc = await Return.findById(id);

    if (!returnDoc) {
      return res.status(404).json({ error: "Return request not found" });
    }

    if (returnDoc.returnStatus !== "requested") {
      return res
        .status(400)
        .json({ error: "This return is not in a pending state" });
    }

    returnDoc.returnStatus = action === "approve" ? "approved" : "rejected";
    returnDoc.reviewedBy = req.user._id;
    returnDoc.reviewedAt = new Date();
    returnDoc.adminNotes = adminNotes || "";

    await returnDoc.save();

    // Reject হলে order-এর hasActiveReturn ফ্ল্যাগ খুলে দাও
    if (action === "reject") {
      await Order.findByIdAndUpdate(returnDoc.order, {
        hasActiveReturn: false,
      });
    }

    await createAndSendNotification(req, {
      userId: returnDoc.user,
      title: action === "approve" ? "Return Approved ✅" : "Return Rejected ❌",
      message:
        action === "approve"
          ? `Your return request for order #${returnDoc.orderId} has been approved.`
          : `Your return request for order #${returnDoc.orderId} was rejected. Reason: ${adminNotes || "N/A"}`,
      type: "order",
      actionUrl: `/order/${returnDoc.orderId}`,
      sendEmailFlag: true,
    });

    res.json(returnDoc);
  } catch (error) {
    console.error("Review Return Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --- ৫. Admin: Pickup সম্পন্ন হলে ---
const markReturnPickedUp = async (req, res) => {
  try {
    const returnDoc = await Return.findById(req.params.id);

    if (!returnDoc) {
      return res.status(404).json({ error: "Return request not found" });
    }

    if (returnDoc.returnStatus !== "approved") {
      return res
        .status(400)
        .json({ error: "Return must be approved before pickup" });
    }

    returnDoc.returnStatus = "picked_up";
    await returnDoc.save();

    res.json(returnDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- ৬. Admin: Refund প্রসেস করা ---
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundMethod, refundTransactionId } = req.body;

    const returnDoc = await Return.findById(id);

    if (!returnDoc) {
      return res.status(404).json({ error: "Return request not found" });
    }

    if (!["approved", "picked_up"].includes(returnDoc.returnStatus)) {
      return res
        .status(400)
        .json({
          error: "Return must be approved (or picked up) before refunding",
        });
    }

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({ error: "Valid refund amount required" });
    }

    returnDoc.returnStatus = "refunded";
    returnDoc.refundAmount = refundAmount;
    returnDoc.refundMethod = refundMethod || "";
    returnDoc.refundTransactionId = refundTransactionId || "";
    returnDoc.refundedAt = new Date();
    returnDoc.refundedBy = req.user._id;

    await returnDoc.save();

    // মূল order-এ reflect করা
    const order = await Order.findById(returnDoc.order);
    if (order) {
      order.paymentStatus = "refunded";
      order.hasActiveReturn = false;
      await order.save();
    }

    await createAndSendNotification(req, {
      userId: returnDoc.user,
      title: "Refund Processed 💰",
      message: `৳${refundAmount} has been refunded for order #${returnDoc.orderId}.`,
      type: "order",
      actionUrl: `/order/${returnDoc.orderId}`,
      sendEmailFlag: true,
    });

    res.json(returnDoc);
  } catch (error) {
    console.error("Process Refund Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export {
  requestOrderReturn,
  getReturnRequests,
  getMyReturns,
  reviewReturnRequest,
  markReturnPickedUp,
  processRefund,
};
