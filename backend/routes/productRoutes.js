import express from "express";
import formidable from "express-formidable";
const router = express.Router();
// controllers
import {
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
} from "../controllers/productController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";
import { attachCampaignPricing } from "../middlewares/attachCampaignPricing.js";

router
  .route("/")
  .get(attachCampaignPricing, fetchProducts)
  .post(authenticate, authorizeAdmin, formidable(), addProduct);

router.route("/allproducts").get(attachCampaignPricing, fetchAllProducts);

router.get("/related/:id", attachCampaignPricing, fetchRelatedProducts);

router.get("/new-arrivals", attachCampaignPricing, fetchNewArrivals);
router.get("/best-sellers", attachCampaignPricing, fetchBestSellers);

router.post(
  "/update-sales",
  authenticate,
  authorizeAdmin,
  updateProductSalesCount,
);

router
  .route("/:id")
  .get(attachCampaignPricing, fetchProductById)
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct);

router.route("/filtered-products").post(attachCampaignPricing, filterProducts);
router
  .route("/:id/toggle-featured")
  .put(authenticate, authorizeAdmin, toggleFeatured);

router
  .route("/:id/fields")
  .put(authenticate, authorizeAdmin, formidable() , updateProductFields);
export default router;
