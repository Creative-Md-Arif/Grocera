import { apiSlice } from "./apiSlice";
import { PAYMENTS_URL } from "../constants";

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query({
      query: () => `${PAYMENTS_URL}/methods`,
      keepUnusedDataFor: 5,
    }),

    getPaymentStats: builder.query({
      query: () => `${PAYMENTS_URL}/stats`,
      keepUnusedDataFor: 5,
    }),

    checkTransactionId: builder.query({
      query: (transactionId) => ({
        url: `${PAYMENTS_URL}/check-transaction/${transactionId}`,
        method: "GET",
      }),
      providesTags: ["Payment"],
      keepUnusedDataFor: 1,
    }),

    updatePaymentMethod: builder.mutation({
      query: (data) => ({
        url: `${PAYMENTS_URL}/methods`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PaymentMethods"],
    }),

    deletePaymentMethod: builder.mutation({
      query: (type) => ({
        url: `${PAYMENTS_URL}/methods/${type}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentMethods"],
    }),

    submitManualPayment: builder.mutation({
      query: ({ orderId, data }) => ({
        url: `${PAYMENTS_URL}/submit/${orderId}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json", // ⭐ Explicitly set JSON
        },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
      ],
    }),

    verifyManualPayment: builder.mutation({
      query: ({ orderId, status, notes }) => ({
        url: `${PAYMENTS_URL}/verify/${orderId}`,
        method: "PUT",
        body: { status, notes },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order",
      ],
    }),

    initSSLCommerz: builder.mutation({
      query: (orderId) => ({
        url: `${PAYMENTS_URL}/sslcommerz/init`,
        method: "POST",
        body: { orderId },
      }),
      invalidatesTags: ["Order"], // অর্ডার আপডেট করার জন্য ক্যাশ ইনভ্যালিডেট
    }),

    validateSSLCommerzPayment: builder.mutation({
      query: (val_id) => ({
        url: `${PAYMENTS_URL}/sslcommerz/validate`,
        method: "POST",
        body: { val_id },
      }),
      invalidatesTags: ["Order"], // অর্ডার আপডেট করার জন্য ক্যাশ ইনভ্যালিডেট
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useGetPaymentStatsQuery,
  useCheckTransactionIdQuery,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useSubmitManualPaymentMutation,
  useVerifyManualPaymentMutation,
  useInitSSLCommerzMutation, // ✅ নতুন হুক এক্সপোর্ট
  useValidateSSLCommerzPaymentMutation,
} = paymentApiSlice;
