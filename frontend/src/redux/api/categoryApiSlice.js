import { apiSlice } from "./apiSlice";
import { CATEGORY_URL } from "../constants";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (newCategory) => ({
        url: `${CATEGORY_URL}`,
        method: "POST",
        body: newCategory, // এখানে { name, image, parent } অবজেক্ট আসবে
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: ({ categoryId, updatedCategory }) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "PUT",
        body: updatedCategory, // এখানে { name, image, parent, isActive } অবজেক্ট আসবে
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    fetchCategories: builder.query({
      query: () => `${CATEGORY_URL}/categories`,
      providesTags: ["Category"],
    }),

    fetchCategoryDetails: builder.query({
      query: (categoryId) => `${CATEGORY_URL}/${categoryId}`,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),
    updateCategoryFields: builder.mutation({
      query: ({ categoryId, fields }) => ({
        url: `${CATEGORY_URL}/${categoryId}/fields`,
        method: "PUT",
        body: fields,
      }),
      invalidatesTags: ["Category"],
    }),

    getHomepageCategories: builder.query({
      query: () => `${CATEGORY_URL}/homepage`,
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
  useFetchCategoryDetailsQuery,
  useUpdateCategoryFieldsMutation,
  useGetHomepageCategoriesQuery,
} = categoryApiSlice;
