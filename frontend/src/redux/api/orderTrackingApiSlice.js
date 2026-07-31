import { apiSlice } from "./apiSlice";
import { TRACKING_URL } from "../constants";

export const orderTrackingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ১. পাবলিক ট্র্যাকিং (কোনো লগইন ছাড়াই ইমেইল ও অর্ডার আইডি দিয়ে)
    trackOrderPublic: builder.query({
      query: ({ orderId, email }) => ({
        url: TRACKING_URL,
        params: { orderId, email }, // Query params হিসেবে যাবে
      }),
      keepUnusedDataFor: 5, // ৫ সেকেন্ডের জন্য ক্যাশ রাখবে
    }),

    // ২. অ্যাডমিন / কুরিয়ার Webhook থেকে ম্যানুয়ালি ইভেন্ট পুশ করা
    addTrackingEvent: builder.mutation({
      query: ({ orderId, body }) => ({
        url: `${TRACKING_URL}/${orderId}/events`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Order"], // অর্ডার লিস্ট রিফ্রেশ করবে
    }),

    // ৩. অ্যাডমিন প্যানেলে নির্দিষ্ট অর্ডারের পুরো ট্র্যাকিং হিস্ট্রি দেখা
    getTrackingHistory: builder.query({
      query: (orderId) => ({
        url: `${TRACKING_URL}/${orderId}`,
      }),
      providesTags: (result, error, orderId) => [
        { type: "Order", id: orderId },
      ],
    }),
  }),
});

export const {
  useTrackOrderPublicQuery,
  useAddTrackingEventMutation,
  useGetTrackingHistoryQuery,
} = orderTrackingApiSlice;
