import { useState, memo, useMemo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import {
  useGetAllSubscribersQuery,
  useDeleteSubscriberMutation,
} from "@redux/api/newsletterApiSlice";
import { toast } from "react-toastify";
import {
  FaEnvelopeOpenText,
  FaTrash,
  FaUserCheck,
  FaUserSlash,
  FaUsers,
} from "react-icons/fa";

// --- Skeleton Loaders ---
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 p-4 rounded-sm h-24 animate-pulse"
      ></div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="h-14 border-b border-gray-100 last:border-0 animate-pulse bg-gray-50"
      ></div>
    ))}
  </div>
);

// --- Memoized Row ---
const SubscriberRow = memo(function SubscriberRow({
  subscriber,
  index,
  handleDelete,
  deletingId,
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
    >
      <td className="px-4 py-3 text-sm text-black font-bold">
        {subscriber.email}
      </td>
      <td className="px-4 py-3">
        <span
          className={`border text-sm font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${
            subscriber.isActive
              ? "bg-white text-black border-black"
              : "bg-white text-gray-500 border-gray-300"
          }`}
        >
          {subscriber.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 uppercase tracking-wider">
        {new Date(subscriber.subscribedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => handleDelete(subscriber._id, subscriber.email)}
          disabled={deletingId === subscriber._id}
          className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deletingId === subscriber._id ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <FaTrash size={12} /> Del
            </>
          )}
        </button>
      </td>
    </motion.tr>
  );
});

SubscriberRow.propTypes = {
  subscriber: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    subscribedAt: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleDelete: PropTypes.func.isRequired,
  deletingId: PropTypes.string,
};

const NewsletterManage = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const queryParams =
    filterStatus === "all"
      ? undefined
      : { active: filterStatus === "active" ? "true" : "false" };

  const { data, isLoading, refetch } = useGetAllSubscribersQuery(queryParams);
  const [deleteSubscriber] = useDeleteSubscriberMutation();

  const subscribers = useMemo(() => data?.data || [], [data]);

  const stats = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter((s) => s.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [subscribers]);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Delete subscriber "${email}"?`)) return;
    setDeletingId(id);
    try {
      await deleteSubscriber(id).unwrap();
      toast.success("Subscriber deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete subscriber");
    } finally {
      setDeletingId(null);
    }
  };

  const selectClass =
    "bg-white border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-bold uppercase tracking-wider focus:ring-1 focus:ring-black focus:border-black outline-none transition-all cursor-pointer font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                 Manage Email Subscriber List
              </h2>

          
            </div>
          </header>

          {/* Stats Cards */}
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaUsers className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Total
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.total}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaUserCheck className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Active
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.active}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaUserSlash className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Inactive
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Filters */}
          <section className="flex flex-col sm:flex-row gap-3 mb-6 p-4 border border-gray-200 rounded-sm bg-white">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`${selectClass} w-full sm:w-auto`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </section>

          {/* Table */}
          {isLoading ? (
            <TableSkeleton />
          ) : subscribers.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-sm bg-white">
              <FaEnvelopeOpenText className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                No subscribers found
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      Subscribed
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-widest text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, index) => (
                    <SubscriberRow
                      key={subscriber._id}
                      subscriber={subscriber}
                      index={index}
                      handleDelete={handleDelete}
                      deletingId={deletingId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewsletterManage;
