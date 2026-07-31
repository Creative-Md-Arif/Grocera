import { apiSlice } from "./apiSlice.js";
import { CAMPAIGN_URL, UPLOAD_URL } from "../constants.js";

export const campaignApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------- PUBLIC ----------------

    getActiveCampaigns: builder.query({
      query: () => `${CAMPAIGN_URL}/active`,
      providesTags: ["Campaign"],
    }),

    getCampaignById: builder.query({
      query: (id) => `${CAMPAIGN_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: "Campaign", id }],
    }),

    getCampaignProducts: builder.query({
      query: (id) => `${CAMPAIGN_URL}/${id}/products`,
      providesTags: (result, error, id) => [{ type: "Campaign", id }],
    }),

    // ---------------- ADMIN ----------------

    getAllCampaigns: builder.query({
      query: (params) => ({
        url: `${CAMPAIGN_URL}`,
        params,
      }),
      providesTags: ["Campaign"],
    }),

    createCampaign: builder.mutation({
      query: (data) => ({
        url: `${CAMPAIGN_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),

    updateCampaign: builder.mutation({
      query: ({ id, data }) => ({
        url: `${CAMPAIGN_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Campaign",
        { type: "Campaign", id },
      ],
    }),

    deleteCampaign: builder.mutation({
      query: (id) => ({
        url: `${CAMPAIGN_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),

    toggleCampaignStatus: builder.mutation({
      query: (id) => ({
        url: `${CAMPAIGN_URL}/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        "Campaign",
        { type: "Campaign", id },
      ],
    }),

    // ---------------- IMAGE UPLOAD ----------------

    uploadCampaignBanner: builder.mutation({
      query: (formData) => ({
        url: `${UPLOAD_URL}/banner`,
        method: "POST",
        body: formData,
        formData: true, // ⭐ এটা না দিলে header ঠিকমতো set হবে না
      }),
      invalidatesTags: ["Campaign"],
    }),
  }),
});

export const {
  useGetActiveCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetCampaignProductsQuery,
  useGetAllCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useToggleCampaignStatusMutation,
  useUploadCampaignBannerMutation,
} = campaignApiSlice;
