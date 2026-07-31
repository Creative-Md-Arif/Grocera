import asyncHandler from "../middlewares/asyncHandler.js";
import Question from "../models/questionModel.js";

const createQuestion = asyncHandler(async (req, res) => {
  const { productId, question } = req.body;

  if (!productId || !question) {
    return res
      .status(400)
      .json({ error: "Product ID and question are required" });
  }

  // যদি req.user.name না থাকে, তবে "Anonymous" বসিয়ে দেওয়া হলো
  const userName = req.user.name || req.user.username || "Anonymous";

  const newQuestion = await Question.create({
    product: productId,
    user: req.user._id,
    name: req.user.username,
    question,
  });

  res.status(201).json(newQuestion);
});

const getQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({})
    .populate("user", "username")
    .populate("product", "name slug")
    .sort({ createdAt: -1 });
  res.json(questions);
});

const getProductQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({ product: req.params.productId })
    .populate("user", "username")
    .sort({ createdAt: -1 });
  res.json(questions);
});

const answerQuestion = asyncHandler(async (req, res) => {
  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({ error: "Answer cannot be empty" });
  }

  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({ error: "Question not found" });
  }

  question.answer = answer;
  question.isAnswered = true;
  question.answeredBy = req.user._id;

  const updatedQuestion = await question.save();
  res.json(updatedQuestion);
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({ error: "Question not found" });
  }

  await question.deleteOne();
  res.json({ message: "Question removed" });
});

export {
  createQuestion,
  getProductQuestions,
  getQuestions,
  answerQuestion,
  deleteQuestion,
};
