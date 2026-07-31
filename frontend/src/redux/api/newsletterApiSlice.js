import { apiSlice } from "./apiSlice.js";
import { NEWSLETTER_URL } from "../constants";

export const newsletterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation({
      query: (email) => ({
        url: `${NEWSLETTER_URL}/subscribe`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["Newsletter"],
    }),

    unsubscribeNewsletter: builder.mutation({
      query: (email) => ({
        url: `${NEWSLETTER_URL}/unsubscribe`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["Newsletter"],
    }),

    // Admin: সব subscriber এর লিস্ট (active/inactive filter সহ)
    getAllSubscribers: builder.query({
      query: (params) => ({
        url: NEWSLETTER_URL,
        params, // { active: "true" } দিলে শুধু active গুলো আসবে
      }),
      providesTags: ["Newsletter"],
    }),

    // Admin: subscriber ডিলিট
    deleteSubscriber: builder.mutation({
      query: (id) => ({
        url: `${NEWSLETTER_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Newsletter"],
    }),
  }),
});

export const {
  useSubscribeNewsletterMutation,
  useUnsubscribeNewsletterMutation,
  useGetAllSubscribersQuery,
  useDeleteSubscriberMutation,
} = newsletterApiSlice;
