import { BANNER_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const bannerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC QUERIES ====================

    // সক্রিয় ব্যানার পাওয়া
    getActiveBanners: builder.query({
      query: ({ type, page, device } = {}) => ({
        url: `${BANNER_URL}/active`,
        params: { type, page, device },
      }),
      providesTags: ["Banners"],
    }),

    // হিরো ব্যানার
    getHeroBanners: builder.query({
      query: (device) => ({
        url: `${BANNER_URL}/hero`,
        params: { device },
      }),
      providesTags: ["HeroBanners"],
    }),

    // ক্যাটাগরি ব্যানার
    getCategoryBanners: builder.query({
      query: (device) => ({
        url: `${BANNER_URL}/category`,
        params: { device },
      }),
      providesTags: ["CategoryBanners"],
    }),

    // প্রমোশনাল ব্যানার
    getPromotionalBanners: builder.query({
      query: (device) => ({
        url: `${BANNER_URL}/promotional`,
        params: { device },
      }),
      providesTags: ["PromotionalBanners"],
    }),

    // পপ-আপ ব্যানার
    getPopupBanner: builder.query({
      query: (device) => ({
        url: `${BANNER_URL}/popup`,
        params: { device },
      }),
      providesTags: ["PopupBanner"],
    }),

    // টপ বার ব্যানার
    getTopBarBanner: builder.query({
      query: () => `${BANNER_URL}/top-bar`,
      providesTags: ["TopBarBanner"],
    }),

    // ফুটার ব্যানার
    getFooterBanners: builder.query({
      query: (device) => ({
        url: `${BANNER_URL}/footer`,
        params: { device },
      }),
      providesTags: ["FooterBanners"],
    }),

    // সাইডবার ব্যানার
    getSidebarBanners: builder.query({
      query: (device) => ({
        url: `${BANNER_URL}/sidebar`,
        params: { device },
      }),
      providesTags: ["SidebarBanners"],
    }),

    // ==================== ADMIN QUERIES ====================

    // সব ব্যানার পাওয়া (অ্যাডমিন)
    getAllBanners: builder.query({
      query: ({ type, isActive } = {}) => ({
        url: `${BANNER_URL}`,
        params: { type, isActive },
      }),
      providesTags: ["Banners"],
    }),

    // নির্দিষ্ট ব্যানার পাওয়া
    getBannerById: builder.query({
      query: (bannerId) => `${BANNER_URL}/${bannerId}`,
      providesTags: (result, error, bannerId) => [
        { type: "Banner", id: bannerId },
      ],
    }),

    // ব্যানার স্ট্যাটিস্টিক্স
    getBannerStats: builder.query({
      query: () => `${BANNER_URL}/stats/overview`,
      providesTags: ["BannerStats"],
    }),

    // ==================== MUTATIONS ====================

    // নতুন ব্যানার তৈরি
    createBanner: builder.mutation({
      query: (bannerData) => ({
        url: `${BANNER_URL}`,
        method: "POST",
        body: bannerData,
      }),
      invalidatesTags: [
        "Banners",
        "HeroBanners",
        "CategoryBanners",
        "PromotionalBanners",
        "PopupBanner",
        "TopBarBanner",
        "FooterBanners",
        "SidebarBanners",
        "BannerStats",
      ],
    }),

    // ব্যানার আপডেট
    updateBanner: builder.mutation({
      query: ({ bannerId, bannerData }) => ({
        url: `${BANNER_URL}/${bannerId}`,
        method: "PUT",
        body: bannerData,
      }),
      invalidatesTags: (result, error, { bannerId }) => [
        { type: "Banner", id: bannerId },
        "Banners",
        "HeroBanners",
        "CategoryBanners",
        "PromotionalBanners",
        "PopupBanner",
        "TopBarBanner",
        "FooterBanners",
        "SidebarBanners",
      ],
    }),

    // ব্যানার স্ট্যাটাস টগল
    toggleBannerStatus: builder.mutation({
      query: (bannerId) => ({
        url: `${BANNER_URL}/${bannerId}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, bannerId) => [
        { type: "Banner", id: bannerId },
        "Banners",
        "HeroBanners",
        "CategoryBanners",
        "PromotionalBanners",
        "PopupBanner",
        "TopBarBanner",
        "FooterBanners",
        "SidebarBanners",
        "BannerStats",
      ],
    }),

    // ব্যানার পজিশন আপডেট
    updateBannerPosition: builder.mutation({
      query: ({ bannerId, position }) => ({
        url: `${BANNER_URL}/${bannerId}/position`,
        method: "PATCH",
        body: { position },
      }),
      invalidatesTags: [
        "Banners",
        "HeroBanners",
        "CategoryBanners",
        "PromotionalBanners",
        "PopupBanner",
        "TopBarBanner",
        "FooterBanners",
        "SidebarBanners",
      ],
    }),

    // ক্লিক কাউন্ট বাড়ানো
    incrementBannerClicks: builder.mutation({
      query: (bannerId) => ({
        url: `${BANNER_URL}/${bannerId}/click`,
        method: "POST",
      }),
    }),

    // ব্যানার ডিলিট
    deleteBanner: builder.mutation({
      query: (bannerId) => ({
        url: `${BANNER_URL}/${bannerId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Banners",
        "HeroBanners",
        "CategoryBanners",
        "PromotionalBanners",
        "PopupBanner",
        "TopBarBanner",
        "FooterBanners",
        "SidebarBanners",
        "BannerStats",
      ],
    }),

    // একাধিক ব্যানার ডিলিট
    deleteMultipleBanners: builder.mutation({
      query: (ids) => ({
        url: `${BANNER_URL}/delete-multiple`,
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: [
        "Banners",
        "HeroBanners",
        "CategoryBanners",
        "PromotionalBanners",
        "PopupBanner",
        "TopBarBanner",
        "FooterBanners",
        "SidebarBanners",
        "BannerStats",
      ],
    }),
  }),
});

export const {
  // Public queries
  useGetActiveBannersQuery,
  useGetHeroBannersQuery,
  useGetCategoryBannersQuery,
  useGetPromotionalBannersQuery,
  useGetPopupBannerQuery,
  useGetTopBarBannerQuery,
  useGetFooterBannersQuery,
  useGetSidebarBannersQuery,

  // Admin queries
  useGetAllBannersQuery,
  useGetBannerByIdQuery,
  useGetBannerStatsQuery,

  // Mutations
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerStatusMutation,
  useUpdateBannerPositionMutation,
  useIncrementBannerClicksMutation,
  useDeleteBannerMutation,
  useDeleteMultipleBannersMutation,
} = bannerApiSlice;
