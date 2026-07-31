import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    parent: {
      type: ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ===== নতুন যুক্ত করা হলো =====
    showOnHomepage: {
      type: Boolean,
      default: false,
    },
    homepageOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
