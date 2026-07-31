import { apiSlice } from "./apiSlice";
import { REVIEW_URL } from "../constants";

export const reviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ১. হোম পেজের জন্য ফিচার্ড রিভিউ আনা
    getFeaturedReviews: builder.query({
      query: () => ({
        url: `${REVIEW_URL}/featured`,
      }),
      providesTags: ["Review"],
    }),


    getAllReviews: builder.query({
      query: () => ({
        url: `${REVIEW_URL}/admin/all`,
      }),
      providesTags: ["Review"],
    }),


    deleteReviewAdmin: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `${REVIEW_URL}/admin/${productId}/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review"],
    }),

    // ২. নির্দিষ্ট প্রোডাক্টের রিভিউ আনা
    getProductReviews: builder.query({
      query: (productId) => ({
        url: `${REVIEW_URL}/${productId}`,
      }),
      providesTags: [{ type: "Review", id: "LIST" }],
    }),

    // ৩. নতুন রিভিউ পোস্ট করা
    addProductReview: builder.mutation({
      query: ({ productId, rating, comment }) => ({
        url: `${REVIEW_URL}/${productId}/reviews`,
        method: "POST",
        body: { rating, comment },
      }),
      invalidatesTags: [{ type: "Review", id: "LIST" }, "Product"],
    }),

    // ৪. রিভিউ হেল্পফুল মার্ক করা
    markReviewHelpful: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `${REVIEW_URL}/${productId}/${reviewId}/helpful`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Review", id: "LIST" }],
    }),

    // ৫. এডমিন: রিভিউ ফিচার্ড করা/আনফিচার্ড করা
    toggleReviewFeature: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `${REVIEW_URL}/${productId}/${reviewId}/feature`,
        method: "PUT",
      }),
      invalidatesTags: ["Review"],
    }),

    // ৬. এডমিন: রিভিউয়ের রিপ্লাই দেওয়া
    replyToReview: builder.mutation({
      query: ({ productId, reviewId, text }) => ({
        url: `${REVIEW_URL}/${productId}/${reviewId}/reply`,
        method: "PUT",
        body: { text },
      }),
      invalidatesTags: [{ type: "Review", id: "LIST" }],
    }),

    // ৭. এডমিন: রিভিউয়ের রিপ্লাই ডিলিট করা
    deleteReviewReply: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `${REVIEW_URL}/${productId}/${reviewId}/reply`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Review", id: "LIST" }],
    }),
  }),
});

export const {
  useGetFeaturedReviewsQuery,
  useGetProductReviewsQuery,
  useAddProductReviewMutation,
  useMarkReviewHelpfulMutation,
  useToggleReviewFeatureMutation,
  useReplyToReviewMutation,
  useDeleteReviewReplyMutation,
  useGetAllReviewsQuery,
  useDeleteReviewAdminMutation,
} = reviewApiSlice;
