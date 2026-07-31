/* eslint-disable react/prop-types */
import { lazy, Suspense, memo, useMemo, useState, useEffect } from "react";
import { useGetUsersQuery } from "@redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
  useGetTotalOrdersByDateQuery,
  useGetSalesSummaryByStatusQuery,
  useGetDeliverySummaryQuery,
} from "@redux/api/dashboardApiSlice";
import { useGetPaymentStatsQuery } from "@redux/api/paymentApiSlice";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import { Link } from "react-router-dom";

// Lazy load ApexCharts for performance
const Chart = lazy(() => import("react-apexcharts"));

// Reusable Skeleton Component
const Skeleton = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded-sm ${className}`} />
);

const AdminDashboard = () => {
  const { isLoading } = useGetTotalSalesQuery();
  const { data: customers } = useGetUsersQuery();
  const { data: orders } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();
  const { data: ordersByDate } = useGetTotalOrdersByDateQuery();
  const { data: statusSummary } = useGetSalesSummaryByStatusQuery();
  const { data: deliverySummary } = useGetDeliverySummaryQuery();
  const { data: paymentStats } = useGetPaymentStatsQuery();

  const customerCount = useMemo(() => {
    if (!customers) return 0;
    if (Array.isArray(customers)) return customers.length;
    return customers.users?.length || customers.totalUsers || 0;
  }, [customers]);

  const statusMap = useMemo(() => {
    const map = {};
    statusSummary?.forEach((item) => {
      map[item._id] = {
        amount: item.totalSales || 0,
        count: item.orderCount || 0,
      };
    });
    return map;
  }, [statusSummary]);

  const getStatusData = (status) =>
    statusMap[status] || { amount: 0, count: 0 };

  const deliveryMap = useMemo(() => {
    const map = {};
    deliverySummary?.forEach((item) => {
      map[item._id] = { count: item.count || 0, amount: item.totalAmount || 0 };
    });
    return map;
  }, [deliverySummary]);

  const getDeliveryData = (status) =>
    deliveryMap[status] || { count: 0, amount: 0 };

  const manualStats = useMemo(() => {
    if (!paymentStats?.byMethod)
      return { total: 0, pending: 0, verified: 0, failed: 0, revenue: 0 };
    return {
      total: paymentStats.byMethod.reduce((acc, curr) => acc + curr.count, 0),
      pending: paymentStats.byMethod.reduce(
        (acc, curr) => acc + curr.pending,
        0,
      ),
      verified: paymentStats.byMethod.reduce(
        (acc, curr) => acc + curr.verified,
        0,
      ),
      failed: paymentStats.byMethod.reduce((acc, curr) => acc + curr.failed, 0),
      revenue: paymentStats.overall?.totalRevenue || 0,
    };
  }, [paymentStats]);

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka",
  });
  const todayOrders =
    ordersByDate?.find((item) => item._id === today)?.totalOrders || 0;
  const todaySales =
    salesDetail?.find((item) => item._id === today)?.totalSales || 0;

  const totalPaid = getStatusData("paid").amount;
  const totalRefunded = getStatusData("refunded").amount;
  const refundedCount = getStatusData("refunded").count;
  const netEarnings = totalPaid;

  const sslcommerzAmount = paymentStats?.gatewayMethod?.totalAmount || 0;
  const sslcommerzCount = paymentStats?.gatewayMethod?.count || 0;
  const manualMethods = paymentStats?.byMethod || [];
  const grandTotalRevenue = paymentStats?.grandOverall?.totalRevenue || 0;

  const [state, setState] = useState({
    options: {
      chart: {
        type: "area",
        toolbar: { show: false },
        dropShadow: {
          enabled: true,
          top: 10,
          left: 0,
          blur: 4,
          color: "#000",
          opacity: 0.05,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      colors: ["#000000"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      grid: {
        borderColor: "#f1f1f1",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
      },
      xaxis: {
        categories: [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: "#9ca3af", fontWeight: 500, fontSize: "14px" },
        },
      },
      yaxis: {
        labels: {
          style: { colors: "#9ca3af", fontWeight: 500, fontSize: "14px" },
          formatter: (value) => `৳${value}`,
        },
      },
      markers: {
        size: 4,
        colors: ["#000"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: { size: 6 },
      },
      tooltip: { theme: "light", x: { show: true } },
    },
    series: [{ name: "Revenue", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      const formattedSalesDate = salesDetail.map((item) => ({
        x: item._id,
        y: item.totalSales,
      }));
      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: formattedSalesDate.map((item) => item.x),
          },
        },
        series: [
          { name: "Revenue", data: formattedSalesDate.map((item) => item.y) },
        ],
      }));
    }
  }, [salesDetail]);

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS']">
      <AdminMenu />

      <main className="pt-24 pb-16 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
              Dashboard / Overview System Analytics & Real-time Metrics
            </h2>
     
          </header>

          {/* Statistics Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Sales Today"
              value={todaySales}
              loading={!salesDetail}
            />
            <StatCard
              title="Net Earnings"
              value={netEarnings}
              loading={!statusSummary}
              subtitle={
                totalRefunded > 0
                  ? `Excludes ${refundedCount} refunded order(s) — ৳${Number(totalRefunded).toLocaleString()}`
                  : "All payment methods included"
              }
              isNegative={totalRefunded > 0}
            />
            <StatCard
              title="Customers"
              value={customerCount}
              loading={!customers}
              isCount
            />
            <StatCard
              title="Orders (Today)"
              value={todayOrders}
              loading={!ordersByDate}
              isCount
            />
            <StatCard
              title="All Orders"
              value={orders?.totalOrders}
              loading={isLoading}
              isCount
            />
          </section>

          {/* Manual Payment Stats Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <article className="bg-white p-6 border border-gray-200 rounded-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-black uppercase tracking-wider flex items-center gap-2 font-['Playfair_Display']">
                  <div className="w-1.5 h-5 bg-red-600 rounded-full"></div>{" "}
                  Manual & Gateway Payments
                </h2>
                <Link to="/admin/payment-settings">
                  <button className="text-sm font-bold text-gray-500 hover:text-black uppercase tracking-wider transition-colors">
                    Settings →
                  </button>
                </Link>
              </div>
              <div className="space-y-3">
                {manualMethods.map((stat) => (
                  <div
                    key={stat._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-sm hover:border-black transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          stat._id === "bKash"
                            ? "bg-pink-600"
                            : stat._id === "Nagad"
                              ? "bg-orange-500"
                              : stat._id === "Rocket"
                                ? "bg-purple-600"
                                : "bg-gray-400"
                        }`}
                      ></span>
                      <span className="font-bold text-sm text-gray-700">
                        {stat._id}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-sm font-['Playfair_Display']">
                        ৳{Number(stat.totalAmount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {stat.count} orders
                      </p>
                    </div>
                  </div>
                ))}

                {sslcommerzAmount > 0 && (
                  <div className="flex items-center justify-between p-3 border border-green-200 rounded-sm bg-green-50/50 hover:border-green-600 transition-colors mt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-600"></span>
                      <span className="font-bold text-sm text-gray-700">
                        SSLCommerz
                      </span>
                      <span className="text-sm text-green-600 font-bold uppercase tracking-wider border border-green-300 px-1.5 py-0.5 rounded-sm">
                        Gateway
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-sm font-['Playfair_Display']">
                        ৳{Number(sslcommerzAmount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sslcommerzCount} orders
                      </p>
                    </div>
                  </div>
                )}

                {!manualMethods.length && !sslcommerzAmount && (
                  <p className="text-center text-gray-500 text-sm py-4 uppercase font-bold">
                    No data
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Combined Total
                </span>
                <span className="font-black text-base text-black font-['Playfair_Display']">
                  ৳{Number(grandTotalRevenue).toLocaleString()}
                </span>
              </div>
            </article>

            <article className="lg:col-span-2 bg-white p-6 border border-gray-200 rounded-sm">
              <h2 className="text-base font-bold text-black mb-4 uppercase tracking-wider flex items-center gap-2 font-['Playfair_Display']">
                <div className="w-1.5 h-5 bg-amber-500 rounded-full"></div>{" "}
                Payment Verification
              </h2>
              <p className="text-sm text-gray-500 mb-4 -mt-2">
                Manual payments (bKash / Nagad / Rocket / Bank) require admin
                verification before order confirms.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-amber-200 rounded-sm bg-amber-50/50">
                  <p className="text-xl font-black text-amber-600 font-['Playfair_Display']">
                    {manualStats.pending}
                  </p>
                  <p className="text-sm uppercase font-bold text-gray-500 mt-1">
                    Awaiting
                  </p>
                </div>
                <div className="text-center p-4 border border-emerald-200 rounded-sm bg-emerald-50/50">
                  <p className="text-xl font-black text-emerald-600 font-['Playfair_Display']">
                    {manualStats.verified}
                  </p>
                  <p className="text-sm uppercase font-bold text-gray-500 mt-1">
                    Verified
                  </p>
                </div>
                <div className="text-center p-4 border border-red-200 rounded-sm bg-red-50/50">
                  <p className="text-xl font-black text-red-600 font-['Playfair_Display']">
                    {manualStats.failed}
                  </p>
                  <p className="text-sm uppercase font-bold text-gray-500 mt-1">
                    Failed
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-sm bg-gray-50/50">
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    ৳{Number(manualStats.revenue).toLocaleString()}
                  </p>
                  <p className="text-sm uppercase font-bold text-gray-500 mt-1">
                    Manual Revenue
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                <p className="text-sm text-gray-500 text-center uppercase tracking-wider">
                  Total {manualStats.total} manual transactions
                  (bKash/Nagad/Rocket/Bank) — SSLCommerz shown separately
                </p>
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-1 space-y-6">
              <article className="bg-white p-6 border border-gray-200 rounded-sm">
                <h2 className="text-base font-bold text-black mb-4 uppercase tracking-wider flex items-center gap-2 font-['Playfair_Display']">
                  <div className="w-1.5 h-5 bg-black rounded-full"></div>{" "}
                  Payment Summary
                </h2>
                <p className="text-sm text-gray-500 mb-4 -mt-2">
                  Orders grouped by current payment status (an order can only be
                  in one status at a time).
                </p>
                <div className="space-y-3">
                  <StatusRow
                    label="Paid"
                    data={getStatusData("paid")}
                    dotColor="bg-emerald-500"
                  />
                  <StatusRow
                    label="Due (COD)"
                    data={getStatusData("due")}
                    dotColor="bg-blue-500"
                  />
                  <StatusRow
                    label="Pending"
                    data={getStatusData("pending")}
                    dotColor="bg-amber-500"
                  />
                  <StatusRow
                    label="Failed"
                    data={getStatusData("failed")}
                    dotColor="bg-red-500"
                  />
                  <StatusRow
                    label="Refunded"
                    data={getStatusData("refunded")}
                    dotColor="bg-orange-500"
                  />
                </div>
              </article>

              <article className="bg-white p-6 border border-gray-200 rounded-sm">
                <h2 className="text-base font-bold text-black mb-4 uppercase tracking-wider flex items-center gap-2 font-['Playfair_Display']">
                  <div className="w-1.5 h-5 bg-gray-500 rounded-full"></div>{" "}
                  Logistics
                </h2>
                <div className="space-y-3">
                  <DeliveryMiniCard
                    label="Order Placed"
                    data={getDeliveryData("Order Placed")}
                  />
                  <DeliveryMiniCard
                    label="Processing"
                    data={getDeliveryData("Processing")}
                  />
                  <DeliveryMiniCard
                    label="Shipped"
                    data={getDeliveryData("Shipped")}
                  />
                  <DeliveryMiniCard
                    label="Out for Delivery"
                    data={getDeliveryData("Out for Delivery")}
                  />
                  <DeliveryMiniCard
                    label="Delivered"
                    data={getDeliveryData("Delivered")}
                  />
                  <DeliveryMiniCard
                    label="Cancelled"
                    data={getDeliveryData("Cancelled")}
                  />
                  <DeliveryMiniCard
                    label="Returned"
                    data={getDeliveryData("Returned")}
                  />
                </div>
              </article>
            </div>

            <article className="lg:col-span-3 bg-white p-6 border border-gray-200 rounded-sm h-fit">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-bold text-black uppercase tracking-wider font-['Playfair_Display']">
                  Revenue Flow
                </h2>
                <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500 uppercase">
                  <span className="w-2.5 h-2.5 bg-black rounded-full"></span>{" "}
                  Sales Trend (all orders, by date)
                </span>
              </div>
              <Suspense fallback={<Skeleton className="h-[320px] w-full" />}>
                <Chart
                  options={state.options}
                  series={state.series}
                  type="area"
                  height={320}
                />
              </Suspense>
            </article>
          </section>

          <section className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base font-bold text-black uppercase tracking-wider font-['Playfair_Display']">
                Recent Orders
              </h2>
              <Link to="/admin/orderlist">
                <button className="px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-colors rounded-sm">
                  View All
                </button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <OrderList
                showAdminMenu={false}
                className="p-0"
                isDashboard={true}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const StatCard = memo(function StatCard({
  title,
  value,
  loading,
  isCount,
  subtitle,
  isNegative,
}) {
  return (
    <div className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
      <p className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="font-black text-xl text-black truncate h-8 font-['Playfair_Display']">
        {loading ? (
          <Skeleton className="h-6 w-24" />
        ) : isCount ? (
          value
        ) : (
          `৳${Number(value).toLocaleString()}`
        )}
      </div>
      {subtitle && !loading && (
        <p
          className={`text-sm font-medium mt-1 uppercase tracking-wider truncate ${isNegative ? "text-red-500" : "text-gray-500"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
});

const StatusRow = memo(function StatusRow({ label, data, dotColor }) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-sm hover:border-black transition-colors">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
        <div>
          <p className="font-bold text-sm text-black">{label}</p>
          <p className="text-sm text-gray-500 font-medium">
            {data.count} Orders
          </p>
        </div>
      </div>
      <p className="font-bold text-sm text-gray-800 font-['Playfair_Display']">
        ৳{Number(data.amount).toLocaleString()}
      </p>
    </div>
  );
});

const DeliveryMiniCard = memo(function DeliveryMiniCard({ label, data }) {
  return (
    <div className="p-3 border border-gray-200 rounded-sm hover:border-black transition-colors flex justify-between items-center">
      <div>
        <p className="text-sm uppercase font-bold tracking-wider text-gray-500">
          {label}
        </p>
        <p className="text-base font-black text-black leading-none mt-1 font-['Playfair_Display']">
          {data.count}{" "}
          <span className="text-sm font-medium text-gray-500">Orders</span>
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm text-gray-800 font-['Playfair_Display']">
          ৳{Number(data.amount).toLocaleString()}
        </p>
      </div>
    </div>
  );
});

export default AdminDashboard;
