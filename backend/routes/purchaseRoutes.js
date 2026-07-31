import express from "express";
const router = express.Router();
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  receivePurchaseOrderItems,
  generateInvoice,
  recordPayment,
} from "../controllers/purchaseController.js";

router
  .route("/")
  .get(authenticate, authorizeAdmin, getPurchaseOrders)
  .post(authenticate, authorizeAdmin, createPurchaseOrder);

router
  .route("/:id")
  .get(authenticate, authorizeAdmin, getPurchaseOrderById)
  .put(authenticate, authorizeAdmin, updatePurchaseOrder)
  .delete(authenticate, authorizeAdmin, deletePurchaseOrder);

router
  .route("/:id/receive")
  .put(authenticate, authorizeAdmin, receivePurchaseOrderItems);
router.route("/:id/invoice").get(authenticate, authorizeAdmin, generateInvoice);
router.route("/:id/payment").post(authenticate, authorizeAdmin, recordPayment);

export default router;
