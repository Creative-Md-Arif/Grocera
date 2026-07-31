/* eslint-disable react/prop-types */
import { memo } from "react";
import Message from "../../components/Message";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { BsEye } from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

/* ── Custom Skeleton Loader ── */
const OrderSkeleton = memo(function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
        <div className="h-6 w-36 bg-gray-100 rounded-lg animate-pulse mb-2"></div>
        <div className="h-4 w-52 bg-gray-50 rounded animate-pulse"></div>
      </div>
      <div className="divide-y divide-gray-50">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="px-4 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-6"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="h-4 w-20 sm:w-28 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-16 sm:w-24 bg-gray-50 rounded animate-pulse"></div>
            <div className="h-6 w-14 sm:w-20 bg-gray-100 rounded-full animate-pulse ml-auto sm:ml-0"></div>
            <div className="h-6 w-14 sm:w-20 bg-blue-50 rounded-full animate-pulse hidden sm:block"></div>
            <div className="h-4 w-16 sm:w-20 bg-gray-50 rounded animate-pulse hidden md:block"></div>
            <div className="h-8 w-20 sm:w-24 bg-gray-900/5 rounded-xl animate-pulse ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ── Empty State ── */
const EmptyOrders = memo(function EmptyOrders() {
  return (
    <div className="py-20 sm:py-28 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 border border-gray-100 rounded-full mb-5">
        <svg
          className="w-8 h-8 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p className="font-['Trebuchet_MS'] text-sm text-gray-400 uppercase tracking-widest">
        No orders found
      </p>
      <Link
        to="/"
        className="inline-block mt-5 bg-black text-white font-['Trebuchet_MS'] font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
      >
        Start Shopping
      </Link>
    </div>
  );
});

/* ── Memoized Table Row ── */
const OrderRow = memo(function OrderRow({ order }) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
      <td className="px-4 sm:px-6 py-4">
        <span className="text-sm font-['Trebuchet_MS'] font-bold text-blue-600">
          #{order.orderId}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm font-['Trebuchet_MS'] text-gray-500 whitespace-nowrap">
        {new Date(order.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 sm:px-6 py-4 text-center">
        <span
          className={`text-sm font-['Trebuchet_MS'] font-bold px-2.5 py-1 rounded-full uppercase border ${
            order.paymentStatus === "paid"
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-red-50 text-red-500 border-red-200"
          }`}
        >
          {order.paymentStatus}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 text-center">
        <span
          className={`text-sm font-['Trebuchet_MS'] font-bold px-2.5 py-1 rounded-full uppercase border ${
            order.isDelivered === "delivered" || order.isDelivered === "Delivered"
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-blue-50 text-blue-600 border-blue-100"
          }`}
        >
          {order.isDelivered}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 text-right font-['Trebuchet_MS'] font-bold text-sm text-gray-900 whitespace-nowrap">
        ৳{order.totalPrice.toFixed(2)}
      </td>
      <td className="px-4 sm:px-6 py-4 text-right">
        <Link to={`/order/${order._id}`}>
          <button className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-['Trebuchet_MS'] font-bold uppercase tracking-widest transition-colors">
            <BsEye size={14} />
            <span className="hidden sm:inline">Details</span>
          </button>
        </Link>
      </td>
    </tr>
  );
});

const UserOrder = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  return (
    <div className="bg-[#F9FAFB] min-h-screen font-['Trebuchet_MS']">
      {/* ✅ Unified Breadcrumb */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium flex-wrap py-4 bg-white"
          >
            <Link
              to="/"
              className="flex items-center gap-1.5 text-black hover:underline text-sm font-medium"
            >
              <FaHome className="text-sm" />
              <span>Home</span>
            </Link>

            <span className="contents">
              <HiChevronRight className="text-sm text-black flex-shrink-0" />
              <Link
                to="/profile"
                className="text-black hover:underline text-sm font-medium"
              >
                Profile
              </Link>
            </span>

            <span className="contents">
              <HiChevronRight className="text-sm text-black flex-shrink-0" />
              <span className="text-black font-black text-sm">
                Order History
              </span>
            </span>
          </nav>
        </div>
      </header>

      {/* ✅ Full Width Container Design */}
      <main className="max-w-screen-2xl mx-auto px-4 py-8 sm:py-10">
        {isLoading ? (
          <OrderSkeleton />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.error || error.error}
          </Message>
        ) : (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* ── Card Header ── */}
            <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-2xl font-['Playfair_Display'] font-black text-gray-900 uppercase tracking-tight">
                  My <span className="text-blue-600">Orders</span>
                </h2>
                <p className="text-gray-400 text-sm font-['Trebuchet_MS'] mt-1 uppercase tracking-wide">
                  Track and manage your recent purchases
                </p>
              </div>
              <span className="self-start sm:self-auto bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full text-sm font-['Trebuchet_MS'] font-bold">
                {orders.length} Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <EmptyOrders />
            ) : (
              /* ── Table ── */
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 sm:px-6 py-3 text-sm font-['Trebuchet_MS'] font-bold text-gray-500 uppercase tracking-widest">
                        Order ID
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-sm font-['Trebuchet_MS'] font-bold text-gray-500 uppercase tracking-widest">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-sm font-['Trebuchet_MS'] font-bold text-gray-500 uppercase tracking-widest text-center">
                        Payment
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-sm font-['Trebuchet_MS'] font-bold text-gray-500 uppercase tracking-widest text-center">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-sm font-['Trebuchet_MS'] font-bold text-gray-500 uppercase tracking-widest text-right">
                        Amount
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-sm font-['Trebuchet_MS'] font-bold text-gray-500 uppercase tracking-widest text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <OrderRow key={order._id} order={order} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default UserOrder;