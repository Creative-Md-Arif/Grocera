import mongoose from "mongoose";

const cupponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    description: {
      type: String,
      default: "",
      maxlength: 200,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          if (this.discountType === "percentage") return v > 0 && v <= 100;
          return v > 0;
        },
        message: (props) => {
          if (props.instance.discountType === "percentage") {
            return "Percentage discount must be between 1 and 100";
          }
          return "Fixed discount must be greater than 0";
        },
      },
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumDiscountAmount: {
      // শুধু percentage টাইপের জন্য — সর্বোচ্চ কত টাকা discount হবে
      type: Number,
      default: null,
      min: 0,
    },

    usageLimit: {
      // মোট কতবার ব্যবহার করা যাবে (null = আনলিমিটেড)
      type: Number,
      default: null,
      min: 1,
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    perUserLimit: {
      // প্রতি ইউজার কতবার ব্যবহার করতে পারবে (null = আনলিমিটেড)
      type: Number,
      default: 1,
      min: 1,
    },

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    excludedCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isFirstTimeOnly: {
      type: Boolean,
      default: false,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// --- Indexes ---
cupponSchema.index({ code: 1 });
cupponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// --- Virtual: isExpired ---
cupponSchema.virtual("isExpired").get(function () {
  return new Date() > this.endDate;
});

// --- Virtual: isUsageExceeded ---
cupponSchema.virtual("isUsageExceeded").get(function () {
  if (this.usageLimit === null) return false;
  return this.usageCount >= this.usageLimit;
});

cupponSchema.set("toObject", { virtuals: true });
cupponSchema.set("toJSON", { virtuals: true });

const Cuppon = mongoose.model("Cuppon", cupponSchema);
export default Cuppon;
