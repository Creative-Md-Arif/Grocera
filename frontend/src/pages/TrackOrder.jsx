import { useState } from "react";
import { useTrackOrderPublicQuery } from "@redux/api/orderTrackingApiSlice";
import {
  FaBoxOpen,
  FaCheck,
  FaTruck,
} from "react-icons/fa6";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

const TrackOrder = () => {
  const [formData, setFormData] = useState({ orderId: "", email: "" });
  const [searchTrigger, setSearchTrigger] = useState(false);

  const {
    data: trackData,
    isLoading,
    error,
    isSuccess,
  } = useTrackOrderPublicQuery(
    { orderId: formData.orderId, email: formData.email },
    { skip: !searchTrigger },
  );

  console.log("Tracking Data:", trackData); // Debugging log

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.orderId && formData.email) {
      setSearchTrigger(true);
    }
  };

  const handleReset = () => {
    setFormData({ orderId: "", email: "" });
    setSearchTrigger(false);
  };

  // টাইমলাইনের আইকন নির্বাচন
  const getStatusIcon = (status) => {
    if (status === "Delivered") return <FaCheck className="text-green-600" />;
    if (
      [
        "Picked Up by Courier",
        "In Transit",
        "At Local Hub",
        "Out for Delivery",
      ].includes(status)
    )
      return <FaTruck className="text-blue-600" />;
    return <FaMapMarkerAlt className="text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black uppercase">
            Track Order
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your order ID and email to see the status
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g., ORD-LKJFS2-8A9"
                value={formData.orderId}
                onChange={(e) => {
                  setFormData({ ...formData, orderId: e.target.value });
                  setSearchTrigger(false);
                }}
                className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:border-black outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setSearchTrigger(false);
                }}
                className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:border-black outline-none transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 text-sm font-semibold uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Searching..."
            ) : (
              <>
                <FaSearch size={14} /> Track Order
              </>
            )}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600 mb-6">
            {error?.data?.message || "Order not found or email does not match."}
          </div>
        )}

        {/* Results Section */}
        {isSuccess && trackData && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-lg font-bold text-black">
                    #{trackData.orderId}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <p className="text-sm text-gray-500">Current Status</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 text-sm font-bold uppercase ${
                      trackData.currentStatus === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {trackData.currentStatus}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {trackData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 text-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-black">{item.name}</p>
                      <p className="text-gray-500 text-xs">
                        Qty: {item.qty} | {item.variant}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {trackData.courierTrackingId && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
                  <span className="text-gray-500">Courier Tracking ID: </span>
                  <span className="font-bold text-blue-600">
                    {trackData.courierTrackingId}
                  </span>
                </div>
              )}
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-base font-bold text-black mb-6">
                Tracking History
              </h3>

              {trackData.trackingHistory &&
              trackData.trackingHistory.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                  {trackData.trackingHistory.map((event, index) => (
                    <div key={index} className="relative">
                      {/* Dot/Icon on the line */}
                      <div className="absolute -left-[31px] w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                        {getStatusIcon(event.status)}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-black">
                          {event.status}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(event.timestamp).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaBoxOpen size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No tracking updates yet. Your order is being processed.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              className="w-full text-sm text-gray-500 border border-gray-200 py-3 hover:border-black hover:text-black transition-colors uppercase font-medium"
            >
              Track Another Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
