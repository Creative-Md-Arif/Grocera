import { toast } from "react-toastify";
import { PRODUCT_URL, UPLOAD_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({
        keyword = "",
        page = 1,
        sort = "newest",
        minPrice,
        maxPrice,
        category,
      }) => ({
        url: `${PRODUCT_URL}`,
        params: {
          keyword,
          page,
          sort,
          ...(minPrice !== undefined && minPrice !== 0 && { minPrice }),
          ...(maxPrice !== undefined && maxPrice !== 100000 && { maxPrice }),
          ...(category && { category }),
        },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Products"],
    }),

    getProductById: builder.query({
      query: (productId) => `${PRODUCT_URL}/${productId}`,
      providesTags: (result, error, productId) => [
        { type: "Product", id: productId },
      ],
    }),

    allProducts: builder.query({
      query: () => `${PRODUCT_URL}/allProducts`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Product", id: _id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: `${PRODUCT_URL}`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Products", { type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
        "Products",
      ],
    }),

    uploadProductImage: builder.mutation({
      query: (formData) => ({
        url: `${UPLOAD_URL}`,
        method: "POST",
        body: formData,
        formData: true,
      }),
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, productId) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
        "Products",
      ],
    }),

    getNewArrivals: builder.query({
      query: (limit = 8) => `${PRODUCT_URL}/new-arrivals?limit=${limit}`,
      keepUnusedDataFor: 5,
      providesTags: ["NewArrivals"],
    }),

    getBestSellers: builder.query({
      query: (limit = 8) => `${PRODUCT_URL}/best-sellers?limit=${limit}`,
      keepUnusedDataFor: 5,
      providesTags: ["BestSellers"],
    }),

    updateSalesCount: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/update-sales`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BestSellers"],
    }),

    toggleFeatured: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}/toggle-featured`,
        method: "PUT",
      }),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productApiSlice.util.updateQueryData(
            "allProducts",
            undefined,
            (draft) => {
              const product = draft.find((p) => p._id === productId);
              if (product) {
                product.isFeatured = !product.isFeatured;
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, productId) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),

    // ==========================================
    // ✅ Optimistic Update Added Here
    // ==========================================
    updateProductFields: builder.mutation({
      query: ({ productId, fields }) => {
        const formData = new FormData();
        Object.keys(fields).forEach((key) => {
          formData.append(key, fields[key]);
        });

        return {
          url: `${PRODUCT_URL}/${productId}/fields`,
          method: "PUT",
          body: formData,
          formData: true,
        };
      },
      async onQueryStarted(
        { productId, fields },
        { dispatch, queryFulfilled },
      ) {
        // Optimistically update the cache
        const patchResult = dispatch(
          productApiSlice.util.updateQueryData(
            "allProducts",
            undefined,
            (draft) => {
              const product = draft.find((p) => p._id === productId);
              if (product) {
                if (fields.showOnHomepage !== undefined) {
                  product.showOnHomepage =
                    fields.showOnHomepage === true ||
                    fields.showOnHomepage === "true";
                }
                if (fields.homepageOrder !== undefined) {
                  product.homepageOrder = Number(fields.homepageOrder) || 0;
                }
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          // If fails, revert back
          patchResult.undo();
          toast.error("Failed to update product status");
        }
      },
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
        "Products",
        "NewArrivals",
      ],
    }),

    getFilteredProducts: builder.query({
      query: ({ checked, radio }) => ({
        url: `${PRODUCT_URL}/filtered-products`,
        method: "POST",
        body: { checked, radio },
      }),
    }),

    getRelatedProducts: builder.query({
      query: ({ productId, limit = 4 }) => ({
        url: `${PRODUCT_URL}/related/${productId}?limit=${limit}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, { productId }) => [
        { type: "RelatedProducts", id: productId },
      ],
    }),
  }),
});

export const {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useAllProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useGetFilteredProductsQuery,
  useGetNewArrivalsQuery,
  useGetBestSellersQuery,
  useToggleFeaturedMutation,
  useUpdateSalesCountMutation,
  useGetRelatedProductsQuery,
  useUpdateProductFieldsMutation,
} = productApiSlice;
