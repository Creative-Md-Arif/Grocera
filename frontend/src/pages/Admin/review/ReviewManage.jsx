/* eslint-disable react/prop-types */
import { useState, memo, useMemo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import AdminMenu from "../AdminMenu";
import { 
  useGetAllReviewsQuery, 
  useToggleReviewFeatureMutation, 
  useDeleteReviewAdminMutation,
  useReplyToReviewMutation,
  useDeleteReviewReplyMutation
} from "@redux/api/reviewApiSlice";
import { toast } from "react-toastify";
import {
  FaStar,
  FaTrash,
  FaCheckCircle,
  FaCommentDots,
  FaReply,
  FaTimes,
  FaPaperPlane
} from "react-icons/fa";

// --- Skeleton Loaders ---
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white border border-gray-200 p-4 rounded-sm h-24 animate-pulse"></div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-14 border-b border-gray-100 last:border-0 animate-pulse bg-gray-50"></div>
    ))}
  </div>
);

// --- Rating Stars Component ---
const RatingStars = ({ rating }) => (
  <div className="flex items-center gap-0.5 text-yellow-500">
    {[...Array(5)].map((_, i) => (
      <FaStar key={i} size={10} className={i < rating ? "text-yellow-500" : "text-gray-300"} />
    ))}
  </div>
);

// --- Memoized Row ---
const ReviewRow = memo(function ReviewRow({
  review,
  index,
  handleDelete,
  handleToggleFeature,
  handleDeleteReply,
  openReplyModal,
  processingId,
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors align-top"
    >
      {/* Product & Comment */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={review.productImage || "https://via.placeholder.com/48"}
            alt={review.productName}
            className="w-12 h-12 object-cover rounded-sm border border-gray-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm text-black font-bold truncate max-w-[250px]">
              {review.productName}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[250px] italic mt-1">
              {review.comment}
            </p>
          </div>
        </div>
      </td>

      {/* User Info */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-black">{review.name}</span>
          <RatingStars rating={review.rating} />
        </div>
      </td>

      {/* Admin Reply Status */}
      <td className="px-4 py-3 hidden md:table-cell">
        {review.reply && review.reply.text ? (
          <div className="bg-blue-50 border border-blue-100 p-2 rounded-sm max-w-[200px]">
            <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
              <FaReply size={10} /> Admin Reply:
            </p>
            <p className="text-xs text-gray-700 italic">{review.reply.text}</p>
            <button 
              onClick={() => handleDeleteReply(review._id, review.productId)}
              className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase mt-1 flex items-center gap-1"
            >
              <FaTimes size={8} /> Remove Reply
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">No reply yet</span>
        )}
      </td>

      {/* Status (Featured) */}
      <td className="px-4 py-3">
        <span
          className={`bg-white border text-sm font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-flex items-center gap-1 ${
            review.isFeatured
              ? "text-yellow-600 border-yellow-500 bg-yellow-50"
              : "text-gray-500 border-gray-300"
          }`}
        >
          <FaStar size={10} />
          {review.isFeatured ? "Featured" : "Normal"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="inline-flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => openReplyModal(review)}
            className="py-2 px-3 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1"
          >
            <FaReply size={12} /> Reply
          </button>

          <button
            onClick={() => handleToggleFeature(review._id, review.productId, review.isFeatured)}
            disabled={processingId === review._id}
            className={`py-2 px-3 border text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1 disabled:opacity-50 ${
              review.isFeatured
                ? "border-gray-200 text-gray-600 hover:bg-gray-600 hover:text-white hover:border-gray-600"
                : "border-yellow-200 text-yellow-600 hover:bg-yellow-600 hover:text-white hover:border-yellow-600"
            }`}
          >
            <FaStar size={12} /> {review.isFeatured ? "Unfeature" : "Feature"}
          </button>

          <button
            onClick={() => handleDelete(review._id, review.productId)}
            disabled={processingId === review._id}
            className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1 disabled:opacity-50"
          >
            {processingId === review._id ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaTrash size={12} /> Del
              </>
            )}
          </button>
        </div>
      </td>
    </motion.tr>
  );
});

ReviewRow.propTypes = {
  review: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleToggleFeature: PropTypes.func.isRequired,
  handleDeleteReply: PropTypes.func.isRequired,
  openReplyModal: PropTypes.func.isRequired,
  processingId: PropTypes.string,
};

const ReviewManage = () => {
  const [processingId, setProcessingId] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading, refetch } = useGetAllReviewsQuery();
  const [toggleFeature] = useToggleReviewFeatureMutation();
  const [deleteReview] = useDeleteReviewAdminMutation();
  const [replyToReview] = useReplyToReviewMutation();
  const [deleteReply] = useDeleteReviewReplyMutation();

  const reviews = useMemo(() => data?.reviews || [], [data]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const featured = reviews.filter((r) => r.isFeatured).length;
    const avgRating = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : 0;
    return { total, featured, avgRating };
  }, [reviews]);

  const handleToggleFeature = async (reviewId, productId, currentStatus) => {
    setProcessingId(reviewId);
    try {
      await toggleFeature({ productId, reviewId }).unwrap();
      toast.success(`Review ${currentStatus ? "unfeatured" : "featured"} successfully`);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (reviewId, productId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setProcessingId(reviewId);
    try {
      await deleteReview({ productId, reviewId }).unwrap();
      toast.success("Review deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete review");
    } finally {
      setProcessingId(null);
    }
  };

  const openReplyModal = (review) => {
    setCurrentReview(review);
    setReplyText(review.reply?.text || "");
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return toast.error("Reply cannot be empty");
    
    setProcessingId(currentReview._id);
    try {
      await replyToReview({ 
        productId: currentReview.productId, 
        reviewId: currentReview._id, 
        text: replyText 
      }).unwrap();
      toast.success("Reply added successfully");
      setIsReplyModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add reply");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteReply = async (reviewId, productId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    setProcessingId(reviewId);
    try {
      await deleteReply({ productId, reviewId }).unwrap();
      toast.success("Reply deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete reply");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                Manage Product Reviews
              </h2>
            </div>
            <button 
              onClick={refetch}
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              Refresh Reviews
            </button>
          </header>

          {/* Stats Cards */}
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaCommentDots className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Total Reviews
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.total}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaStar className="text-xl text-yellow-500" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Featured
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.featured}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaCheckCircle className="text-xl text-green-500" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Avg Rating
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.avgRating} / 5
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Table */}
          {isLoading ? (
            <TableSkeleton />
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-sm bg-white">
              <FaCommentDots className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                No reviews found.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      Product & Comment
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      User & Rating
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell">
                      Admin Reply
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-widest text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review, index) => (
                    <ReviewRow
                      key={review._id}
                      review={review}
                      index={index}
                      handleDelete={handleDelete}
                      handleToggleFeature={handleToggleFeature}
                      handleDeleteReply={handleDeleteReply}
                      openReplyModal={openReplyModal}
                      processingId={processingId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Reply Modal */}
      <AnimatePresence>
        {isReplyModalOpen && currentReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsReplyModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-sm w-full max-w-lg p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h3 className="text-lg font-bold uppercase tracking-wider">Reply to Review</h3>
                <button onClick={() => setIsReplyModalOpen(false)} className="text-gray-500 hover:text-black">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="mb-4 bg-gray-50 p-3 rounded-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Original Review by <span className="font-bold">{currentReview.name}</span>:</p>
                <p className="text-sm text-gray-800 italic">{currentReview.comment}</p>
              </div>

              <form onSubmit={handleReplySubmit}>
                <label className="block text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">
                  Your Reply
                </label>
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black text-sm"
                  required
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsReplyModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-bold uppercase tracking-widest hover:bg-gray-100 rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === currentReview._id}
                    className="px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 rounded-sm inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {processingId === currentReview._id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaPaperPlane size={12} /> Submit Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewManage;