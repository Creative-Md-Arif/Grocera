import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
  {
    // লোগোর ধরন নির্ধারণ: ছবি না টেক্সট
    logoType: {
      type: String,
      enum: ["image", "text"],
      default: "image", // ডিফল্ট হিসেবে ছবি থাকবে
    },

    // ১. Image Logo (আগের সিস্টেম)
    logo: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    // ২. Text Logo (নতুন সিস্টেম)
    textLogo: {
      fontSize: {
        type: String,
        default: "24px",
      },
      fontWeight: {
        type: String,
        enum: [
          "normal",
          "bold",
          "bolder",
          "lighter",
          "300",
          "500",
          "700",
          "900",
        ],
        default: "bold",
      },

      parts: [
        {
          text: { type: String, default: "" },
          color: { type: String, default: "#000000" },
        },
      ],
    },

    contact: {
      email: { type: String, default: "support@arixgear.com" },
      phone: { type: String, default: "+880 17100000000" },
      address: { type: String, default: "Dhaka, Bangladesh" },
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    copyrightText: {
      type: String,
      default: "ARIX CO — All rights reserved.",
    },
   
    authSettings: {
      requireEmailVerification: {
        type: Boolean,
        default: true,
      },
      allowGuestCheckout: {
        type: Boolean,
        default: true,
      },
      requireLoginForCheckout: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true },
);

// Singleton pattern: শুধু একটা document থাকবে
const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);

export default SiteSetting;
