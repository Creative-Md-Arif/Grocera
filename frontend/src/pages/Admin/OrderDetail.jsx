/* eslint-disable react/prop-types */
import { useState, useMemo, useCallback, memo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  usePayOrderMutation,
} from "@redux/api/orderApiSlice";
import { useGetTrackingHistoryQuery } from "@redux/api/orderTrackingApiSlice";
import { toast } from "react-toastify";
import {
  FaPrint,
  FaArrowLeft,
  FaTruck,
  FaBoxOpen,
  FaImage,
} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import AdminMenu from "./AdminMenu";

// --- Tailwind Animate Spin Loader ---
const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// --- Skeleton UI ---
const SkeletonLine = ({ className = "w-full h-4" }) => (
  <div className={`${className} bg-gray-200 animate-pulse rounded-sm`}></div>
);

const DetailSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white border border-gray-200 p-6 rounded-sm flex justify-between items-center">
      <div className="flex items-center gap-4">
        <SkeletonLine className="w-10 h-10" />
        <div className="space-y-2">
          <SkeletonLine className="w-40 h-6" />
          <SkeletonLine className="w-24 h-4" />
        </div>
      </div>
      <SkeletonLine className="w-32 h-10" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SkeletonLine className="h-64" />
        <SkeletonLine className="h-96" />
      </div>
      <div className="space-y-6">
        <SkeletonLine className="h-48" />
        <SkeletonLine className="h-48" />
        <SkeletonLine className="h-48" />
      </div>
    </div>
  </div>
);

// --- Empty & Error States ---
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-sm">
    <FaBoxOpen size={48} className="text-gray-300 mb-4" />
    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
      Order data not found
    </p>
    <Link
      to="/admin/orderlist"
      className="mt-4 text-sm text-black border-b border-black hover:text-red-600 hover:border-red-600 transition-colors uppercase tracking-wider font-bold"
    >
      Back to Orders
    </Link>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center border border-red-200 bg-red-50 rounded-sm">
    <FaTimes size={48} className="text-red-400 mb-4" />
    <p className="text-sm font-bold text-red-600 uppercase tracking-wider">
      Failed to load order
    </p>
    <p className="text-sm text-red-500 mt-1">
      {message || "An unexpected error occurred."}
    </p>
  </div>
);

// --- Print Invoice Document ---
const InvoiceDocument = memo(function InvoiceDocument({ order }) {
  const formatCurrency = (amount) => `৳${Number(amount || 0).toFixed(2)}`;
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getItemPrice = (item) => {
    const base = item.variantInfo?.variantPrice || item.price || 0;
    if (item.discountPercentage > 0) {
      return base - (base * item.discountPercentage) / 100;
    }
    return base;
  };

  return (
    <div
      id="invoice-print-root"
      className="hidden print:block bg-white text-black font-['Trebuchet_MS'] p-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b-2 border-black">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black font-['Playfair_Display']">
            Veloura
          </h1>
          <p className="text-sm text-gray-600 mt-1">veloura.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-widest text-black font-['Playfair_Display']">
            Invoice
          </h2>
          <p className="text-sm text-gray-600 mt-1">Order #{order.orderId}</p>
          <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Billing / Shipping / Status */}
      <div className="grid grid-cols-3 gap-6 py-6 border-b border-gray-300">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Billed To
          </p>
          <p className="text-sm font-semibold text-black">
            {order.shippingAddress?.name}
          </p>
          <p className="text-sm text-gray-700">
            {order.shippingAddress?.address}
          </p>
          {order.shippingAddress?.thana && (
            <p className="text-sm text-gray-700">
              {order.shippingAddress.thana}, {order.shippingAddress.district}
            </p>
          )}
          {order.shippingAddress?.division && (
            <p className="text-sm text-gray-700">
              {order.shippingAddress.division} -{" "}
            </p>
          )}
          <p className="text-sm text-gray-700 mt-1">
            Phone: {order.shippingAddress?.phoneNumber}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Payment
          </p>
          <p className="text-sm text-gray-700">
            Method:{" "}
            <span className="font-semibold text-black">
              {order.paymentMethod}
            </span>
          </p>
          <p className="text-sm text-gray-700">
            Status:{" "}
            <span className="font-semibold text-black">
              {order.paymentStatus}
            </span>
          </p>
          {order.paidAt && (
            <p className="text-sm text-gray-700">
              Paid At: {formatDate(order.paidAt)}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Delivery
          </p>
          <p className="text-sm text-gray-700">
            Status:{" "}
            <span className="font-semibold text-black">
              {order.isDelivered}
            </span>
          </p>
          {order.courierName && (
            <p className="text-sm text-gray-700">
              Courier: {order.courierName}
            </p>
          )}
          {order.courierTrackingId && (
            <p className="text-sm text-gray-700">
              Tracking: {order.courierTrackingId}
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mt-6 border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2.5 font-bold uppercase tracking-wider text-sm text-gray-700">
              Product
            </th>
            <th className="text-center py-2.5 font-bold uppercase tracking-wider text-sm text-gray-700 w-16">
              Qty
            </th>
            <th className="text-right py-2.5 font-bold uppercase tracking-wider text-sm text-gray-700 w-28">
              Price
            </th>
            <th className="text-right py-2.5 font-bold uppercase tracking-wider text-sm text-gray-700 w-28">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems.map((item) => {
            const finalPrice = getItemPrice(item);
            return (
              <tr key={item.product} className="border-b border-gray-200">
                <td className="py-3 pr-4">
                  <p className="font-semibold text-black">{item.name}</p>
                  {item.variantInfo?.hasVariants && (
                    <p className="text-gray-500 text-sm mt-0.5">
                      {item.variantInfo.colorName} / {item.variantInfo.sizeName}
                    </p>
                  )}
                </td>
                <td className="py-3 text-center">{item.qty}</td>
                <td className="py-3 text-right">
                  {formatCurrency(finalPrice)}
                </td>
                <td className="py-3 text-right font-semibold">
                  {formatCurrency(finalPrice * item.qty)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Price Summary */}
      <div className="flex justify-end mt-4">
        <table className="w-64 text-sm">
          <tbody>
            <tr>
              <td className="py-1.5 text-gray-600">Subtotal</td>
              <td className="py-1.5 text-right font-medium text-black">
                {formatCurrency(order.itemsPrice)}
              </td>
            </tr>
            {order.appliedCuppon?.discountAmount > 0 && (
              <tr>
                <td className="py-1.5 text-gray-600">
                  Coupon ({order.appliedCuppon.code})
                </td>
                <td className="py-1.5 text-right font-medium text-black">
                  -{formatCurrency(order.appliedCuppon.discountAmount)}
                </td>
              </tr>
            )}
            <tr>
              <td className="py-1.5 text-gray-600">Shipping</td>
              <td className="py-1.5 text-right font-medium text-black">
                {order.shippingPrice === 0
                  ? "Free"
                  : formatCurrency(order.shippingPrice)}
              </td>
            </tr>
            {order.taxPrice > 0 && (
              <tr>
                <td className="py-1.5 text-gray-600">Tax</td>
                <td className="py-1.5 text-right font-medium text-black">
                  {formatCurrency(order.taxPrice)}
                </td>
              </tr>
            )}
            <tr className="border-t-2 border-black">
              <td className="pt-2.5 font-bold text-black uppercase text-sm">
                Total
              </td>
              <td className="pt-2.5 text-right font-bold text-black text-base">
                {formatCurrency(order.totalPrice)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-gray-300 text-center">
        <p className="text-sm text-gray-500">
          Thank you for shopping with Veloura
        </p>
        <p className="text-sm text-gray-400 mt-1">
          veloura.com · This is a computer-generated invoice
        </p>
      </div>
    </div>
  );
});

// --- Main Component ---
const OrderDetail = () => {
  const { id } = useParams();
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderDetailsQuery(id);

  const { data: trackingData } = useGetTrackingHistoryQuery(order?.orderId, {
    skip: !order?.orderId,
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] =
    usePayOrderMutation();

  const [selectedNextStatus, setSelectedNextStatus] = useState("");
  const [courierData, setCourierData] = useState({
    courierName: "",
    courierTrackingId: "",
  });

  const deliveryTransitions = useMemo(
    () => ({
      "Order Placed": ["Confirmed", "Processing", "Cancelled"],
      Confirmed: ["Processing", "Cancelled"],
      Processing: ["Packed", "Cancelled"],
      Packed: ["Picked Up by Courier", "Cancelled"],
      "Picked Up by Courier": ["In Transit", "At Local Hub", "Returned"],
      "In Transit": ["At Local Hub", "Out for Delivery", "Returned"],
      "At Local Hub": ["Out for Delivery", "Returned"],
      "Out for Delivery": ["Delivered", "At Local Hub", "Returned"],
      Delivered: ["Returned"],
      Cancelled: [],
      Returned: [],
    }),
    [],
  );

  const paymentTransitions = useMemo(
    () => ({
      pending: ["paid", "failed"],
      awaiting_verification: ["paid", "failed"],
      due: ["paid"],
      paid: ["refunded"],
      failed: ["pending", "due"],
      refunded: [],
    }),
    [],
  );

  const validNextDeliverySteps = order
    ? deliveryTransitions[order.isDelivered] || []
    : [];
  const validNextPaymentSteps = order
    ? paymentTransitions[order.paymentStatus] || []
    : [];

  const requiresCourierInput = [
    "Picked Up by Courier",
    "In Transit",
    "At Local Hub",
    "Out for Delivery",
  ].includes(selectedNextStatus);
  const showCourierInput = requiresCourierInput && !order?.courierTrackingId;

  const handleDeliveryUpdate = useCallback(async () => {
    if (!selectedNextStatus) return;
    if (showCourierInput && !courierData.courierTrackingId) {
      return toast.error("Courier Tracking ID is required.");
    }
    try {
      const payload = { orderId: order._id, status: selectedNextStatus };
      if (requiresCourierInput) {
        payload.courierName = courierData.courierName || "N/A";
        payload.courierTrackingId = courierData.courierTrackingId;
      }
      await updateStatus(payload).unwrap();
      toast.success(`Status updated to ${selectedNextStatus}`);
      setSelectedNextStatus("");
      setCourierData({ courierName: "", courierTrackingId: "" });
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || err?.data?.message || "Update failed");
    }
  }, [
    selectedNextStatus,
    showCourierInput,
    courierData,
    order,
    requiresCourierInput,
    updateStatus,
    refetch,
  ]);

  const handlePaymentUpdate = useCallback(
    async (newStatus) => {
      try {
        await updatePayment({ orderId: order._id, status: newStatus }).unwrap();
        toast.success(`Payment marked as ${newStatus}`);
        refetch();
      } catch (err) {
        toast.error(err?.data?.error || err?.data?.message || "Update failed");
      }
    },
    [order, updatePayment, refetch],
  );

  const formatCurrency = useCallback(
    (amount) => `৳${Number(amount).toFixed(2)}`,
    [],
  );
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const getItemPrice = useCallback((item) => {
    const base = item.variantInfo?.variantPrice || item.price || 0;
    if (item.discountPercentage > 0) {
      return base - (base * item.discountPercentage) / 100;
    }
    return base;
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-root, #invoice-print-root * {
            visibility: visible;
          }
          #invoice-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px 32px;
          }
          @page {
            margin: 16mm;
          }
        }
      `}</style>

      {/* Print-only Invoice */}
      {order && <InvoiceDocument order={order} />}

      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {isLoading ? (
            <DetailSkeleton />
          ) : error ? (
            <ErrorState message={error?.data?.message || error.error} />
          ) : !order ? (
            <EmptyState />
          ) : (
            <>
              {/* Header */}
              <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-black pl-6 py-2 gap-4">
                <div className="flex items-center gap-4">
                  <Link
                    to="/admin/orderlist"
                    className="p-3 border border-gray-200 hover:border-black transition-colors rounded-sm"
                    aria-label="Back to orders"
                  >
                    <FaArrowLeft size={14} />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-['Playfair_Display'] font-bold tracking-tight text-black">
                      Order #{order.orderId}
                    </h1>
                    <p className="text-sm text-gray-500 font-bold mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-200 hover:border-black transition-colors text-sm font-bold uppercase tracking-wider rounded-sm"
                >
                  <FaPrint size={14} /> Print Invoice
                </button>
              </header>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Status Management */}
                    <section className="bg-white border border-gray-200 rounded-sm p-6">
                      <h2 className="text-base font-bold text-black mb-6 pb-3 border-b border-gray-200 font-['Playfair_Display']">
                        Update Status
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Payment Actions */}
                        <div>
                          <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            Payment Status:{" "}
                            <span className="text-black">
                              {order.paymentStatus?.toUpperCase()}
                            </span>
                          </p>
                          {validNextPaymentSteps.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {validNextPaymentSteps.map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handlePaymentUpdate(status)}
                                  disabled={isUpdatingPayment}
                                  className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider border transition-colors disabled:opacity-50 inline-flex items-center rounded-sm
                                    ${
                                      status === "paid"
                                        ? "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                        : status === "failed"
                                          ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                          : status === "refunded"
                                            ? "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                            : "border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black"
                                    }
                                  `}
                                >
                                  {isUpdatingPayment ? <Spinner /> : null}
                                  Mark as {status.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No further actions available
                            </p>
                          )}
                        </div>

                        {/* Delivery Actions */}
                        <div>
                          <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            Delivery Status:{" "}
                            <span className="text-black">
                              {order.isDelivered}
                            </span>
                          </p>
                          {validNextDeliverySteps.length > 0 ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {validNextDeliverySteps.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      setSelectedNextStatus(status)
                                    }
                                    className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider border transition-colors rounded-sm
                                      ${
                                        selectedNextStatus === status
                                          ? "border-black bg-black text-white"
                                          : "border-gray-300 text-gray-700 hover:border-black"
                                      }
                                    `}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>

                              <AnimatePresence>
                                {selectedNextStatus && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    {showCourierInput && (
                                      <div className="border border-dashed border-gray-300 p-4 mt-2 rounded-sm bg-gray-50 space-y-3">
                                        <p className="text-sm font-bold text-gray-600 flex items-center gap-2 uppercase tracking-wider">
                                          <FaTruck size={14} /> Courier Details
                                          Required
                                        </p>
                                        <input
                                          type="text"
                                          placeholder="Courier Name (e.g. Steadfast)"
                                          value={courierData.courierName}
                                          onChange={(e) =>
                                            setCourierData({
                                              ...courierData,
                                              courierName: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-black outline-none rounded-sm"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Tracking ID *"
                                          value={courierData.courierTrackingId}
                                          onChange={(e) =>
                                            setCourierData({
                                              ...courierData,
                                              courierTrackingId: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-black outline-none rounded-sm"
                                        />
                                      </div>
                                    )}
                                    <button
                                      onClick={handleDeliveryUpdate}
                                      disabled={isUpdatingStatus}
                                      className="mt-3 w-full bg-black text-white py-3 text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center rounded-sm"
                                    >
                                      {isUpdatingStatus ? <Spinner /> : null}
                                      Confirm: {selectedNextStatus}
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No further actions available
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Order Items Table */}
                    <section className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-base font-bold text-black font-['Playfair_Display']">
                          Order Items ({order.orderItems.length})
                        </h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                            <tr>
                              <th className="px-6 py-3">Product</th>
                              <th className="px-6 py-3 text-center">Qty</th>
                              <th className="px-6 py-3 text-right">Price</th>
                              <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {order.orderItems.map((item) => {
                              const finalPrice = getItemPrice(item);
                              const originalPrice =
                                item.variantInfo?.variantPrice ||
                                item.price ||
                                0;
                              const savings = originalPrice - finalPrice;

                              return (
                                <tr
                                  key={item.product}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                      {item.image ? (
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-16 h-16 object-cover border border-gray-200 rounded-sm"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-sm">
                                          <FaImage className="text-gray-300" />
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-bold text-black">
                                          {item.name}
                                        </p>
                                        <div className="text-sm text-gray-500 mt-1 space-x-2">
                                          {item.variantInfo?.hasVariants && (
                                            <span>
                                              Color:{" "}
                                              {item.variantInfo.colorName} |
                                              Size: {item.variantInfo.sizeName}
                                            </span>
                                          )}
                                          {item.variantInfo?.sku && (
                                            <span className="text-gray-400">
                                              SKU: {item.variantInfo.sku}
                                            </span>
                                          )}
                                        </div>
                                        {savings > 0 && (
                                          <p className="text-sm text-red-500 mt-1">
                                            Saved:{" "}
                                            {formatCurrency(savings * item.qty)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center font-medium">
                                    {item.qty}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div>
                                      <p className="font-medium">
                                        {formatCurrency(finalPrice)}
                                      </p>
                                      {item.discountPercentage > 0 && (
                                        <p className="text-sm text-gray-400 line-through">
                                          {formatCurrency(originalPrice)}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right font-bold">
                                    {formatCurrency(finalPrice * item.qty)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Price Breakdown */}
                    <article className="bg-white border border-gray-200 rounded-sm p-6">
                      <h2 className="text-base font-bold text-black mb-4 pb-3 border-b border-gray-200 font-['Playfair_Display']">
                        Price Summary
                      </h2>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>
                            Subtotal (
                            {order.orderItems.reduce(
                              (acc, item) => acc + item.qty,
                              0,
                            )}{" "}
                            items)
                          </span>
                          <span>{formatCurrency(order.itemsPrice)}</span>
                        </div>
                        {order.appliedCuppon &&
                          order.appliedCuppon.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Coupon ({order.appliedCuppon.code})</span>
                              <span>
                                -
                                {formatCurrency(
                                  order.appliedCuppon.discountAmount,
                                )}
                              </span>
                            </div>
                          )}
                        {order.totalSavings > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span>Product Savings</span>
                            <span>-{formatCurrency(order.totalSavings)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span>
                            {order.shippingPrice === 0
                              ? "Free"
                              : formatCurrency(order.shippingPrice)}
                          </span>
                        </div>
                        {order.taxPrice > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Tax</span>
                            <span>{formatCurrency(order.taxPrice)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-black pt-3 border-t border-gray-200 font-['Playfair_Display']">
                          <span>Total</span>
                          <span>{formatCurrency(order.totalPrice)}</span>
                        </div>
                      </div>
                    </article>

                    {/* Shipping Address */}
                    <article className="bg-white border border-gray-200 rounded-sm p-6">
                      <h2 className="text-base font-bold text-black mb-4 pb-3 border-b border-gray-200 font-['Playfair_Display']">
                        Shipping Address
                      </h2>
                      <div className="text-sm space-y-2 text-gray-600">
                        <p className="font-bold text-black">
                          {order.shippingAddress.name}
                        </p>
                        <p>{order.shippingAddress.address}</p>
                        {order.shippingAddress.thana && (
                          <p>
                            {order.shippingAddress.thana},{" "}
                            {order.shippingAddress.district}
                          </p>
                        )}
                        {order.shippingAddress.division && (
                          <p>{order.shippingAddress.division} - </p>
                        )}

                        <p className="pt-2 font-bold">
                          Phone: {order.shippingAddress.phoneNumber}
                        </p>
                      </div>
                    </article>

                    {/* Payment & Verification Details */}
                    <article className="bg-white border border-gray-200 rounded-sm p-6">
                      <h2 className="text-base font-bold text-black mb-4 pb-3 border-b border-gray-200 font-['Playfair_Display']">
                        Payment Details
                      </h2>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Method</span>
                          <span className="font-bold">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <span
                            className={`font-bold ${order.isPaid ? "text-green-600" : "text-orange-500"}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                        {order.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Paid At</span>
                            <span>{formatDate(order.paidAt)}</span>
                          </div>
                        )}
                        {order.manualPaymentDetails?.transactionId && (
                          <div className="pt-3 border-t border-gray-100 space-y-2">
                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                              Manual Payment Info:
                            </p>
                            <p className="text-sm">
                              TxID:{" "}
                              <span className="font-mono font-bold">
                                {order.manualPaymentDetails.transactionId}
                              </span>
                            </p>
                            {order.manualPaymentDetails.senderNumber && (
                              <p>
                                From: {order.manualPaymentDetails.senderNumber}
                              </p>
                            )}
                            {order.manualPaymentDetails.paymentScreenshot && (
                              <div className="mt-2">
                                <img
                                  src={
                                    order.manualPaymentDetails.paymentScreenshot
                                  }
                                  alt="Payment Proof"
                                  className="w-full max-h-40 object-contain border border-gray-200 rounded-sm"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </article>

                    {order.courierTrackingId && (
                      <article className="bg-white border border-gray-200 rounded-sm p-6">
                        <h2 className="text-base font-bold text-black mb-4 pb-3 border-b border-gray-200 flex items-center gap-2 font-['Playfair_Display']">
                          <FaTruck size={14} /> Courier Tracking
                        </h2>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Courier</span>
                            <span className="font-bold">
                              {order.courierName || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tracking ID</span>
                            <span className="font-mono font-bold text-blue-600">
                              {order.courierTrackingId}
                            </span>
                          </div>
                        </div>
                      </article>
                    )}
                  </div>
                </div>

                {/* Status History Timeline */}
                <section className="bg-white border border-gray-200 rounded-sm p-6 mt-6">
                  <h2 className="text-base font-bold text-black mb-6 pb-3 border-b border-gray-200 font-['Playfair_Display']">
                    Status Update History
                  </h2>

                  {trackingData?.events && trackingData.events.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
                      {trackingData.events.map((event, index) => (
                        <div key={index} className="relative">
                          <div
                            className={`absolute -left-[31px] top-0 w-6 h-6 bg-white border-4 rounded-full flex items-center justify-center ${
                              index === trackingData.events.length - 1
                                ? "border-black"
                                : "border-gray-300"
                            }`}
                          ></div>

                          <div>
                            <p className="text-base font-bold text-black font-['Playfair_Display']">
                              {event.status}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {event.message}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                              <span>
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                              {event.location && (
                                <span>📍 {event.location}</span>
                              )}
                              {event.courierName && (
                                <span>🚚 {event.courierName}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic text-center py-6">
                      No status updates recorded yet.
                    </p>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderDetail;
