import mongoose from "mongoose";
import slugify from "slugify";

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Brand name must be at least 2 characters"],
      maxlength: [60, "Brand name cannot exceed 60 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    country: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    metaTitle: {
      type: String,
      default: "",
    },
    metaDescription: {
      type: String,
      default: "",
    },
    // Statistics (computed on demand)
    productCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Pre-save: slug generation
brandSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    // slug uniqueness handled in controller (append -2, -3 etc.)
    this.slug = baseSlug;
  }
  next();
});

brandSchema.index({ name: "text", description: "text" });
brandSchema.index({ isActive: 1, order: 1 });

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;
