import { apiSlice } from "./apiSlice";
import { BLOG_URL } from "../constants";

export const blogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // সব ব্লগ আনার জন্য (সাপোর্টস filtering যেমন: { status: 'published', category: 'tech' })
    getBlogs: builder.query({
      query: (params) => ({
        url: BLOG_URL,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Blog"],
      keepUnusedDataFor: 300, // ৫ মিনিট ক্যাশে থাকবে
    }),

    // নির্দিষ্ট ব্লগ স্লাগ বা আইডি দিয়ে আনার জন্য (এডিটর বা ডিটেইলস পেজের জন্য)
    getBlogDetails: builder.query({
      query: (slugOrId) => ({
        url: `${BLOG_URL}/${slugOrId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    // নতুন ব্লগ তৈরি করার জন্য (Admin)
    createBlog: builder.mutation({
      query: (data) => ({
        url: BLOG_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blog"],
    }),

    // ব্লগ আপডেট করার জন্য (Admin) - Auto-save এবং ম্যানুয়াল সেভ দুটোর জন্যই কাজ করবে
    updateBlog: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${BLOG_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Blog", id },
        "Blog",
      ],
    }),

    // ব্লগ ডিলিট করার জন্য (Admin)
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `${BLOG_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogDetailsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApiSlice;
