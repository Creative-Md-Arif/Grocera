import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants.js";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token || localStorage.getItem("token");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("Accept", "application/json");

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    "Product",
    "Products",
    "Dashboard",
    "Order",
    "User",
    "Category",
    "Notification",
    "NewArrivals",
    "BestSellers",
    "FlashSale",
    "Payment",
    "Cuppon",
    "Shipping",
    "Tracking",
    "Returns",
    "Campaign",
    "SiteSetting",
    "Newsletter",
    "SEO",
    "Blog",
    "Review",
    "RelatedProducts",
    "Chat",
    "Message",
    "Integration",
    "Supplier",
    "Purchase",
    "Question",
  ],
  endpoints: () => ({}),
});


