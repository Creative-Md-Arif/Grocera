import { apiSlice } from "./apiSlice.js";
import { SITE_SETTING_URL } from "../constants";


export const siteSettingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSiteSettings: builder.query({
      query: () => ({
        url: SITE_SETTING_URL,
      }),
      providesTags: ["SiteSetting"],
      keepUnusedDataFor: 3600, // ফুটার বারবার fetch না করে কিছুক্ষণ cache থাকবে
    }),

    updateSiteSettings: builder.mutation({
      query: (data) => ({
        url: SITE_SETTING_URL,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SiteSetting"],
    }),
  }),
});

export const { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } =
  siteSettingApiSlice;
