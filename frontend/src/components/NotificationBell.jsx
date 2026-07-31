import { useState, useEffect, useRef } from "react";
import {
  LuBell,
  LuBellRing,
  LuTrash2,
  LuInbox,

} from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";


import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "../redux/api/notificationApiSlice";

import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { data, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkAsReadMutation();
  const [markAllRead] = useMarkAllAsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const unreadCount = data?.stats?.unread || 0;
  const notifications = data?.data || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notification) => {
    try {
      if (!notification.isRead) {
        await markRead(notification._id).unwrap();
      }
      setIsOpen(false);
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      } else if (notification.type === "order") {
        navigate("/user-orders");
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 ১. বেল আইকন (Matches Dark Navbar & Golden Accent) */}
      <button
        className="relative group block p-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 group-hover:bg-white/10">
          {unreadCount > 0 ? (
            <LuBellRing
              className="text-gray-400 group-hover:text-[#D4A843] transition-colors"
              size={18}
            />
          ) : (
            <LuBell
              className="text-gray-400 group-hover:text-[#D4A843] transition-colors"
              size={18}
            />
          )}
        </div>

        {/* গোল্ডেন ব্যাজ (Matches Cart & Favorite Icons) */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 sm:h-[18px] sm:w-[18px]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A843] opacity-50"></span>
            <span className="relative inline-flex items-center justify-center h-4 w-4 sm:h-[18px] sm:w-[18px] text-[8px] sm:text-[9px] font-bold text-[#1A1A1A] bg-[#D4A843] rounded-full border-2 border-[#1A1A1A]">
              {unreadCount > 99 ? "99" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* 🔔 ২. ড্রপডাউন মেনু (Premium Dark Theme) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-4 top-[60px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-[360px] bg-[#252525] border border-white/10 rounded-2xl shadow-2xl z-[999] overflow-hidden"
          >
            {/* হেডার */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-gray-300">
                Notifications
              </h3>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-[10px] font-extrabold uppercase text-[#D4A843] hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* লিস্ট */}
            <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto scrollbar-hide">
              {isLoading ? (
                <div className="p-10 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
                  Loading...
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group relative p-4 flex flex-col gap-1.5 transition-all cursor-pointer ${
                        !n.isRead
                          ? "bg-white/5 hover:bg-white/10"
                          : "hover:bg-white/5"
                      }`}
                      onClick={() => handleMarkAsRead(n)}
                    >
                      {/* আনরিড গোল্ডেন ডট */}
                      {!n.isRead && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#D4A843] rounded-full" />
                      )}

                      <div className="flex justify-between items-start pl-3 pr-6">
                        <h5
                          className={`text-sm tracking-tight ${!n.isRead ? "font-extrabold text-white" : "font-bold text-gray-400"}`}
                        >
                          {n.title}
                        </h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotif(n._id);
                          }}
                          className="absolute top-4 right-3 p-1.5 text-gray-600 hover:text-red-500 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <LuTrash2 size={14} />
                        </button>
                      </div>

                      <p
                        className={`text-xs leading-relaxed line-clamp-2 pl-3 ${!n.isRead ? "text-gray-300 font-medium" : "text-gray-500"}`}
                      >
                        {n.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1 pl-3">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">
                          {n.createdAt
                            ? formatDistanceToNow(new Date(n.createdAt), {
                                addSuffix: true,
                              })
                            : ""}
                        </span>
                        {!n.isRead && (
                          <span className="w-1 h-1 bg-[#D4A843] rounded-full animate-pulse" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center">
                  <LuInbox className="text-gray-700 w-12 h-12 mb-3" />
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            {/* ফুটার */}
            <Link
              to="/all-notifications"
              className="block w-full py-4 text-center bg-[#D4A843] text-[#1A1A1A] hover:bg-[#B88E2F] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2">
                View All Notifications <FiCheckCircle size={14} />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
