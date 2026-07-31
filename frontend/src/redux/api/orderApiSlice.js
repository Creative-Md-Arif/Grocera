import { apiSlice } from "./apiSlice";
import { ORDERS_URL, ORDER_PAY_URL } from "../constants";
export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Order"], // নতুন অর্ডার হলে লিস্ট রিফ্রেশ হবে
    }),

    // orderApiSlice.js এর endpoints এর ভেতরে যুক্ত করুন
    createManualOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/manual`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Products", "Product"], // অর্ডার ও প্রোডাক্ট লিস্ট রিফ্রেশ হবে
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details, status }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body: { details, status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order", // লিস্ট রিফ্রেশ করার জন্য
      ],
    }),
    getPaypalClientId: builder.query({
      query: () => ({
        url: ORDER_PAY_URL,
      }),
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Order", id: _id })),
              { type: "Order", id: "MY_LIST" },
            ]
          : [{ type: "Order", id: "MY_LIST" }],
    }),
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Order", id: _id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: "Order", id: orderId },
        "Order",
      ],
    }),
    // endpoints: (builder) => ({ ... }) এর ভিতরে এটি যোগ করুন
    getOrderTrackingHistory: builder.query({
      query: (orderId) => `/api/track/${orderId}`, // আপনার ব্যাকএন্ডের ট্র্যাকিং রাউট
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status, courierName, courierTrackingId }) => ({
        // ✅ নতুন প্যারামিটার যোগ করা হলো
        url: `${ORDERS_URL}/${orderId}/status`,
        method: "PUT",
        body: { status, courierName, courierTrackingId },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order",
      ],
    }),
  }),
});
export const {
  useCreateOrderMutation,
  useCreateManualOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
  useGetOrderTrackingHistoryQuery,
  useUpdateOrderStatusMutation,
} = orderApiSlice;
