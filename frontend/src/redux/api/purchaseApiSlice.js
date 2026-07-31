import { apiSlice } from "./apiSlice";
import { PURCHASE_URL } from "../constants";

export const purchaseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: ({ page = 1, keyword = "", status = "all" }) => ({
        url: `${PURCHASE_URL}?page=${page}&keyword=${keyword}&status=${status}`,
      }),
      providesTags: ["Purchase"],
    }),
    getPurchaseOrderById: builder.query({
      query: (id) => ({ url: `${PURCHASE_URL}/${id}` }),
      providesTags: (result, error, id) => [{ type: "Purchase", id }],
    }),
    createPurchaseOrder: builder.mutation({
      query: (data) => ({ url: PURCHASE_URL, method: "POST", body: data }),
      invalidatesTags: ["Purchase"],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PURCHASE_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Purchase"],
    }),
    deletePurchaseOrder: builder.mutation({
      query: (id) => ({ url: `${PURCHASE_URL}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Purchase"],
    }),
    receivePurchaseItems: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PURCHASE_URL}/${id}/receive`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Purchase", id },
        "Purchase",
        "Product",
      ],
    }),
    generateInvoice: builder.mutation({
      query: (id) => ({ url: `${PURCHASE_URL}/${id}/invoice`, method: "GET" }),
      invalidatesTags: ["Purchase"],
    }),
    recordPayment: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PURCHASE_URL}/${id}/payment`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Purchase"],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useReceivePurchaseItemsMutation,
  useGenerateInvoiceMutation,
  useRecordPaymentMutation,
} = purchaseApiSlice;
