import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import sanitizeHtml from "sanitize-html";

const sanitizeDescription = (description) => {
  return sanitizeHtml(description, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "br",
      "blockquote",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "style"],
    },
  });
};

const parseVariants = (variantsData) => {
  if (!variantsData) return [];
  try {
    const parsed =
      typeof variantsData === "string"
        ? JSON.parse(variantsData)
        : variantsData;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing variants:", error);
    return [];
  }
};

const addProduct = asyncHandler(async (req, res) => {
  try {
    const fields = req.fields;
    const {
      name,
      description,
      price,
      category,
      quantity,
      brand,
      images,
      keyFeatures,
      specifications,
      hasVariants,
      variants,
      defaultColorIndex,
      defaultSizeIndex,
      salesCount,
    } = fields;

    // 1. Validation
    if (!name || !brand || !description || !price || !category || !quantity) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    let imagesArray = [];
    if (images) {
      imagesArray = typeof images === "string" ? JSON.parse(images) : images;
      if (!Array.isArray(imagesArray)) imagesArray = [imagesArray];
    }

    if (imagesArray.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    let specsJson = specifications
      ? typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications
      : [];
    let featuresJson = keyFeatures
      ? typeof keyFeatures === "string"
        ? JSON.parse(keyFeatures)
        : keyFeatures
      : [];

    // Parse variants
    const hasVariantsBool = hasVariants === "true" || hasVariants === true;
    let parsedVariants = [];
    if (hasVariantsBool && variants) {
      parsedVariants = parseVariants(variants);
    }

    // Parse shipping details
    let shippingDetails = {
      isFreeShipping: false,
      isIndividualShipping: false,
      individualShippingCost: 0,
      extraShippingCost: 0,
    };
    if (fields.shippingDetails) {
      const parsedShipping =
        typeof fields.shippingDetails === "string"
          ? JSON.parse(fields.shippingDetails)
          : fields.shippingDetails;
      shippingDetails = {
        isFreeShipping:
          parsedShipping.isFreeShipping === true ||
          parsedShipping.isFreeShipping === "true",
        isIndividualShipping:
          parsedShipping.isIndividualShipping === true ||
          parsedShipping.isIndividualShipping === "true",
        individualShippingCost:
          Number(parsedShipping.individualShippingCost) || 0,
        extraShippingCost: Number(parsedShipping.extraShippingCost) || 0,
      };
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = new Product({
      ...fields,
      slug,
      description: sanitizeDescription(description),
      images: imagesArray,
      specifications: specsJson,
      keyFeatures: featuresJson,
      isFeatured: fields.isFeatured === "true" || fields.isFeatured === true,
      price: Number(price),
      quantity: Number(quantity),
      countInStock: Number(quantity), // Will be overwritten by pre-save if variants exist
      hasVariants: hasVariantsBool,
      variants: parsedVariants,
      defaultColorIndex: Number(defaultColorIndex) || 0,
      defaultSizeIndex: Number(defaultSizeIndex) || 0,
      salesCount: Number(salesCount) || 0,
      discountPercentage: Number(fields.discountPercentage) || 0,
      discountedAmount: Number(fields.discountedAmount) || 0,
      shippingDetails: shippingDetails,
    });

    // pre-save hook will run here and auto-calculate discount & stock
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Product Creation Error:", error);
    res.status(400).json({ error: error.message });
  }
});

const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const fields = req.fields;
    let {
      name,
      description,
      price,
      category,
      quantity,
      images,
      isFeatured,
      specifications,
      keyFeatures,
      hasVariants,
      variants,
      defaultColorIndex,
      defaultSizeIndex,
      salesCount,
    } = fields;

    // Validation
    if (!name || !description || !price || !category || !quantity) {
      return res
        .status(400)
        .json({ error: "Required basic fields are missing" });
    }

    let imagesArray = [];
    if (images) {
      imagesArray = typeof images === "string" ? JSON.parse(images) : images;
      if (!Array.isArray(imagesArray)) imagesArray = [imagesArray];
    }

    // Parse variants
    const hasVariantsBool = hasVariants === "true" || hasVariants === true;
    let parsedVariants = [];
    if (hasVariantsBool && variants) {
      parsedVariants = parseVariants(variants);
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // FIX: Use findById + save() to trigger the pre-save middleware for auto-calculations
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update fields
    product.name = name;
    product.slug = slug;
    product.description = sanitizeDescription(description);
    product.brand = fields.brand;
    product.price = Number(price);
    product.quantity = Number(quantity);
    product.category = category;
    product.isFeatured = isFeatured === "true" || isFeatured === true;
    product.specifications = specifications
      ? typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications
      : [];
    product.keyFeatures = keyFeatures
      ? typeof keyFeatures === "string"
        ? JSON.parse(keyFeatures)
        : keyFeatures
      : [];
    product.hasVariants = hasVariantsBool;
    product.variants = parsedVariants;
    product.defaultColorIndex = Number(defaultColorIndex) || 0;
    product.defaultSizeIndex = Number(defaultSizeIndex) || 0;
    product.salesCount = Number(salesCount) || 0;
    product.discountPercentage = Number(fields.discountPercentage) || 0;
    product.discountedAmount = Number(fields.discountedAmount) || 0;
    product.warranty = fields.warranty ?? product.warranty;
    product.weight = fields.weight ? Number(fields.weight) : product.weight;

    // Keep old images if no new images are provided
    product.images = imagesArray.length > 0 ? imagesArray : product.images;

    // Parse and Update shipping details
    if (fields.shippingDetails) {
      const parsedShipping =
        typeof fields.shippingDetails === "string"
          ? JSON.parse(fields.shippingDetails)
          : fields.shippingDetails;
      product.shippingDetails = {
        isFreeShipping:
          parsedShipping.isFreeShipping === true ||
          parsedShipping.isFreeShipping === "true",
        isIndividualShipping:
          parsedShipping.isIndividualShipping === true ||
          parsedShipping.isIndividualShipping === "true",
        individualShippingCost:
          Number(parsedShipping.individualShippingCost) || 0,
        extraShippingCost: Number(parsedShipping.extraShippingCost) || 0,
      };
    }

    // pre-save hook will run here and auto-calculate discount & variant stock
    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(400).json({ error: error.message });
  }
});

const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 12; // ফ্রন্টএন্ডের সাথে মিলিয়ে ১২ করে দিন
    const page = Number(req.query.page) || 1;

    let query = { isActive: { $ne: false } };

    // ✅ সর্টিং লজিক ফ্রন্টএন্ডের সাথে মিলিয়ে আপডেট করা হলো
    let sortOption = { createdAt: -1 }; // ডিফল্ট
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price-low":
          sortOption = { price: 1 };
          break;
        case "price-high":
          sortOption = { price: -1 };
          break;
        case "bestselling":
          sortOption = { salesCount: -1 };
          break;
        case "rating":
          sortOption = { rating: -1 };
          break;
        case "name":
          sortOption = { name: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");
      query.$or = [
        { name: { $regex: regex } },
        { brand: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name")
      .sort(sortOption) // ✅ এখন ফ্রন্টএন্ডের সিলেক্ট অনুযায়ী সর্ট হবে
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(total / pageSize),
      total,
      hasMore: total > pageSize * page,
      sort: req.query.sort || "newest",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { slug: req.params.id },
      ],
    }).populate({
      path: "category",
      populate: {
        path: "parent",
        populate: { path: "parent" },
      },
    });

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const LOW_STOCK_THRESHOLD = 5;
    const productObj = product.toObject();

    if (productObj.hasVariants && Array.isArray(productObj.variants)) {
      productObj.variants = productObj.variants.map((variant, colorIndex) => {
        const colorHasStock =
          variant.sizes?.some((s) => s.countInStock > 0) || false;

        return {
          ...variant,
          colorHasStock,
          sizes: (variant.sizes || []).map((size) => {
            let stockStatus = "in_stock";
            if (size.countInStock <= 0) stockStatus = "out_of_stock";
            else if (size.countInStock <= LOW_STOCK_THRESHOLD)
              stockStatus = "low_stock";

            return { ...size, stockStatus };
          }),
        };
      });
    } else {
      // Non-variant product এর জন্যও একই ধরনের status ফিল্ড দেওয়া হলো
      let stockStatus = "in_stock";
      if (productObj.countInStock <= 0) stockStatus = "out_of_stock";
      else if (productObj.countInStock <= LOW_STOCK_THRESHOLD)
        stockStatus = "low_stock";
      productObj.stockStatus = stockStatus;
    }

    return res.json(productObj);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found" });
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate({
        path: "category",
        populate: {
          path: "parent",
          populate: { path: "parent" },
        },
      })
      .limit(50)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// productController.js
const fetchNewArrivals = asyncHandler(async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;


    let products = await Product.find({ showOnHomepage: true })
      .populate("category")
      .sort({ homepageOrder: 1, createdAt: -1 }) 
      .limit(limit);

    if (products.length === 0) {
      products = await Product.find({})
        .populate("category")
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const fetchBestSellers = asyncHandler(async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({})
      .populate("category")
      .sort({ salesCount: -1, rating: -1 })
      .limit(limit);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const updateProductSalesCount = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.salesCount = (product.salesCount || 0) + (quantity || 1);
    await product.save();

    res.json({
      message: "Sales count updated",
      salesCount: product.salesCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio, keyword, page = 1, limit = 12 } = req.body;

    let args = {};

    if (keyword) {
      const regex = new RegExp(keyword, "i");
      args.$or = [
        { name: { $regex: regex } },
        { brand: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    if (checked && checked.length > 0) {
      const getRecursiveChildIds = async (parentIds) => {
        const children = await Category.find({
          parent: { $in: parentIds },
        }).select("_id");
        if (children.length === 0) return [];
        const childIds = children.map((c) => c._id);
        const subChildIds = await getRecursiveChildIds(childIds);
        return [...childIds, ...subChildIds];
      };

      const allChildCategoryIds = await getRecursiveChildIds(checked);
      const finalCategoryIds = [...checked, ...allChildCategoryIds];

      args.category = { $in: finalCategoryIds };
    }

    if (radio && radio.length) {
      args.price = { $gte: radio[0], $lte: radio[1] };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const total = await Product.countDocuments(args);

    const products = await Product.find(args)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(limitNum * (pageNum - 1));

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
      hasMore: total > limitNum * pageNum,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const fetchRelatedProducts = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = Number(req.query.limit) || 5;

    const currentProduct = await Product.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(productId) ? productId : null },
        { slug: productId },
      ],
    });

    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { category, brand, _id: actualProductId } = currentProduct;

    let relatedProducts = [];

    if (category) {
      const sameCategory = await Product.find({
        _id: { $ne: actualProductId },
        category: category,
        isActive: { $ne: false },
      })
        .populate("category", "name")
        .limit(limit)
        .select("name price images brand slug discountPercentage rating");

      relatedProducts = [...sameCategory];
    }

    if (relatedProducts.length < limit && brand) {
      const existingIds = relatedProducts.map((p) => p._id.toString());
      existingIds.push(actualProductId.toString());

      const sameBrand = await Product.find({
        _id: { $nin: existingIds },
        brand: brand,
        isActive: { $ne: false },
      })
        .populate("category", "name")
        .limit(limit - relatedProducts.length)
        .select("name price images brand slug discountPercentage rating");

      relatedProducts = [...relatedProducts, ...sameBrand];
    }

    if (relatedProducts.length < limit) {
      const existingIds = relatedProducts.map((p) => p._id.toString());
      existingIds.push(actualProductId.toString());

      const randomProducts = await Product.find({
        _id: { $nin: existingIds },
        isActive: { $ne: false },
      })
        .populate("category", "name")
        .limit(limit - relatedProducts.length)
        .select("name price images brand slug discountPercentage rating");

      relatedProducts = [...relatedProducts, ...randomProducts];
    }

    res.json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

const toggleFeatured = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({ _id: product._id, isFeatured: product.isFeatured });
  } catch (error) {
    console.error("Toggle Featured Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});


const updateProductFields = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { showOnHomepage, homepageOrder } = req.fields;

    if (showOnHomepage !== undefined) {
      product.showOnHomepage = showOnHomepage === "true" || showOnHomepage === true;
    }
    if (homepageOrder !== undefined) {
      product.homepageOrder = Number(homepageOrder) || 0;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Quick Update Error:", error);
    res.status(400).json({ error: error.message });
  }
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  fetchNewArrivals,
  fetchBestSellers,
  updateProductSalesCount,
  filterProducts,
  fetchRelatedProducts,
  toggleFeatured,
  updateProductFields,
};
