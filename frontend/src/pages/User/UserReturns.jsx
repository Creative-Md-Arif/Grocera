/* eslint-disable react/prop-types */
import { useGetMyReturnsQuery } from "@redux/api/returnApiSlice";
import { FaBoxOpen, FaImage } from "react-icons/fa6";
import { motion } from "framer-motion";

const SkeletonLine = ({ className = "w-full h-4" }) => (
  <div className={`${className} bg-gray-200 animate-pulse rounded-sm`}></div>
);

const UserReturns = () => {
  const { data: returns, isLoading } = useGetMyReturnsQuery();

  const getStatusBadge = (status) => {
    const styles = {
      requested: "bg-yellow-100 text-yellow-700",
      approved: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
      picked_up: "bg-indigo-100 text-indigo-700",
      refunded: "bg-green-100 text-green-700",
      cancelled: "bg-gray-100 text-gray-600",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black uppercase tracking-tight">My Returns</h1>
          <p className="text-sm text-gray-500 mt-1">View status of your returned items</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 p-6">
                <SkeletonLine className="w-1/3 h-5 mb-4" />
                <SkeletonLine className="w-full h-16" />
              </div>
            ))}
          </div>
        ) : returns && returns.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {returns.map((ret) => (
              <div key={ret._id} className="bg-white border border-gray-200 p-6 hover:border-gray-400 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-base font-bold text-black">#{ret.orderId}</p>
                  </div>
                  <span className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold uppercase rounded-sm ${getStatusBadge(ret.returnStatus)}`}>
                    {ret.returnStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {ret.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover border border-gray-200" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center border border-gray-200">
                          <FaImage className="text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-black">{item.name}</p>
                        <p className="text-gray-500 text-sm">Qty: {item.qty} | ৳{item.price}</p>
                        {item.variantInfo?.sizeName && (
                          <p className="text-gray-400 text-sm">Variant: {item.variantInfo.colorName} / {item.variantInfo.sizeName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 border border-gray-100">
                  <div>
                    <span className="text-gray-500 block">Reason:</span>
                    <span className="font-medium text-black">{ret.returnReason}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Requested On:</span>
                    <span className="font-medium text-black">{new Date(ret.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ret.returnStatus === "refunded" && ret.refundAmount > 0 && (
                    <div className="sm:col-span-2 pt-2 border-t border-gray-200">
                      <span className="text-green-600 font-bold">Refund Amount: ৳{ret.refundAmount}</span>
                      {ret.refundMethod && <span className="text-gray-500 ml-2">via {ret.refundMethod}</span>}
                    </div>
                  )}
                  {ret.adminNotes && (
                    <div className="sm:col-span-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 block">Admin Note:</span>
                      <span className="text-sm text-gray-700 italic">{ret.adminNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-gray-200 bg-white">
            <FaBoxOpen size={48} className="text-gray-300 mb-4" />
            <p className="text-base font-semibold text-gray-500">No return requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReturns;