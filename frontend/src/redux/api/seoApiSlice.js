import { apiSlice } from "../api/apiSlice";
import { SEO_URL } from "../constants";

export const seoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSeoSettings: builder.query({
      query: () => ({
        url: `${SEO_URL}`,
        method: "GET",
      }),
      providesTags: ["SEO"],
    }),
    updateSeoSettings: builder.mutation({
      query: (data) => ({
        url: `${SEO_URL}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SEO"],
    }),
  }),
});

export const { useGetSeoSettingsQuery, useUpdateSeoSettingsMutation } =
  seoApiSlice;
