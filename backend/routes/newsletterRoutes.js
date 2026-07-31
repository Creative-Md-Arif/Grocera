import express from "express";
const router = express.Router();
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getAllSubscribers,
  deleteSubscriber,
} from "../controllers/newsletterController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router.route("/subscribe").post(subscribeNewsletter);

router.route("/unsubscribe").post(unsubscribeNewsletter);

router.route("/").get(authenticate, authorizeAdmin, getAllSubscribers);

router.route("/:id").delete(authenticate, authorizeAdmin, deleteSubscriber);

export default router;
