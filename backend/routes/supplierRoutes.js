import express from "express";
const router = express.Router();

import {
  createSupplier,
  getSuppliers,
  updateSupplier,
} from "../controllers/supplierController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router
  .route("/")
  .get(authenticate, authorizeAdmin, getSuppliers)
  .post(authenticate, authorizeAdmin, createSupplier);

router.route("/:id").put(authenticate, authorizeAdmin, updateSupplier);

export default router;
