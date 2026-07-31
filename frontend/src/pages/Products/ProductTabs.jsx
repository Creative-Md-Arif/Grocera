/* eslint-disable react/prop-types */
import { useState, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import Ratings from "./Ratings";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  useGetProductQuestionsQuery,
  useCreateQuestionMutation,
} from "@redux/api/questionApiSlice";

// ── Static array outside component to prevent unnecessary re-creation ──
const TAB_NAMES = ["Specification", "Description", "Questions", "Reviews"];

// ── Skeleton Loader Component ──
const ProductTabsSkeleton = () => (
  <div className="flex flex-col space-y-4 font-sans text-gray-900 w-full animate-pulse">
    <div className="flex gap-2 border-b border-gray-200 pb-px">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="px-4 py-2 h-[33px] w-32 bg-gray-200 rounded-t"
        ></div>
      ))}
    </div>
    <div className="bg-white border border-gray-200 rounded-md shadow-sm">
      <div className="p-5 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
  reviews = [],
}) => {
  const [activeTab, setActiveTab] = useState(1);
  const [questionText, setQuestionText] = useState("");

  // RTK Query hooks for Questions
  const { data: questionsData, isLoading: questionsLoading } =
    useGetProductQuestionsQuery(product?._id, {
      skip: !product?._id, // product না থাকলে fetch করবে না
    });
  const [createQuestion, { isLoading: isCreatingQuestion }] =
    useCreateQuestionMutation();

  const displayReviews = reviews?.length > 0 ? reviews : product?.reviews || [];
  const displayQuestions = questionsData || [];

  const sanitizedDescription = useMemo(
    () => DOMPurify.sanitize(product?.description || ""),
    [product?.description],
  );

  // নতুন প্রশ্ন সাবমিট করার হ্যান্ডলার
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error("Question cannot be empty");
      return;
    }
    try {
      await createQuestion({
        productId: product._id,
        question: questionText,
      }).unwrap();
      toast.success("Question submitted successfully!");
      setQuestionText("");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to submit question");
    }
  };

  if (!product) return <ProductTabsSkeleton />;

  return (
    <div className="flex flex-col space-y-4 font-sans text-gray-900 w-full ">
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 pb-px"
        role="tablist"
        aria-label="Product information tabs"
      >
        {TAB_NAMES.map((tab, index) => {
          const currentTabIdx = index + 1;
          const isSelected = activeTab === currentTabIdx;
          const tabId = `product-tab-${currentTabIdx}`;
          const panelId = `product-panel-${currentTabIdx}`;

          // ট্যাবের নামের সাথে সংখ্যা যুক্ত করা হলো
          let tabLabel = tab;
          if (tab === "Questions")
            tabLabel = `Questions (${displayQuestions.length})`;
          if (tab === "Reviews")
            tabLabel = `Reviews (${displayReviews.length})`;

          return (
            <button
              key={index}
              role="tab"
              id={tabId}
              aria-selected={isSelected}
              aria-controls={panelId}
              onClick={() => setActiveTab(currentTabIdx)}
              className={`px-4 py-2 text-[13px] font-bold rounded-t transition-all border-x border-t whitespace-nowrap outline-none focus:outline-none ${
                isSelected
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      <div
        className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
        role="tabpanel"
        id={`product-panel-${activeTab}`}
        aria-labelledby={`product-tab-${activeTab}`}
      >
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              {/* 1. Technical Specifications Grid Tab */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <h3 className="text-[16px] font-bold text-gray-900">
                    Specification
                  </h3>
                  {product.specifications?.length > 0 ? (
                    <div className="border border-gray-100 rounded overflow-hidden divide-y divide-gray-100">
                      {product.specifications.map((spec, idx) => (
                        <div
                          key={idx}
                          className="flex text-[14px] bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-1/3 p-3 bg-gray-50 font-medium text-blue-900 border-r border-gray-100 capitalize">
                            {spec.label}
                          </div>
                          <div className="w-2/3 p-3 text-gray-800 capitalize">
                            {spec.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-[14px]">
                      No explicit technical specification schema listed.
                    </p>
                  )}
                </div>
              )}

              {/* 2. Pure Description Display Container */}
              {activeTab === 2 && (
                <div className="prose max-w-none text-gray-800 text-[14px] leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                  />
                </div>
              )}

              {/* 3. Customer Inquiry / Question Panel */}
              {activeTab === 3 && (
                <div className="space-y-6">
                  {/* Questions Stream Container */}
                  <div className="space-y-3">
                    {questionsLoading ? (
                      <div className="text-center py-6 text-gray-500 text-[14px]">
                        Loading questions...
                      </div>
                    ) : displayQuestions.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-gray-200 rounded text-gray-500 text-[14px] bg-gray-50">
                        No questions have been asked about this product yet. Be
                        the first to ask!
                      </div>
                    ) : (
                      displayQuestions.map((q) => (
                        <div
                          key={q._id}
                          className="bg-white p-4 rounded border border-gray-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-sm"
                        >
                          <div className="flex-1 w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded bg-gray-800 text-white flex items-center justify-center text-[14px] font-bold">
                                {q.user?.username?.charAt(0).toUpperCase() ||
                                  "A"}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-[14px] block leading-tight">
                                  {q.user?.username || "Anonymous"}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {new Date(q.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 text-[14px] leading-relaxed mt-2 pl-12">
                              {q.question}
                            </p>

                            {/* এডমিন উত্তর দেখানোর অংশ */}
                            {q.isAnswered && q.answer && (
                              <div className="mt-3 ml-12 bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r-md">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                                    Answer from Veloura
                                  </span>
                                </div>
                                <p className="text-[13px] text-gray-700">
                                  {q.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Question Box Area */}
                  <div className="border-t border-gray-100 pt-6">
                    {userInfo ? (
                      <form
                        onSubmit={handleQuestionSubmit}
                        className="space-y-4 max-w-xl bg-gray-50 p-4 rounded border border-gray-200"
                      >
                        <h4 className="text-[15px] font-bold text-gray-900">
                          Ask a Question
                        </h4>
                        <div>
                          <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                            Your Question
                          </label>
                          <textarea
                            rows="3"
                            required
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Have a specific question about this product?"
                            className="w-full p-3 bg-white border border-gray-200 rounded outline-none text-[14px] resize-none text-gray-800 placeholder:text-gray-400 focus:border-blue-700"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={isCreatingQuestion}
                          className="bg-blue-700 hover:bg-blue-800 text-white px-5 h-9 rounded font-medium text-[13px] transition-all disabled:opacity-50"
                        >
                          {isCreatingQuestion
                            ? "Submitting..."
                            : "Submit Question"}
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-200">
                        <p className="text-gray-600 text-[14px]">
                          Please{" "}
                          <Link
                            to="/login"
                            className="text-blue-700 font-bold hover:underline"
                          >
                            Login
                          </Link>{" "}
                          to ask a question.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Complete Review Form + Feedback Feeds Panel */}
              {activeTab === 4 && (
                <div className="space-y-6">
                  {/* Reviews Stream Container */}
                  <div className="space-y-3">
                    {displayReviews.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-gray-200 rounded text-gray-500 text-[14px] bg-gray-50">
                        There are no reviews for this product yet.
                      </div>
                    ) : (
                      displayReviews.map((review) => (
                        <div
                          key={review._id}
                          className="bg-white p-4 rounded border border-gray-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-sm"
                        >
                          <div className="flex-1 w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded bg-blue-900 text-white flex items-center justify-center text-[14px] font-bold">
                                {review.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-[14px] block leading-tight">
                                  {review.name}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 text-[14px] leading-relaxed mt-2 pl-12">
                              {review.comment}
                            </p>

                            {/* এডমিন রিপ্লাই দেখানোর অংশ */}
                            {review.reply && review.reply.text && (
                              <div className="mt-3 ml-12 bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r-md">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                                    Reply from AriX Co
                                  </span>
                                  {review.reply.createdAt && (
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(
                                        review.reply.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[13px] text-gray-700">
                                  {review.reply.text}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="pl-12 sm:pl-0 self-start sm:self-center flex-shrink-0">
                            <Ratings value={review.rating} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Feedback Box Area */}
                  <div className="border-t border-gray-100 pt-6">
                    {userInfo ? (
                      <form
                        onSubmit={submitHandler}
                        className="space-y-4 max-w-xl bg-gray-50 p-4 rounded border border-gray-200"
                      >
                        <h4 className="text-[15px] font-bold text-gray-900">
                          Write a Review
                        </h4>
                        <div>
                          <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                            Select Rating
                          </label>
                          <select
                            required
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className="w-full sm:w-64 h-9 px-3 bg-white border border-gray-200 rounded outline-none text-[14px] text-gray-800 focus:border-blue-700"
                          >
                            <option value="">Choose...</option>
                            <option value="1">1 - Inferior</option>
                            <option value="2">2 - Decent</option>
                            <option value="3">3 - Great</option>
                            <option value="4">4 - Excellent</option>
                            <option value="5">5 - Exceptional</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                            Your Experience
                          </label>
                          <textarea
                            rows="3"
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about the product..."
                            className="w-full p-3 bg-white border border-gray-200 rounded outline-none text-[14px] resize-none text-gray-800 placeholder:text-gray-400 focus:border-blue-700"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={loadingProductReview}
                          className="bg-blue-700 hover:bg-blue-800 text-white px-5 h-9 rounded font-medium text-[13px] transition-all disabled:opacity-50"
                        >
                          {loadingProductReview
                            ? "Submitting..."
                            : "Submit Review"}
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-200">
                        <p className="text-gray-600 text-[14px]">
                          Please{" "}
                          <Link
                            to="/login"
                            className="text-blue-700 font-bold hover:underline"
                          >
                            Login
                          </Link>{" "}
                          to share your experience.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ── Memoized to prevent unnecessary re-renders ──
export default memo(ProductTabs);
