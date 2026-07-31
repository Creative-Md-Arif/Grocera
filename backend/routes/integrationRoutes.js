import express from "express";
import {
  createIntegration,
  getIntegrations,
  updateIntegration,
  deleteIntegration,
} from "../controllers/integrationController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(getIntegrations);

router.route("/").post(authenticate, authorizeAdmin, createIntegration);

router
  .route("/:id")
  .put(authenticate, authorizeAdmin, updateIntegration)
  .delete(authenticate, authorizeAdmin, deleteIntegration);

export default router;
