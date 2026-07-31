import { QUESTION_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const questionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ১. এডমিন প্যানেলের জন্য সব প্রশ্ন আনা
    getQuestions: builder.query({
      query: () => `${QUESTION_URL}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Question", id: _id })),
              { type: "Question", id: "LIST" },
            ]
          : [{ type: "Question", id: "LIST" }],
      keepUnusedDataFor: 5,
    }),

    // ২. প্রোডাক্ট পেজের জন্য নির্দিষ্ট প্রশ্ন আনা
    getProductQuestions: builder.query({
      query: (productId) => `${QUESTION_URL}/product/${productId}`,
      providesTags: (result, error, productId) => [
        { type: "Question", id: `PRODUCT_${productId}` },
        { type: "Question", id: "LIST" },
      ],
      keepUnusedDataFor: 5,
    }),

    // ৩. নতুন প্রশ্ন করা
    createQuestion: builder.mutation({
      query: (data) => ({
        url: `${QUESTION_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Question", id: `PRODUCT_${productId}` },
        { type: "Question", id: "LIST" },
      ],
    }),

    // ৪. এডমিন উত্তর দেওয়া
    answerQuestion: builder.mutation({
      query: ({ questionId, answer }) => ({
        url: `${QUESTION_URL}/${questionId}/answer`,
        method: "PUT",
        body: { answer },
      }),
      // নির্দিষ্ট আইডি এবং LIST উভয়ই ইনভ্যালিড করা হচ্ছে
      invalidatesTags: (result, error, { questionId }) => [
        { type: "Question", id: questionId },
        { type: "Question", id: "LIST" },
      ],
    }),

    // ৫. প্রশ্ন ডিলিট করা
    deleteQuestion: builder.mutation({
      query: (questionId) => ({
        url: `${QUESTION_URL}/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, questionId) => [
        { type: "Question", id: questionId },
        { type: "Question", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetProductQuestionsQuery,
  useCreateQuestionMutation,
  useAnswerQuestionMutation,
  useDeleteQuestionMutation,
} = questionApiSlice;
