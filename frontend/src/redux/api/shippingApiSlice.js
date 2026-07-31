import { apiSlice } from "./apiSlice";
import { SHIPPING_URL } from "../constants"; // constants এ SHIPPING_URL = "/api/shipping" যোগ করুন

export const shippingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createShippingZone: builder.mutation({
      query: (data) => ({
        url: `${SHIPPING_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    updateShippingZone: builder.mutation({
      query: ({ zoneId, data }) => ({
        url: `${SHIPPING_URL}/${zoneId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    deleteShippingZone: builder.mutation({
      query: (zoneId) => ({
        url: `${SHIPPING_URL}/${zoneId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"],
    }),

    getAllShippingZones: builder.query({
      query: () => `${SHIPPING_URL}`,
      providesTags: ["Shipping"],
    }),

    calculateShipping: builder.mutation({
      query: (data) => ({
        url: `${SHIPPING_URL}/calculate`,
        method: "POST",
        body: data, // { city, orderItems, subtotal }
      }),
    }),
  }),
});

export const {
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useGetAllShippingZonesQuery,
  useCalculateShippingMutation,
} = shippingApiSlice;
