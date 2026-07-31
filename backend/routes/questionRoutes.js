import express from "express";
import {
  createQuestion,
  getProductQuestions,
  answerQuestion,
  deleteQuestion,
  getQuestions,
} from "../controllers/questionController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.route("/").post(authenticate, createQuestion);


router.route("/product/:productId").get(getProductQuestions);
router.route("/").get(authenticate, authorizeAdmin, getQuestions);


router.route("/:id/answer").put(authenticate, authorizeAdmin, answerQuestion);
router.route("/:id").delete(authenticate, authorizeAdmin, deleteQuestion);

export default router;
