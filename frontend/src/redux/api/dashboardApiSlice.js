import { apiSlice } from "./apiSlice";
import { DASHBOARD_URL } from "../constants";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTotalOrders: builder.query({
      query: () => `${DASHBOARD_URL}/total-orders`,
    }),
    getTotalOrdersByDate: builder.query({
      query: () => `${DASHBOARD_URL}/total-orders-by-date`,
    }),
    getTotalSales: builder.query({
      query: () => `${DASHBOARD_URL}/total-sales`,
    }),
    getTotalSalesByDate: builder.query({
      query: () => `${DASHBOARD_URL}/total-sales-by-date`,
    }),
    getSalesSummaryByStatus: builder.query({
      query: () => `${DASHBOARD_URL}/sales-summary`,
      keepUnusedDataFor: 5,
    }),
    getDeliverySummary: builder.query({
      query: () => `${DASHBOARD_URL}/delivery-summary`,
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useGetTotalOrdersQuery,
  useGetTotalOrdersByDateQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,
  useGetSalesSummaryByStatusQuery,
  useGetDeliverySummaryQuery,
} = dashboardApiSlice;
