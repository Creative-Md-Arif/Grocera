import express from "express";
const router = express.Router();

import {
  countTotalOrders,
  countTotalOrdersByDate,
  calculateTotalSales,
  calcualteTotalSalesByDate,
  getSalesSummaryByStatus,
  getDeliverySummary,
} from "../controllers/dashboardController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router
  .route("/total-orders")
  .get(authenticate, authorizeAdmin, countTotalOrders);

router
  .route("/total-orders-by-date")
  .get(authenticate, authorizeAdmin, countTotalOrdersByDate);

router
  .route("/total-sales")
  .get(authenticate, authorizeAdmin, calculateTotalSales);

router
  .route("/total-sales-by-date")
  .get(authenticate, authorizeAdmin, calcualteTotalSalesByDate);

router
  .route("/sales-summary")
  .get(authenticate, authorizeAdmin, getSalesSummaryByStatus);

router
  .route("/delivery-summary")
  .get(authenticate, authorizeAdmin, getDeliverySummary);

export default router;
