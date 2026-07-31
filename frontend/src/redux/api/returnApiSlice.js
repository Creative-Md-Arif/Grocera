import { apiSlice } from "./apiSlice";
import { RETURNS_URL } from "../constants";

export const returnApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ১. কাস্টমার: নিজের রিটার্ন লিস্ট দেখা
    getMyReturns: builder.query({
      query: () => `${RETURNS_URL}/my`,
      providesTags: ["Return"],
    }),

    // ২. অ্যাডমিন: সব রিটার্ন রিকোয়েস্ট দেখা (অপশনাল status ফিল্টার সহ)
    getReturnRequests: builder.query({
      query: (status) => ({
        url: RETURNS_URL,
        params: status ? { status } : {},
      }),
      providesTags: ["Return"],
    }),

    // ৩. কাস্টমার: নতুন রিটার্ন রিকোয়েস্ট করা
    requestOrderReturn: builder.mutation({
      query: ({ orderId, body }) => ({
        url: `${RETURNS_URL}/${orderId}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Return", "Order"], // Order ট্যাগ ইনভ্যালিডেট করা হচ্ছে কারণ hasActiveReturn পরিবর্তন হচ্ছে
    }),

    // ৪. অ্যাডমিন: রিটার্ন অ্যাপ্রুভ/রিজেক্ট করা
    reviewReturnRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `${RETURNS_URL}/${id}/review`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Return", "Order"],
    }),

    // ৫. অ্যাডমিন: পিকআপ সম্পন্ন মার্ক করা
    markReturnPickedUp: builder.mutation({
      query: (id) => ({
        url: `${RETURNS_URL}/${id}/pickup`,
        method: "PUT",
      }),
      invalidatesTags: ["Return"],
    }),

    // ৬. অ্যাডমিন: রিফান্ড প্রসেস করা
    processRefund: builder.mutation({
      query: ({ id, body }) => ({
        url: `${RETURNS_URL}/${id}/refund`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Return", "Order"], // Order ট্যাগ ইনভ্যালিডেট করা হচ্ছে কারণ paymentStatus পরিবর্তন হচ্ছে
    }),
  }),
});

export const {
  useGetMyReturnsQuery,
  useGetReturnRequestsQuery,
  useRequestOrderReturnMutation,
  useReviewReturnRequestMutation,
  useMarkReturnPickedUpMutation,
  useProcessRefundMutation,
} = returnApiSlice;
