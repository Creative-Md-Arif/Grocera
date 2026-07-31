import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "info",
        "success",
        "warning",
        "error",
        "system",
        "promotional",
        "security",
        "order",
        "message",
        "alert",
        "update",
        "reminder",
        "announcement",
      ],
      default: "info",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    isPushSent: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["user", "system", "admin", "transaction", "security"],
      default: "user",
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    actionLabel: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "bell",
    },
    source: {
      type: String,
      enum: ["system", "admin", "user", "automated"],
      default: "system",
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // অটোমেটিক ডিলিট হওয়ার জন্য TTL ইনডেক্স
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// --- Indexes ---
notificationSchema.index({ user: 1, createdAt: -1 });

// --- Virtual Fields ---

// সুন্দর ফরমেটে ডেট দেখানোর জন্য
notificationSchema.virtual("formattedDate").get(function () {
  return new Date(this.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// "2 minutes ago" বা "1 hour ago" দেখানোর জন্য
notificationSchema.virtual("timeAgo").get(function () {
  const seconds = Math.floor((new Date() - new Date(this.createdAt)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? "s" : ""} ago`;
  return `${Math.floor(seconds)} second${seconds > 1 ? "s" : ""} ago`;
});

// --- Middleware ---
notificationSchema.pre("save", function (next) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// --- Instance Methods ---

notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// SendGrid এর জন্য HTML জেনারেট করা
notificationSchema.methods.generateEmailHTML = function (user) {
  const colorMap = {
    info: "#3498db",
    success: "#2ecc71",
    warning: "#f39c12",
    error: "#e74c3c",
    urgent: "#e74c3c",
    system: "#9b59b6",
  };

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background: ${colorMap[this.type] || "#3498db"}; padding: 20px; color: white; text-align: center;">
        <h1 style="margin: 0;">${this.title}</h1>
      </div>
      <div style="padding: 30px; line-height: 1.6; color: #333;">
        <p>Hello ${user?.username || "User"},</p>
        <p>${this.message}</p>
        ${
          this.actionUrl
            ? `
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.actionUrl}" style="background: ${colorMap[this.type] || "#3498db"}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              ${this.actionLabel || "View Details"}
            </a>
          </div>
        `
            : ""
        }
      </div>
      <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        &copy; ${new Date().getFullYear()} ${process.env.APP_NAME || "Your Shop"}. All rights reserved.
      </div>
    </div>
  `;
};

// --- Static Methods ---

notificationSchema.statics.createNotification = async function (
  userId,
  title,
  message,
  options = {},
) {
  return await this.create({
    user: userId,
    title,
    message,
    ...options,
  });
};

notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ user: userId, isRead: false });
};

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
