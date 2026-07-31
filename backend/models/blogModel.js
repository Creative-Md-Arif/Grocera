import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    // Basic Info
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true }, // Sanitized HTML from React Quill
    excerpt: { type: String, required: true },

    // Featured Image & Meta
    featuredImage: {
      url: { type: String, required: true },
      altText: { type: String, default: "" },
      titleText: { type: String, default: "" },
      caption: { type: String, default: "" },
      width: { type: Number },
      height: { type: Number },
    },

    // Publishing & Taxonomy
    category: { type: String, default: "Uncategorized" },
    subCategory: { type: String, default: "" },
    tags: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "private"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
    isSticky: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },

    // SEO Meta
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      metaKeywords: { type: String },
      canonicalUrl: { type: String },
      focusKeyword: { type: String },
    },

    // Social Media Meta (Open Graph & Twitter)
    social: {
      ogTitle: { type: String },
      ogDescription: { type: String },
      ogImage: { type: String },
      twitterCard: {
        type: String,
        enum: ["summary", "summary_large_image"],
        default: "summary_large_image",
      },
    },

    // Analytics & Metadata
    readingTime: { type: Number, default: 0 }, // In minutes
    wordCount: { type: Number, default: 0 },

    // Revisions (Auto-save history)
    revisions: [
      {
        content: String,
        excerpt: String,
        savedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
