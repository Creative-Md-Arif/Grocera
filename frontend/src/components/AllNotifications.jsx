/* eslint-disable no-unused-vars */
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
} from "../redux/api/notificationApiSlice.js";
import Loader from "../components/Loader.jsx";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { LuBell, LuBellRing, LuInbox } from "react-icons/lu";
import { Link } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";


const AllNotifications = () => {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();

  if (isLoading) return <Loader />;
  if (error)
    return (
      <div className="text-center py-10 text-red-500 font-mono uppercase tracking-widest">
        Critical Error: System couldn&apos;t fetch data.
      </div>
    );

  const notifications = response?.data || [];

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="bg-[#FDFDFD] min-h-screen pb-20">
  
      <div className=" py-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold border-l-4 border-red-600 pl-4 text-gray-800 uppercase tracking-widest font-mono">
                Notifications <span className="text-red-600">Alerts</span>
              </h1>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em] ml-5">
                <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-gray-900 font-black">Notifications</span>
              </div>
            </div>
            
            {/* আনরিড কাউন্টার ব্যাজ */}
            <div className="flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-2xl self-start md:self-auto shadow-lg shadow-gray-200">
               <LuBellRing className={`w-4 h-4 ${response?.stats?.unread > 0 ? "text-red-500 animate-bounce" : "text-gray-400"}`} />
               <span className="text-[11px] font-mono font-black uppercase tracking-widest">
                 Unread: {response?.stats?.unread || 0}
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-4xl">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              <AnimatePresence>
                {notifications.map((n, index) => (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                    className={`group p-6 transition-all cursor-pointer flex items-start gap-5 relative overflow-hidden ${
                      !n.isRead
                        ? "bg-red-50/30"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* একটিভ ইন্ডিকেটর বার */}
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600" />
                    )}

                    {/* আইকন সেকশন */}
                    <div className={`mt-1 p-3 rounded-xl ${!n.isRead ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"}`}>
                      {n.isRead ? <FiCheckCircle size={18} /> : <LuBell size={18} />}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                        <h3
                          className={`text-sm tracking-tight font-mono uppercase ${
                            !n.isRead ? "font-black text-gray-900" : "font-bold text-gray-500"
                          }`}
                        >
                          {n.title}
                        </h3>
                        <span className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-tighter">
                          {n.createdAt && format(new Date(n.createdAt), "dd MMM, hh:mm a")}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed font-medium ${!n.isRead ? "text-gray-700" : "text-gray-400"}`}>
                        {n.message}
                      </p>
                    </div>

                    {/* হোভার করলে মার্ক করার ইন্ডিকেশন */}
                    {!n.isRead && (
                      <div className="hidden md:flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest mr-2">Mark as read</span>
                         <FiCheckCircle className="text-red-600" size={16} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* 🟢 ২. এম্পটি স্টেট (Smooth Ease) */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center"
            >
              <div className="inline-flex p-8 rounded-full bg-gray-50 mb-6">
                <LuInbox className="w-16 h-16 text-gray-200" />
              </div>
              <p className="text-gray-400 font-mono text-xs font-black uppercase tracking-[0.3em]">
                System Log Clear / No New Alerts
              </p>
            </motion.div>
          )}
        </div>

        {/* ফুটার হেল্প টেক্সট */}
        <div className="mt-8 text-center">
           <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">
             Grocera Security & Notification Protocol v2.0
           </p>
        </div>
      </div>
    </div>
  );
};

export default AllNotifications;