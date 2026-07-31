import express from "express";
const router = express.Router();
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// ---------------------------------------------------------
// 🌐 Public Routes (Anyone can read published blogs)
// ---------------------------------------------------------

router.route("/").get(getAllBlogs);
router.route("/:slugOrId").get(getBlogBySlug);

// ---------------------------------------------------------
// 🔒 Admin Routes (Protected - Create, Update, Delete)
// ---------------------------------------------------------
router.route("/").post(authenticate, authorizeAdmin, createBlog);
router.route("/:id").put(authenticate, authorizeAdmin, updateBlog);
router.route("/:id").delete(authenticate, authorizeAdmin, deleteBlog);

export default router;
