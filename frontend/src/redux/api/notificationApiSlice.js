import { NOTIFICATIONS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params) => ({
        url: NOTIFICATIONS_URL,
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      }),

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Notification",
                id: _id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),

    // ৩. সব নোটিফিকেশন একসাথে রিড মার্ক করা
    markAllAsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/mark-all`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    // ৪. নোটিফিকেশন ডিলিট করা
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),

    // ৫. অ্যাডমিন ব্রডকাস্টিং (সিস্টেম নোটিফিকেশন পাঠানোর জন্য)
    broadcastNotification: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATIONS_URL}/broadcast`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
  }),
});

// অটো-জেনারেটেড হুকগুলো এক্সপোর্ট করা
export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useBroadcastNotificationMutation,
} = notificationApiSlice;
