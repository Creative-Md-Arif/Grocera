/* eslint-disable react/prop-types */
import { useState, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Message from "../../components/Message";
import AdminMenu from "./AdminMenu";
import { useGetOrdersQuery } from "@redux/api/orderApiSlice";
import { FaArrowRight, FaMagnifyingGlass, FaBox } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// --- Skeleton Components ---
const TableSkeleton = () => (
  <div className="hidden md:block border border-gray-200 rounded-sm bg-white">
    <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-4">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse flex-1"
        ></div>
      ))}
    </div>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="p-4 border-b border-gray-100 flex gap-4 items-center"
      >
        <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-24 animate-pulse ml-auto"></div>
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="md:hidden space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="border border-gray-200 p-4 rounded-sm bg-white">
        <div className="flex justify-between mb-3 border-b border-gray-100 pb-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="flex gap-4 mb-4">
          <div className="w-14 h-14 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ))}
  </div>
);

// --- Memoized Sub-Components ---
const OrderCard = memo(function OrderCard({
  order,
  getPaymentBadgeClass,
  getDeliveryBadgeClass,
}) {
  return (
    <article className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
      <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-black uppercase tracking-tight font-['Playfair_Display']">
            #{order.orderId}
          </h3>
          <p className="text-sm text-gray-500 font-bold uppercase mt-1">
            {order.user?.username || "N/A"}
          </p>
        </div>
        <span className="text-sm font-bold text-gray-500 uppercase">
          {order.createdAt?.substring(0, 10)}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {order.orderItems[0]?.image && (
          <img
            src={order.orderItems[0].image}
            className="w-14 h-14 object-cover border border-gray-200 rounded-sm p-0.5"
            alt="Order item"
          />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-500 uppercase block">
              Total
            </span>
            <span className="text-lg font-black text-black font-['Playfair_Display']">
              ৳{order.totalPrice}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 gap-2">
            <span
              className={`px-2 py-1 text-sm font-bold uppercase rounded-sm ${getPaymentBadgeClass(order.paymentStatus)}`}
            >
              {order.paymentStatus || (order.isPaid ? "PAID" : "DUE")}
            </span>
            <span
              className={`px-2 py-1 text-sm font-bold uppercase rounded-sm ${getDeliveryBadgeClass(order.isDelivered)}`}
            >
              {order.isDelivered || "Placed"}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Link
          to={`/admin/orderlist/${order._id}`}
          className="block w-full text-center bg-black text-white px-4 py-2.5 text-sm tracking-widest hover:bg-red-600 transition-all uppercase font-bold rounded-sm"
        >
          Manage Order
        </Link>
      </div>
    </article>
  );
});

const OrderRow = memo(function OrderRow({
  order,
  getPaymentBadgeClass,
  getDeliveryBadgeClass,
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-4 py-3">
        <img
          src={order.orderItems[0]?.image}
          className="w-10 h-10 object-cover border border-gray-200 rounded-sm p-0.5"
          alt="Order item"
        />
      </td>
      <td className="px-4 py-3 font-bold text-black text-sm">
        {order.orderId}
      </td>
      <td className="px-4 py-3 uppercase text-gray-600 font-medium text-sm">
        {order.user?.username || "N/A"}
      </td>
      <td className="px-4 py-3 text-gray-500 text-sm">
        {order.createdAt?.substring(0, 10)}
      </td>
      <td className="px-4 py-3 font-black text-black text-base font-['Playfair_Display']">
        ৳{order.totalPrice}
      </td>
      <td className="px-4 py-3 uppercase text-gray-600 font-medium text-sm">
        {order.paymentMethod?.substring(0, 6)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-1 rounded-sm text-sm font-bold uppercase ${getPaymentBadgeClass(order.paymentStatus)}`}
        >
          {order.paymentStatus?.toUpperCase() ||
            (order.isPaid ? "PAID" : "DUE")}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-1 rounded-sm text-sm font-bold uppercase ${getDeliveryBadgeClass(order.isDelivered)}`}
        >
          {order.isDelivered || "Placed"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          to={`/admin/orderlist/${order._id}`}
          className="inline-flex items-center gap-1.5 bg-black text-white px-4 py-2 text-sm tracking-widest hover:bg-red-600 transition-all uppercase font-bold rounded-sm"
        >
          Manage <FaArrowRight size={10} />
        </Link>
      </td>
    </tr>
  );
});

const OrderList = ({
  showAdminMenu = true,
  className = "pb-16",
  isDashboard = false,
}) => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Reusable Styles
  const inputClass =
    "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";

  // Badge Color Helpers
  const getPaymentBadgeClass = (status) => {
    if (status === "paid") return "bg-green-100 text-green-700";
    if (status === "failed" || status === "refunded")
      return "bg-red-100 text-red-700";
    if (status === "awaiting_verification")
      return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
  };

  const getDeliveryBadgeClass = (status) => {
    if (status === "Delivered") return "bg-green-100 text-green-700";
    if (status === "Cancelled" || status === "Returned")
      return "bg-red-100 text-red-700";
    if (
      status === "Picked Up by Courier" ||
      status === "In Transit" ||
      status === "At Local Hub" ||
      status === "Out for Delivery"
    )
      return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    return sorted.filter((order) => {
      const matchesSearchTerm =
        (order.user?.username?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (order.orderId || "").toLowerCase().includes(searchTerm.toLowerCase());
      const orderDate = new Date(order.createdAt);
      const matchesStartDate = startDate
        ? orderDate >= new Date(startDate)
        : true;
      const matchesEndDate = endDate ? orderDate <= new Date(endDate) : true;
      return matchesSearchTerm && matchesStartDate && matchesEndDate;
    });
  }, [orders, searchTerm, startDate, endDate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = isDashboard
    ? filteredOrders.slice(0, 5)
    : filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // ✅ Loading State (Fixed Layout to avoid double padding)
  if (isLoading) {
    if (isDashboard) return <TableSkeleton />;
    return (
      <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
        {showAdminMenu && <AdminMenu />}
        <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
          <div className="max-w-[1500px] mx-auto">
            <CardSkeleton />
            <TableSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <Message variant="danger">{error?.data?.message || error.error}</Message>
    );
  }

  // ✅ Main Content Variable
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!isDashboard && (
        <header className="mb-8 border-l-4 border-black pl-6 py-2">
          <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
            Order <span className="text-red-600">/ Management</span>
          </h1>
          <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
            Total Logs: {filteredOrders.length}
          </p>
        </header>
      )}

      {!isDashboard && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 border border-gray-200 rounded-sm bg-white">
          <div className="relative sm:col-span-2 md:col-span-1">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="SEARCH ID / USER..."
              className={`${inputClass} pl-10 uppercase`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <input
            type="date"
            className={`${inputClass}`}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className={`${inputClass}`}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            onClick={() => {
              setSearchTerm("");
              setStartDate("");
              setEndDate("");
            }}
            className="bg-black text-white text-sm font-bold tracking-widest hover:bg-red-600 transition-all uppercase py-2.5 rounded-sm"
          >
            Reset
          </button>
        </section>
      )}

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {currentOrders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            getPaymentBadgeClass={getPaymentBadgeClass}
            getDeliveryBadgeClass={getDeliveryBadgeClass}
          />
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm bg-white">
        {!isDashboard && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider">
              <FaBox size={12} /> Rows:
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded-sm text-sm font-bold p-1.5 outline-none cursor-pointer"
              >
                {[8, 16, 24, 36].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 uppercase tracking-widest">
            <tr>
              {[
                "Items",
                "ID",
                "User",
                "Date",
                "Total",
                "Pay Method",
                "Pay Status",
                "Delivery",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-4 text-sm font-bold text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                getPaymentBadgeClass={getPaymentBadgeClass}
                getDeliveryBadgeClass={getDeliveryBadgeClass}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!isDashboard && (
        <nav className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Showing{" "}
            <span className="text-black font-black">
              {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredOrders.length)}
            </span>{" "}
            of{" "}
            <span className="text-red-600 font-black">
              {filteredOrders.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-3 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:cursor-not-allowed transition-all rounded-sm"
              aria-label="Previous page"
            >
              <FaChevronLeft size={14} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 text-sm font-bold transition-all rounded-sm ${
                    currentPage === i + 1
                      ? "bg-black text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-3 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:cursor-not-allowed transition-all rounded-sm"
              aria-label="Next page"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </nav>
      )}
    </motion.div>
  );

  // ✅ Render Logic to Prevent Double Padding (Your requested layout applied here)
  if (isDashboard) {
    return (
      <div className={`font-['Trebuchet_MS'] ${className}`}>{content}</div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] ${className}`}
    >
      {showAdminMenu && <AdminMenu />}
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">{content}</div>
      </main>
    </div>
  );
};

export default OrderList;
