import express from "express";
const router = express.Router();

import {
  getPaymentMethods,
  createOrUpdatePaymentMethod,
  deletePaymentMethod,
  submitManualPayment,
  verifyManualPayment,
  getPaymentStats,
  checkTransactionId,
  initSSLCommerz,
  handleSSLCommerzIPN,
  validateSSLCommerzPayment,
  sslcommerzSuccessRedirect,
  sslcommerzFailRedirect,
  sslcommerzCancelRedirect,
} from "../controllers/paymentController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router.get("/methods", getPaymentMethods);
router.get("/check-transaction/:transactionId", checkTransactionId);

router.put("/submit/:orderId", submitManualPayment);

router.get("/stats", authenticate, authorizeAdmin, getPaymentStats);
router.post(
  "/methods",
  authenticate,
  authorizeAdmin,
  createOrUpdatePaymentMethod,
);
router.delete(
  "/methods/:type",
  authenticate,
  authorizeAdmin,
  deletePaymentMethod,
);
router.put(
  "/verify/:orderId",
  authenticate,
  authorizeAdmin,
  verifyManualPayment,
);

router.post("/sslcommerz/init", initSSLCommerz);
router.post("/sslcommerz/ipn", handleSSLCommerzIPN);

router.post("/sslcommerz/validate", validateSSLCommerzPayment);

router
  .route("/sslcommerz/success")
  .get(sslcommerzSuccessRedirect)
  .post(sslcommerzSuccessRedirect);
router
  .route("/sslcommerz/fail")
  .get(sslcommerzFailRedirect)
  .post(sslcommerzFailRedirect);
router
  .route("/sslcommerz/cancel")
  .get(sslcommerzCancelRedirect)
  .post(sslcommerzCancelRedirect);

export default router;
