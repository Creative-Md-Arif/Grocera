import express from "express";
const router = express.Router();

import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
  getHomepageCategories,
  updateCategoryFields,
} from "../controllers/categoryController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router.route("/homepage").get(getHomepageCategories);
router.route("/").post(authenticate, authorizeAdmin, createCategory);
router.route("/:categoryId").put(authenticate, authorizeAdmin, updateCategory);
router
  .route("/:categoryId")
  .delete(authenticate, authorizeAdmin, removeCategory);
router.route("/categories").get(listCategory);
router.route("/:id").get(readCategory);
router
  .route("/:id/fields")
  .put(authenticate, authorizeAdmin, updateCategoryFields);

export default router;
