import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";

const getAllReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({ "reviews.0": { $exists: true } })
    .populate("reviews.reply.user", "username")
    .select("name slug images reviews");

  let allReviews = [];
  products.forEach((product) => {
    product.reviews.forEach((review) => {
      allReviews.push({
        _id: review._id,
        productId: product._id,
        productName: product.name,
        productImage: product.images[0] || "",
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        isFeatured: review.isFeatured,
        reply: review.reply,
        createdAt: review.createdAt,
      });
    });
  });

  allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ reviews: allReviews });
});

// @desc    Admin: Delete a review
// @route   DELETE /api/reviews/admin/:id/:reviewId
// @access  Private/Admin
const deleteReviewAdmin = asyncHandler(async (req, res) => {
  const { id: productId, reviewId } = req.params;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const initialLength = product.reviews.length;
  product.reviews = product.reviews.filter(
    (r) => r._id.toString() !== reviewId,
  );

  if (product.reviews.length === initialLength) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Update product rating and numReviews
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length
      : 0;

  await product.save();
  res.json({ message: "Review deleted successfully" });
});

// @desc    Create new review
// @route   POST /api/reviews/:id/reviews
// @access  Private
const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { slug: req.params.id },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = product.reviews.some(
      (review) => review.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      name: req.user.username,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all reviews for a specific product
// @route   GET /api/reviews/:id
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { slug: req.params.id },
      ],
    }).populate("reviews.user", "username");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Sort by helpful votes and newest first
    const sortedReviews = product.reviews.sort(
      (a, b) =>
        b.helpfulVotes.length - a.helpfulVotes.length ||
        new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json(sortedReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get featured reviews for homepage
// @route   GET /api/reviews/featured
// @access  Public
const getFeaturedReviews = asyncHandler(async (req, res) => {
  try {
    // শুধুমাত্র সেই প্রোডাক্ট গুলো আনবে যেগুলোতে featured review আছে
    const products = await Product.find({
      "reviews.isFeatured": true,
    }).select("name slug images reviews");

    let featuredReviews = [];

    products.forEach((product) => {
      product.reviews.forEach((review) => {
        if (review.isFeatured) {
          featuredReviews.push({
            _id: review._id,
            name: review.name,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            helpfulVotes: review.helpfulVotes.length,
            product: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              image: product.images[0] || "",
            },
          });
        }
      });
    });

    res.json(featuredReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Admin toggle feature a review (For Homepage)
// @route   PUT /api/reviews/:id/:reviewId/feature
// @access  Private/Admin
const toggleReviewFeature = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.isFeatured = !review.isFeatured; // Toggle true/false
    await product.save();

    res.json({
      message: "Review feature updated",
      isFeatured: review.isFeatured,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Admin reply to a review
// @route   PUT /api/reviews/:id/:reviewId/reply
// @access  Private/Admin
const replyToReview = asyncHandler(async (req, res) => {
  const { text } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.reply = {
      text: text,
      user: req.user._id,
      createdAt: new Date(),
    };

    await product.save();
    res.json({ message: "Reply added", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Admin delete reply from a review
// @route   DELETE /api/reviews/:id/:reviewId/reply
// @access  Private/Admin
const deleteReviewReply = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.reply = undefined; // Remove the reply
    await product.save();

    res.json({ message: "Reply deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/:reviewId/helpful
// @access  Private
const markReviewHelpful = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // চেক করা ইউজার আগে helpful দিয়েছে কিনা
    const alreadyMarked = review.helpfulVotes.some(
      (userId) => userId.toString() === req.user._id.toString(),
    );

    if (alreadyMarked) {
      // যদি আগে দিয়ে থাকে, তবে তা সরিয়ে দেওয়া হবে (Toggle)
      review.helpfulVotes = review.helpfulVotes.filter(
        (userId) => userId.toString() !== req.user._id.toString(),
      );
    } else {
      // নতুন হলে অ্যাড করবে
      review.helpfulVotes.push(req.user._id);
    }

    await product.save();
    res.json({
      message: "Helpful status updated",
      helpfulCount: review.helpfulVotes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export {
  getAllReviews,
  deleteReviewAdmin,
  addProductReview,
  getProductReviews,
  getFeaturedReviews,
  toggleReviewFeature,
  replyToReview,
  deleteReviewReply,
  markReviewHelpful,
};
