import { apiSlice } from "./apiSlice";
import { CHAT_URL } from "../constants";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    accessChat: builder.mutation({
      query: (adminId) => ({
        url: `${CHAT_URL}`,
        method: "POST",
        body: { adminId },
      }),
      invalidatesTags: ["Chat"],
    }),

    fetchChats: builder.query({
      query: () => ({
        url: `${CHAT_URL}`,
      }),
      providesTags: ["Chat"],
    }),

    fetchMessages: builder.query({
      query: (chatId) => ({
        url: `${CHAT_URL}/${chatId}/messages`,
      }),
      providesTags: (result, error, chatId) => [
        { type: "Message", id: chatId },
      ],
    }),

    sendMessage: builder.mutation({
      query: ({ chatId, formData }) => ({
        url: `${CHAT_URL}/${chatId}/messages`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Message", id: chatId },
        "Chat",
      ],
    }),
  }),
});

export const {
  useAccessChatMutation,
  useFetchChatsQuery,
  useFetchMessagesQuery,
  useSendMessageMutation,
} = chatApiSlice;
