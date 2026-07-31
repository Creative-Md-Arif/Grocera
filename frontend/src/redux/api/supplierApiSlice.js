import { apiSlice } from "./apiSlice";
import { SUPPLIER_URL } from "../constants"; 

export const supplierApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ১. সব সাপ্লায়ার দেখা
    getSuppliers: builder.query({
      query: () => ({
        url: SUPPLIER_URL,
      }),
      providesTags: ["Supplier"],
    }),

    // ২. নতুন সাপ্লায়ার তৈরি
    createSupplier: builder.mutation({
      query: (data) => ({
        url: SUPPLIER_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supplier"],
    }),

    // ৩. সাপ্লায়ার আপডেট
    updateSupplier: builder.mutation({
      query: ({ id, data }) => ({
        url: `${SUPPLIER_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Supplier"],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} = supplierApiSlice;
