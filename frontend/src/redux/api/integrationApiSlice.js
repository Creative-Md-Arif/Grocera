import { apiSlice } from "./apiSlice";
import { INTEGRATION_URL } from "../constants";

export const integrationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIntegrations: builder.query({
      query: () => ({
        url: INTEGRATION_URL,
      }),
      providesTags: ["Integration"],
    }),

    createIntegration: builder.mutation({
      query: (data) => ({
        url: INTEGRATION_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Integration"],
    }),

    // ✅ নতুন আপডেট এন্ডপয়েন্ট যুক্ত করা হয়েছে
    updateIntegration: builder.mutation({
      query: ({ id, data }) => ({
        url: `${INTEGRATION_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Integration"],
    }),

    deleteIntegration: builder.mutation({
      query: (id) => ({
        url: `${INTEGRATION_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Integration"],
    }),
  }),
});

export const {
  useGetIntegrationsQuery,
  useCreateIntegrationMutation,
  useUpdateIntegrationMutation, 
  useDeleteIntegrationMutation,
} = integrationApiSlice;
