import asyncHandler from "../middlewares/asyncHandler.js";
import Brand from "../models/brandModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";
import slugify from "slugify";
import fs from "fs";
import path from "path";

/* ----------------------------- Helpers ----------------------------- */

// Generate unique slug
const generateUniqueSlug = async (name, excludeId = null) => {
  let baseSlug = slugify(name, { lower: true, strict: true }) || "brand";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Brand.findOne(query);
    if (!existing) break;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
};

// Case-insensitive duplicate check
const findDuplicate = async (name, excludeId = null) => {
  const query = {
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return await Brand.findOne(query);
};

// Delete file helper
const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("File delete error:", err.message);
  }
};

const getImageUrl = (req, file) => {
  if (!file) return "";
  // If you serve /uploads statically
  return `/uploads/${file.newFilename}`;
};


/* ----------------------------- Create ----------------------------- */
const createBrand = asyncHandler(async (req, res) => {
  try {
    const fields = req.fields || {};
    const { name, description, country, isActive, isFeatured, order, metaTitle, metaDescription, image } = fields;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    // 2. Duplicate Check
    const duplicate = await findDuplicate(name);
    if (duplicate) {
      return res.status(409).json({
        error: `Brand "${duplicate.name}" already exists`,
      });
    }

  


    // 4. Unique slug
    const slug = await generateUniqueSlug(name);

    // 5. Create
    const brand = new Brand({
      name: name.trim(),
      slug,
      image: image, 
      description: description || "",
      country: country || "",
      isActive: isActive === "true" || isActive === true,
      isFeatured: isFeatured === "true" || isFeatured === true,
      order: Number(order) || 0,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
    });

    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    console.error("Create Brand Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Brand already exists (duplicate key)" });
    }
    res.status(400).json({ error: error.message });
  }
});

/* ----------------------------- Get All ----------------------------- */
// @desc    Get all brands (with filters)
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  try {
    const {
      search,
      isActive,
      isFeatured,
      includeProducts,
      sort = "order",
      page = 1,
      limit,
    } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    // Sort options
    let sortOption = { order: 1, name: 1 };
    switch (sort) {
      case "name":
        sortOption = { name: 1 };
        break;
      case "name-desc":
        sortOption = { name: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "products":
        sortOption = { productCount: -1 };
        break;
      default:
        sortOption = { order: 1, name: 1 };
    }

    let brandsQuery = Brand.find(query).sort(sortOption);

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit);
    if (limitNum) {
      brandsQuery = brandsQuery.skip(limitNum * (pageNum - 1)).limit(limitNum);
    }

    let brands = await brandsQuery;

    // Attach product count
    if (includeProducts === "true" || sort === "products") {
      const brandNames = brands.map((b) => b.name);
      const counts = await Product.aggregate([
        { $match: { brand: { $in: brandNames } } },
        { $group: { _id: "$brand", count: { $sum: 1 } } },
      ]);
      const countMap = {};
      counts.forEach((c) => (countMap[c._id] = c.count));

      brands = brands.map((b) => {
        const obj = b.toObject();
        obj.productCount = countMap[b.name] || 0;
        return obj;
      });

      if (sort === "products") {
        brands.sort((a, b) => b.productCount - a.productCount);
      }
    }

    const total = await Brand.countDocuments(query);

    res.json({
      brands,
      page: pageNum,
      pages: limitNum ? Math.ceil(total / limitNum) : 1,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

/* ----------------------------- Get by ID/Slug ----------------------------- */
// @desc    Get brand by ID or slug
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findOne({
      $or: [
        {
          _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null,
        },
        { slug: req.params.id },
      ],
    });

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    // Get product count + sample products
    const [productCount, products] = await Promise.all([
      Product.countDocuments({ brand: brand.name }),
      Product.find({ brand: brand.name })
        .select(
          "name slug images price discountPercentage rating numReviews countInStock hasVariants variants defaultColorIndex defaultSizeIndex appliedCampaigns",
        )
        .sort({ salesCount: -1, rating: -1 })
        .limit(12),
    ]);

    res.json({ ...brand.toObject(), productCount, products });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Brand not found" });
  }
});


/* ----------------------------- Update ----------------------------- */
const updateBrand = asyncHandler(async (req, res) => {
  try {
    const fields = req.fields || {};
    const {
      name,
      description,
      country,
      isActive,
      isFeatured,
      order,
      metaTitle,
      metaDescription,
      image, // ✅ এখানেও Cloudinary URL আসবে
      removeImage,
    } = fields;

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const oldName = brand.name;

    // Duplicate check if name changed
    if (name && name.trim() !== brand.name) {
      const duplicate = await findDuplicate(name, brand._id);
      if (duplicate) {
        return res.status(409).json({
          error: `Brand "${duplicate.name}" already exists`,
        });
      }
      brand.name = name.trim();
      brand.slug = await generateUniqueSlug(name, brand._id);
    }

    // Update text fields
    if (description !== undefined) brand.description = description;
    if (country !== undefined) brand.country = country;
    if (isActive !== undefined) brand.isActive = isActive === "true" || isActive === true;
    if (isFeatured !== undefined) brand.isFeatured = isFeatured === "true" || isFeatured === true;
    if (order !== undefined) brand.order = Number(order) || 0;
    if (metaTitle !== undefined) brand.metaTitle = metaTitle;
    if (metaDescription !== undefined) brand.metaDescription = metaDescription;

    // Image handling (Cloudinary URL)
    if (image) {
      brand.image = image; // ✅ নতুন Cloudinary URL সেভ হবে
    } else if (removeImage === "true") {
      brand.image = "";
    }

    await brand.save();

    // Sync brand name in all products if name changed
    if (brand.name !== oldName) {
      await Product.updateMany(
        { brand: oldName },
        { $set: { brand: brand.name } }
      );
    }

    res.json(brand);
  } catch (error) {
    console.error("Update Brand Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Brand already exists" });
    }
    res.status(400).json({ error: error.message });
  }
});

/* ----------------------------- Delete ----------------------------- */
// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const { force } = req.query;
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    // Check products using this brand
    const productCount = await Product.countDocuments({ brand: brand.name });

    if (productCount > 0 && force !== "true") {
      return res.status(400).json({
        error: `Cannot delete brand "${brand.name}". ${productCount} product(s) are using it. Use ?force=true to delete anyway (products will keep brand name as text).`,
        productCount,
      });
    }

    // Delete brand image
    if (brand.image) {
      const imgPath = path.join(process.cwd(), brand.image);
      deleteFile(imgPath);
    }

    await Brand.findByIdAndDelete(req.params.id);

    res.json({
      message: `Brand "${brand.name}" deleted successfully`,
      productCount,
    });
  } catch (error) {
    console.error("Delete Brand Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

/* ----------------------------- Toggle Active ----------------------------- */
// @desc    Toggle brand active status
// @route   PUT /api/brands/:id/toggle-active
// @access  Private/Admin
const toggleBrandActive = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    brand.isActive = !brand.isActive;
    await brand.save();

    res.json({ _id: brand._id, isActive: brand.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

/* ----------------------------- Toggle Featured ----------------------------- */
// @desc    Toggle brand featured status
// @route   PUT /api/brands/:id/toggle-featured
// @access  Private/Admin
const toggleBrandFeatured = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    brand.isFeatured = !brand.isFeatured;
    await brand.save();

    res.json({ _id: brand._id, isFeatured: brand.isFeatured });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

/* ----------------------------- Check Duplicate (for frontend live check) ----------------------------- */
// @desc    Check if brand name exists
// @route   GET /api/brands/check
// @access  Private/Admin
const checkBrandName = asyncHandler(async (req, res) => {
  try {
    const { name, excludeId } = req.query;

    if (!name) {
      return res.json({ exists: false });
    }

    const query = {
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Brand.findOne(query).select("name slug");

    res.json({
      exists: !!existing,
      existingBrand: existing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

/* ----------------------------- Update Order (bulk) ----------------------------- */
// @desc    Bulk update brand order
// @route   PUT /api/brands/reorder
// @access  Private/Admin
const reorderBrands = asyncHandler(async (req, res) => {
  try {
    const { brands } = req.body; // [{ id, order }]

    if (!Array.isArray(brands)) {
      return res.status(400).json({ error: "brands array is required" });
    }

    const ops = brands.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: Number(order) || 0 } },
      },
    }));

    await Brand.bulkWrite(ops);
    res.json({ message: "Brand order updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

export {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  toggleBrandActive,
  toggleBrandFeatured,
  checkBrandName,
  reorderBrands,
};
