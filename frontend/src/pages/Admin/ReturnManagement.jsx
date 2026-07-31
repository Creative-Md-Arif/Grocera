/* eslint-disable react/prop-types */
import { useState, memo } from "react";
import {
  useGetReturnRequestsQuery,
  useReviewReturnRequestMutation,
  useMarkReturnPickedUpMutation,
  useProcessRefundMutation,
} from "@redux/api/returnApiSlice";
import {
  FaCheck,
  FaXmark,
  FaTruck,
  FaMoneyBillWave,
  FaImage,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

// --- Skeleton Loader ---
const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 p-6 rounded-sm animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex gap-4">
          <div className="w-[200px] h-14 bg-gray-100 rounded"></div>
          <div className="w-[200px] h-14 bg-gray-100 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="h-10 w-full bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

// --- Memoized Return Card ---
const ReturnCard = memo(function ReturnCard({ 
  ret, handleAction, openModal, isReviewing, isPickingUp 
}) {
  return (
    <article className="bg-white border border-gray-200 p-6 hover:border-gray-400 transition-colors rounded-sm">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Info Section */}
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-black font-['Playfair_Display']">
                #{ret.orderId}
              </h3>
              <p className="text-sm text-gray-600">
                by {ret.user?.username || "Unknown"} ({ret.user?.email})
              </p>
            </div>
            <span
              className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-bold uppercase rounded-sm w-fit
              ${
                ret.returnStatus === "requested"
                  ? "bg-yellow-100 text-yellow-700"
                  : ret.returnStatus === "approved"
                    ? "bg-blue-100 text-blue-700"
                    : ret.returnStatus === "rejected"
                      ? "bg-red-100 text-red-700"
                      : ret.returnStatus === "picked_up"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-green-100 text-green-700"
              }`}
            >
              {ret.returnStatus.replace("_", " ")}
            </span>
          </div>

          <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
            {ret.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50 p-2 border border-gray-100 min-w-[200px] rounded-sm"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    className="w-12 h-12 object-cover border border-gray-200 rounded-sm"
                    alt={item.name}
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-sm">
                    <FaImage className="text-gray-300" />
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium text-black text-sm truncate max-w-[120px]">
                    {item.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    x{item.qty} (৳{item.price})
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-bold">Reason:</span> {ret.returnReason}
          </p>

          {ret.returnDescription && (
            <p className="text-sm text-gray-600 italic mb-3 bg-gray-50 p-3 rounded-sm border border-gray-100 inline-block mt-2">
              {ret.returnDescription}
            </p>
          )}

          {ret.returnImages && ret.returnImages.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                Customer Proof:
              </p>
              <div className="flex gap-2 flex-wrap">
                {ret.returnImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`proof-${index}`}
                    className="w-16 h-16 object-cover border border-gray-200 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openModal(ret, "image", img)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="flex flex-row lg:flex-col gap-2 items-start lg:items-end justify-end">
          {ret.returnStatus === "requested" && (
            <>
              <button
                onClick={() => handleAction("approve", ret._id)}
                disabled={isReviewing}
                className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider disabled:opacity-50 rounded-sm"
              >
                <FaCheck size={12} /> Approve
              </button>
              <button
                onClick={() => openModal(ret, "reject")}
                className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider rounded-sm"
              >
                <FaXmark size={12} /> Reject
              </button>
            </>
          )}
          {ret.returnStatus === "approved" && (
            <button
              onClick={() => handleAction("pickup", ret._id)}
              disabled={isPickingUp}
              className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider disabled:opacity-50 rounded-sm"
            >
              <FaTruck size={12} /> Mark Picked Up
            </button>
          )}
          {(ret.returnStatus === "approved" || ret.returnStatus === "picked_up") && (
            <button
              onClick={() => openModal(ret, "refund")}
              className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-red-600 transition-colors text-sm font-bold uppercase tracking-wider rounded-sm"
            >
              <FaMoneyBillWave size={12} /> Process Refund
            </button>
          )}
          {ret.returnStatus === "refunded" && (
            <div className="text-right text-sm">
              <p className="font-bold text-green-600">
                Refunded: ৳{ret.refundAmount}
              </p>
              <p className="text-gray-500 text-sm">
                {ret.refundMethod} | {ret.refundTransactionId}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});

const ReturnManagement = () => {
  const [activeTab, setActiveTab] = useState("requested");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [modalType, setModalType] = useState(null); // 'reject' | 'refund' | 'image'

  const [rejectNotes, setRejectNotes] = useState("");
  const [refundData, setRefundData] = useState({
    refundAmount: "",
    refundMethod: "",
    refundTransactionId: "",
  });
  const [previewImage, setPreviewImage] = useState(null);

  const { data: returns, isLoading, refetch } = useGetReturnRequestsQuery(
    activeTab === "all" ? "" : activeTab
  );

  const [reviewReturn, { isLoading: isReviewing }] = useReviewReturnRequestMutation();
  const [markPickedUp, { isLoading: isPickingUp }] = useMarkReturnPickedUpMutation();
  const [processRefund, { isLoading: isRefunding }] = useProcessRefundMutation();

  const tabs = ["all", "requested", "approved", "picked_up", "rejected", "refunded"];

  const handleAction = async (action, id) => {
    try {
      if (action === "approve") {
        await reviewReturn({ id, body: { action: "approve" } }).unwrap();
        toast.success("Return approved");
      } else if (action === "reject") {
        if (!rejectNotes.trim()) return toast.error("Please provide a reason for rejection");
        await reviewReturn({ id, body: { action: "reject", adminNotes: rejectNotes } }).unwrap();
        toast.success("Return rejected");
        closeModal();
      } else if (action === "pickup") {
        await markPickedUp(id).unwrap();
        toast.success("Marked as picked up");
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Action failed");
    }
  };

  const handleRefund = async () => {
    if (!refundData.refundAmount || refundData.refundAmount <= 0)
      return toast.error("Valid amount required");
    try {
      await processRefund({ id: selectedReturn._id, body: refundData }).unwrap();
      toast.success("Refund processed successfully");
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Refund failed");
    }
  };

  const openModal = (ret, type, img = null) => {
    setSelectedReturn(ret);
    setModalType(type);
    if (type === "image") {
      setPreviewImage(img);
    } else if (type === "refund") {
      const maxRefund = ret.items.reduce((acc, item) => acc + item.price * item.qty, 0);
      setRefundData({ ...refundData, refundAmount: maxRefund });
    }
  };

  const closeModal = () => {
    setSelectedReturn(null);
    setModalType(null);
    setPreviewImage(null);
    setRejectNotes("");
    setRefundData({ refundAmount: "", refundMethod: "", refundTransactionId: "" });
  };

  // Reusable Input Class
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 border-l-4 border-black pl-6 py-2">
            <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
              Return <span className="text-red-600">/ Management</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
              Handle customer returns and refunds
            </p>
          </header>

          {/* Tabs */}
          <nav className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wider border transition-colors rounded-sm
                  ${activeTab === tab ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-black"}
                `}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </nav>

          {/* Returns List */}
          <section>
            {isLoading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : returns && returns.length > 0 ? (
              <div className="space-y-4">
                {returns.map((ret) => (
                  <ReturnCard 
                    key={ret._id} 
                    ret={ret} 
                    handleAction={handleAction}
                    openModal={openModal}
                    isReviewing={isReviewing}
                    isPickingUp={isPickingUp}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm rounded-sm">
                No returns found in this category.
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedReturn && modalType && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md p-6 border border-gray-200 rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {modalType === "image" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-black uppercase font-['Playfair_Display']">
                      Proof Image
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-black text-2xl leading-none"
                    >
                      &times;
                    </button>
                  </div>
                  <img
                    src={previewImage}
                    alt="Proof"
                    className="w-full h-auto max-h-[70vh] object-contain border border-gray-100 rounded-sm"
                  />
                </div>
              )}

              {modalType === "reject" && (
                <div>
                  <h3 className="text-lg font-bold text-black mb-4 uppercase font-['Playfair_Display']">
                    Reject Return
                  </h3>
                  <label className="block text-sm text-gray-600 mb-2 font-bold">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={4}
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    className={`${inputClass} resize-none mb-4`}
                    placeholder="Tell the customer why..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-sm hover:border-black transition-colors rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction("reject", selectedReturn._id)}
                      disabled={isReviewing}
                      className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-wider text-sm hover:bg-red-700 transition-colors disabled:opacity-50 rounded-sm"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}

              {modalType === "refund" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-black uppercase font-['Playfair_Display']">
                    Process Refund
                  </h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-bold">
                      Refund Amount (৳)
                    </label>
                    <input
                      type="number"
                      value={refundData.refundAmount}
                      onChange={(e) => setRefundData({ ...refundData, refundAmount: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-bold">
                      Method (e.g., bKash, Bank)
                    </label>
                    <input
                      type="text"
                      value={refundData.refundMethod}
                      onChange={(e) => setRefundData({ ...refundData, refundMethod: e.target.value })}
                      className={inputClass}
                      placeholder="bKash"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-bold">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={refundData.refundTransactionId}
                      onChange={(e) => setRefundData({ ...refundData, refundTransactionId: e.target.value })}
                      className={inputClass}
                      placeholder="TXN123456"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-sm hover:border-black transition-colors rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRefund}
                      disabled={isRefunding}
                      className="flex-1 py-3 bg-black text-white font-bold uppercase tracking-wider text-sm hover:bg-green-600 transition-colors disabled:opacity-50 rounded-sm"
                    >
                      Confirm Refund
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReturnManagement;