import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import multer from "multer";
import express from "express";
const router = express.Router();
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// ==================== PRODUCT IMAGES STORAGE ====================
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, quality: "auto", fetch_format: "auto" }],
  },
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ==================== BANNER IMAGES STORAGE ====================
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 3000, quality: "auto", fetch_format: "auto" }],
  },
});

const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ব্যানারের জন্য 10MB (বড় ফাইল)
});

// ==================== CATEGORY IMAGES STORAGE ====================
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/categories",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, quality: "auto", fetch_format: "auto" }],
  },
});

const uploadCategory = multer({
  storage: categoryStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// ==================== SITE LOGO STORAGE ====================
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/site-logo",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    // লোগো সাধারণত ছোট ও transparent হয়, তাই বড় resize না করে শুধু quality optimize করা
    transformation: [
      { width: 500, crop: "limit", quality: "auto", fetch_format: "auto" },
    ],
  },
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // লোগো ছোট ফাইল হওয়া উচিত, 2MB যথেষ্ট
});

// ==================== GENERAL UPLOAD (BACKWARD COMPATIBILITY) ====================
const generalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, quality: "auto", fetch_format: "auto" }],
  },
});

const uploadGeneral = multer({
  storage: generalStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ==================== ROUTES ====================

// প্রোডাক্ট ইমেজ আপলোড (আগের মতোই)
router.post("/products", uploadProduct.array("image", 10), (req, res) => {
  if (req.files && req.files.length > 0) {
    const urls = req.files.map((file) => file.path);
    res.status(200).send({
      message: "Product images uploaded successfully",
      images: urls,
      url: urls[0],
    });
  } else {
    res.status(400).send({ message: "No image file provided" });
  }
});

// ==================== BANNER UPLOAD ROUTES ====================

// সিঙ্গেল ব্যানার আপলোড (ডেস্কটপ বা মোবাইল)
router.post("/banner", uploadBanner.single("image"), (req, res) => {
  if (req.file) {
    res.status(200).send({
      message: "Banner image uploaded successfully",
      image: req.file.path,
      url: req.file.path,
      public_id: req.file.filename,
    });
  } else {
    res.status(400).send({ message: "No image file provided" });
  }
});

// মাল্টিপল ব্যানার আপলোড (একাধিক ব্যানার একসাথে)
router.post("/banners", uploadBanner.array("image", 20), (req, res) => {
  if (req.files && req.files.length > 0) {
    const urls = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
    res.status(200).send({
      message: "Banner images uploaded successfully",
      images: urls.map((u) => u.url),
      details: urls,
    });
  } else {
    res.status(400).send({ message: "No image files provided" });
  }
});

// ডেস্কটপ + মোবাইল ব্যানার একসাথে আপলোড
router.post(
  "/banner/dual",
  uploadBanner.fields([
    { name: "desktop", maxCount: 1 },
    { name: "mobile", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const desktopFile = req.files?.desktop?.[0];
      const mobileFile = req.files?.mobile?.[0];

      if (!desktopFile && !mobileFile) {
        return res.status(400).send({ message: "No image files provided" });
      }

      const result = {
        message: "Banner images uploaded successfully",
      };

      if (desktopFile) {
        result.desktop = {
          url: desktopFile.path,
          public_id: desktopFile.filename,
        };
      }

      if (mobileFile) {
        result.mobile = {
          url: mobileFile.path,
          public_id: mobileFile.filename,
        };
      }

      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({ message: "Upload failed", error: error.message });
    }
  },
);

// ==================== CATEGORY UPLOAD ====================
router.post("/category", uploadCategory.single("image"), (req, res) => {
  if (req.file) {
    res.status(200).send({
      message: "Category image uploaded successfully",
      image: req.file.path,
      url: req.file.path,
    });
  } else {
    res.status(400).send({ message: "No image file provided" });
  }
});

// ==================== SITE LOGO UPLOAD ====================
router.post("/logo", uploadLogo.single("image"), (req, res) => {
  if (req.file) {
    res.status(200).send({
      message: "Logo uploaded successfully",
      image: req.file.path,
      url: req.file.path,
      public_id: req.file.filename,
    });
  } else {
    res.status(400).send({ message: "No image file provided" });
  }
});

// ==================== GENERAL UPLOAD (BACKWARD COMPATIBILITY) ====================
router.post("/", uploadGeneral.array("image", 10), (req, res) => {
  if (req.files && req.files.length > 0) {
    const urls = req.files.map((file) => file.path);
    res.status(200).send({
      message: "Image uploaded successfully",
      images: urls,
      url: urls[0],
    });
  } else {
    res.status(400).send({ message: "No image file provided" });
  }
});

// ==================== DELETE IMAGE ====================
router.delete("/delete", async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).send({ message: "public_id is required" });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "ok") {
      res.status(200).send({
        message: "Image deleted successfully",
        result,
      });
    } else {
      res.status(400).send({
        message: "Failed to delete image",
        result,
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Delete failed", error: error.message });
  }
});

// ==================== GET UPLOAD SIGNATURE (FOR DIRECT CLIENT UPLOAD) ====================
router.get("/signature", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "uploads/banners",
    },
    process.env.CLOUDINARY_SECRET_KEY,
  );

  res.status(200).send({
    signature,
    timestamp,
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
  });
});

export default router;
