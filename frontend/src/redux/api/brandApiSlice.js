import { toast } from "react-toastify";
import { apiSlice } from "./apiSlice";
import { BRAND_URL, UPLOAD_URL } from "../constants";

export const brandApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------------- Get All Brands ---------------- */
    getBrands: builder.query({
      query: ({
        search = "",
        isActive,
        isFeatured,
        includeProducts,
        sort = "order",
        page,
        limit,
      } = {}) => ({
        url: BRAND_URL,
        params: {
          search,
          ...(isActive !== undefined && { isActive }),
          ...(isFeatured !== undefined && { isFeatured }),
          ...(includeProducts && { includeProducts }),
          sort,
          ...(page && { page }),
          ...(limit && { limit }),
        },
      }),
      providesTags: (result) =>
        result?.brands
          ? [
              ...result.brands.map(({ _id }) => ({
                type: "Brand",
                id: _id,
              })),
              { type: "Brand", id: "LIST" },
            ]
          : [{ type: "Brand", id: "LIST" }],
      keepUnusedDataFor: 60,
    }),

    /* ---------------- Get Brand by ID/Slug ---------------- */
    getBrandById: builder.query({
      query: (idOrSlug) => `${BRAND_URL}/${idOrSlug}`,
      providesTags: (result, error, id) => [
        { type: "Brand", id: result?._id || id },
      ],
    }),

    /* ---------------- Check Duplicate Name ---------------- */
    checkBrandName: builder.query({
      query: ({ name, excludeId }) => ({
        url: `${BRAND_URL}/check`,
        params: { name, excludeId },
      }),
      providesTags: ["BrandCheck"],
    }),

    /* ---------------- Create Brand ---------------- */
    createBrand: builder.mutation({
      query: (formData) => ({
        url: BRAND_URL,
        method: "POST",
        body: formData,
        // formData: true, // RTK Query automatically sets multipart/form-data if body is FormData
      }),
      invalidatesTags: [{ type: "Brand", id: "LIST" }],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Brand created successfully");
        } catch (error) {
          const msg = error?.error?.data?.error || "Failed to create brand";
          toast.error(msg);
        }
      },
    }),

    /* ---------------- Update Brand ---------------- */
    updateBrand: builder.mutation({
      query: ({ brandId, formData }) => ({
        url: `${BRAND_URL}/${brandId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { brandId }) => [
        { type: "Brand", id: brandId },
        { type: "Brand", id: "LIST" },
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Brand updated successfully");
        } catch (error) {
          const msg = error?.error?.data?.error || "Failed to update brand";
          toast.error(msg);
        }
      },
    }),

    /* ---------------- Delete Brand ---------------- */
    deleteBrand: builder.mutation({
      query: ({ brandId, force = false }) => ({
        url: `${BRAND_URL}/${brandId}?force=${force}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { brandId }) => [
        { type: "Brand", id: brandId },
        { type: "Brand", id: "LIST" },
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          toast.success(res?.data?.message || "Brand deleted");
        } catch (error) {
          const msg = error?.error?.data?.error || "Failed to delete brand";
          toast.error(msg);
        }
      },
    }),

    /* ---------------- Toggle Active Status ---------------- */
    toggleBrandActive: builder.mutation({
      query: (brandId) => ({
        url: `${BRAND_URL}/${brandId}/toggle-active`,
        method: "PUT",
      }),
      async onQueryStarted(brandId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          brandApiSlice.util.updateQueryData(
            "getBrands",
            undefined,
            (draft) => {
              const brand = draft.brands?.find((b) => b._id === brandId);
              if (brand) brand.isActive = !brand.isActive;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    /* ---------------- Toggle Featured Status ---------------- */
    toggleBrandFeatured: builder.mutation({
      query: (brandId) => ({
        url: `${BRAND_URL}/${brandId}/toggle-featured`,
        method: "PUT",
      }),
      async onQueryStarted(brandId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          brandApiSlice.util.updateQueryData(
            "getBrands",
            undefined,
            (draft) => {
              const brand = draft.brands?.find((b) => b._id === brandId);
              if (brand) brand.isFeatured = !brand.isFeatured;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    /* ---------------- Reorder Brands ---------------- */
    reorderBrands: builder.mutation({
      query: (brands) => ({
        url: `${BRAND_URL}/reorder`,
        method: "PUT",
        body: { brands },
      }),
      invalidatesTags: [{ type: "Brand", id: "LIST" }],
    }),

    uploadBrandImage: builder.mutation({
      query: (formData) => ({
        url: `${UPLOAD_URL}/brand`, 
        method: "POST",
        body: formData,
        formData: true,
      }),
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useCheckBrandNameQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useToggleBrandActiveMutation,
  useToggleBrandFeaturedMutation,
  useReorderBrandsMutation,
  useUploadBrandImageMutation,
} = brandApiSlice;
