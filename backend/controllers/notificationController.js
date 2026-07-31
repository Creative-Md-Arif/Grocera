import asyncHandler from "../middlewares/asyncHandler.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import { io, onlineUsers } from "../index.js";

// @desc    সব নোটিফিকেশন গেট করা (Pagination সহ)
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { user: req.user._id };

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    data: notifications,
    stats: {
      total,
      unread: unreadCount,
      pages: Math.ceil(total / limit),
      currentPage: page,
    },
  });
});



const markAsRead = asyncHandler(async (req, res) => {
  // findOneAndUpdate ব্যবহার করলে একবারে আপডেট এবং ডাটা পাওয়া যায়
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    { 
      $set: { isRead: true, readAt: new Date() } 
    },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  // যদি আপনার মডেলে কাস্টম মেথড থাকে তবে সেটি এভাবে চেক করে নিতে পারেন
  // তবে উপরের findOneAndUpdate সরাসরি ডাটাবেসে কাজ করবে যা দ্রুততর।

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});


const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    modifiedCount: result.modifiedCount, 
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.status(200).json({
    success: true,
    message: "Notification removed",
  });
});



export const createAndSendNotification = async (req, data) => {
  const { userId, title, message, type, priority, actionUrl, sendEmailFlag } = data;
  const io = req.app.get("io");
  const onlineUsers = req.app.get("onlineUsers");

  try {
    // ১. ডাটাবেসে নোটিফিকেশন সেভ
    const notification = await Notification.createNotification(
      userId,
      title,
      message,
      {
        type: type || "info",
        priority: priority || "medium",
        actionUrl: actionUrl || "", // ফ্রন্টএন্ড লিঙ্কের জন্য
      }
    );

    // ২. সকেট দিয়ে রিয়েল-টাইম পুশ
    const socketId = onlineUsers.get(userId.toString());
    if (socketId && io) {
      io.to(socketId).emit("new-notification", notification);
      console.log(`📡 Socket sent to user: ${userId}`);
    }

    // ৩. ইমেইল পাঠানো (Brevo/SendGrid)
    if (sendEmailFlag) {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: title,
          html: notification.generateEmailHTML(user),
        });
        notification.isEmailSent = true;
        await notification.save();
      }
    }

    return notification;
  } catch (error) {
    console.error("❌ Notification creation failed:", error.message);
  }
};

// @desc    অ্যাডমিন সব ইউজারকে সিস্টেম নোটিফিকেশন পাঠাবে
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, type, priority } = req.body;

  const users = await User.find({}).select("_id");

  const notifications = users.map((user) => ({
    user: user._id,
    title,
    message,
    type: type || "system",
    priority: priority || "medium",
    source: "admin",
  }));

  await Notification.insertMany(notifications);

  // সব অনলাইনে থাকা ইউজারকে সকেট ব্রডকাস্ট
  io.emit("system-announcement", { title, message });

  res.status(201).json({
    success: true,
    message: `Broadcasted to ${users.length} users`,
  });
});

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
};
