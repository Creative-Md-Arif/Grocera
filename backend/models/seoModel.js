import mongoose from "mongoose";

const seoSettingSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "AriX Co - Premium Tech & Gadgets" },
    metaDescription: {
      type: String,
      default:
        "Buy premium tech products, gadgets, and accessories at the best prices in Bangladesh.",
    },
    metaKeywords: {
      type: String,
      default: "tech, electronics, gadgets, bangladesh, arixco",
    },

    // Open Graph / Social Media
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    twitterCard: {
      type: String,
      enum: ["summary", "summary_large_image"],
      default: "summary_large_image",
    },

    // Analytics & Tracking
    googleAnalyticsId: { type: String, default: "" },
    googleSearchConsole: { type: String, default: "" },
    facebookPixelId: { type: String, default: "" },

    // Advanced
    robotsTxt: {
      type: String,
      default: "User-agent: *\nDisallow:\nSitemap: /sitemap.xml",
    },
    structuredData: { type: String, default: "" }, // JSON-LD schema
  },
  { timestamps: true },
);

// এটি একটি Singleton মডেল (সবসময় শুধুমাত্র একটি ডকুমেন্ট থাকবে)
seoSettingSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const SEOSetting = mongoose.model("SEOSetting", seoSettingSchema);
export default SEOSetting;
