import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

// Banner Schema
const bannerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "hero",
        "category",
        "promotional",
        "sidebar",
        "popup",
        "footer",
        "top-bar",
        "middle",
      ],
      required: true,
    },

    buttonType: {
      type: String,
      enum: [
        "default",
        "weekend-deal",
        "flash-sale",
        "big-sale",
        "limited-offer",
        "special-offer",
        "clearance",
        "new-arrival",
        "best-seller",
        "trending-now",
        "hot-deal",
        "mega-sale",
        "seasonal-offer",
        "exclusive",
        "last-chance",
        "doorbuster",
        "early-bird",
        "member-exclusive",
        "bundle-deal",
        "buy-one-get-one",
      ],
      default: "default",
    },

    headline: {
      type: String,
      default: "",
    },

    subHeadline: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      required: true,
    },

    mobileImage: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      default: "Shop Now",
    },

    link: {
      type: String,
      default: "",
    },

    product: {
      type: ObjectId,
      ref: "Product",
      default: null,
    },

    category: {
      type: ObjectId,
      ref: "Category",
      default: null,
    },

    position: {
      type: Number,
      default: 0,
    },

    backgroundColor: {
      type: String,
      default: "#ffffff",
    },

    textColor: {
      type: String,
      default: "#000000",
    },

    buttonColor: {
      type: String,
      default: "#ff6b6b",
    },

    buttonTextColor: {
      type: String,
      default: "#ffffff",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    popupSettings: {
      delay: {
        type: Number,
        default: 5,
      },

      showAgainAfter: {
        type: Number,
        default: 24,
      },

      couponCode: {
        type: String,
        default: "",
      },

      discountAmount: {
        type: Number,
        default: 0,
      },
    },

    offerSettings: {
      offerType: {
        type: String,
        enum: ["percentage", "fixed", "bogo", "free-shipping"],
        default: "percentage",
      },

      offerValue: {
        type: Number,
        default: 0,
      },

      isLimitedTime: {
        type: Boolean,
        default: false,
      },

      countdownEndTime: {
        type: Date,
        default: null,
      },
    },

    displayPages: [
      {
        type: String,
        enum: ["home", "category", "product", "cart", "checkout", "all"],
        default: "all",
      },
    ],

    displayOn: {
      desktop: {
        type: Boolean,
        default: true,
      },
      mobile: {
        type: Boolean,
        default: true,
      },
      tablet: {
        type: Boolean,
        default: true,
      },
    },

    clicks: {
      type: Number,
      default: 0,
    },

    impressions: {
      type: Number,
      default: 0,
    },

    metaData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

bannerSchema.index({ type: 1, isActive: 1 });
bannerSchema.index({ position: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
