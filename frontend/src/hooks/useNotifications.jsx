/* eslint-disable no-unused-vars */
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import websocketService from "../services/websocketService";
import { notificationApiSlice } from "@redux/api/notificationApiSlice";
import { toast } from "react-toastify";

export const useNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const audioRef = useRef(new Audio("/notification.mp3"));

  useEffect(() => {
    if (userInfo && userInfo._id) {
      websocketService.connect(userInfo._id);

      const notificationSound = audioRef.current;
      notificationSound.preload = "auto";

      // ১. অডিও আনলক লজিক
      const unlockAudio = () => {
        notificationSound
          .play()
          .then(() => {
            notificationSound.pause();
            notificationSound.currentTime = 0;
            window.removeEventListener("click", unlockAudio);
          })
          .catch(() => {});
      };
      window.addEventListener("click", unlockAudio);

      websocketService.onNotification((notification) => {
        // ২. ক্যাশ রিফ্রেশ
        dispatch(
          notificationApiSlice.util.invalidateTags([
            { type: "Notification", id: "LIST" },
          ]),
        );

        // ৩. সাউন্ড প্লে
        const playSound = async () => {
          try {
            notificationSound.currentTime = 0;
            await notificationSound.play();
          } catch (e) {
            console.warn("🔊 Sound blocked.");
          }
        };
        playSound();

        // ৪. নেভিগেশন ফাংশন (নির্ভুলভাবে কাজ করার জন্য)
        const handleNavigate = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }

          toast.dismiss(); // টোস্ট বন্ধ করা

          // নেভিগেশন কল
          setTimeout(() => {
            if (notification.actionUrl) {
              navigate(notification.actionUrl);
            } else {
              navigate("/user-orders");
            }
          }, 100);
        };

        // ৫. প্রফেশনাল JSX টোস্ট
        toast.info(
          <article
            className="flex flex-col gap-1"
            aria-labelledby="notification-title"
          >
            <header className="flex items-center justify-between">
              <span
                id="notification-title"
                className="font-bold text-sm flex items-center gap-1"
              >
                <span aria-hidden="true">🔔</span>
                {notification.title}
              </span>
              <span
                className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded font-bold"
                aria-label="New Notification"
              >
                NEW
              </span>
            </header>

            <p className="text-xs opacity-90 line-clamp-2">
              {notification.message}
            </p>

            <button
              onClick={handleNavigate}
              aria-label={`View order details for ${notification.title}`}
              className="mt-2 bg-blue-600 text-white text-[10px] font-bold py-1 px-3 rounded shadow-sm hover:bg-blue-700 transition-colors self-start focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
            >
              VIEW ORDER DETAILS
            </button>
          </article>,
          {
            position: "bottom-right",
            autoClose: 10000, // ইউজারকে সময় দেওয়া
            closeOnClick: false,
            draggable: false,
          },
        );
      });
    }
  }, [userInfo, dispatch, navigate]);
};
