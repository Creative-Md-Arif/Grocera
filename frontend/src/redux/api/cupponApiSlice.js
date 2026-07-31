import { apiSlice } from "./apiSlice";
import { CUPPON_URL } from "../constants";

export const cupponApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================
    //  ADMIN: Create Coupon
    // ============================================
    createCuppon: builder.mutation({
      query: (newCuppon) => ({
        url: `${CUPPON_URL}`,
        method: "POST",
        body: newCuppon,
      }),
      invalidatesTags: ["Cuppon"],
    }),

    // ============================================
    //  ADMIN: Update Coupon
    // ============================================
    updateCuppon: builder.mutation({
      query: ({ cupponId, updatedCuppon }) => ({
        url: `${CUPPON_URL}/${cupponId}`,
        method: "PUT",
        body: updatedCuppon,
      }),
      invalidatesTags: ["Cuppon"],
    }),

    // ============================================
    //  ADMIN: Delete Coupon
    // ============================================
    deleteCuppon: builder.mutation({
      query: (cupponId) => ({
        url: `${CUPPON_URL}/${cupponId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cuppon"],
    }),

    // ============================================
    //  ADMIN: Toggle Coupon Active Status
    // ============================================
    toggleCupponStatus: builder.mutation({
      query: (cupponId) => ({
        url: `${CUPPON_URL}/${cupponId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["Cuppon"],
    }),

    // ============================================
    //  USER: Validate Coupon (POST request)
    // ============================================
    validateCuppon: builder.mutation({
      query: (data) => ({
        url: `${CUPPON_URL}/validate`,
        method: "POST",
        body: data, // { code, itemsPrice, productIds }
      }),
    }),

    // ============================================
    //  ADMIN: Get All Coupons (with pagination & filters)
    // ============================================
    getCuppons: builder.query({
      query: ({ pageNumber, keyword, isActive } = {}) => ({
        url: `${CUPPON_URL}`,
        params: {
          page: pageNumber,
          search: keyword,
          isActive: isActive,
        },
      }),
      providesTags: ["Cuppon"],
    }),

    // ============================================
    //  PUBLIC: Get Active Coupons
    // ============================================
    getActiveCuppons: builder.query({
      query: () => `${CUPPON_URL}/active`,
      providesTags: ["Cuppon"],
    }),

    // ============================================
    //  ADMIN: Get Coupon Details by ID
    // ============================================
    getCupponDetails: builder.query({
      query: (cupponId) => `${CUPPON_URL}/${cupponId}`,
      providesTags: (result, error, id) => [{ type: "Cuppon", id }],
    }),

    // ============================================
    //  ADMIN: Get Coupon Usage Stats
    // ============================================
    getCupponStats: builder.query({
      query: (cupponId) => `${CUPPON_URL}/${cupponId}/stats`,
      providesTags: (result, error, id) => [
        { type: "Cuppon", id: `STATS-${id}` },
      ],
    }),
  }),
});

export const {
  useCreateCupponMutation,
  useUpdateCupponMutation,
  useDeleteCupponMutation,
  useToggleCupponStatusMutation,
  useValidateCupponMutation,
  useGetCupponsQuery,
  useGetActiveCupponsQuery,
  useGetCupponDetailsQuery,
  useGetCupponStatsQuery,
  useLazyGetCupponStatsQuery,
} = cupponApiSlice;
