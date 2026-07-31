
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetTopBarBannerQuery, useIncrementBannerClicksMutation } from "@redux/api/bannerApiSlice";
import { FaTimes, FaTruck, FaTag, FaPercent } from "react-icons/fa";
import { Link } from "react-router-dom";

const TopBarBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { data: banner } = useGetTopBarBannerQuery();
  const [incrementClicks] = useIncrementBannerClicksMutation();

  if (!banner || !isVisible) return null;

  const handleClick = async () => {
    await incrementClicks(banner._id);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Store in session so it doesn't show again this session
    sessionStorage.setItem("topbar_closed", "true");
  };

  // Check if already closed this session
  if (sessionStorage.getItem("topbar_closed") === "true") {
    return null;
  }

  // Determine icon based on content
  const getIcon = () => {
    const headline = banner.headline?.toLowerCase() || "";
    if (headline.includes("delivery") || headline.includes("shipping")) {
      return <FaTruck className="mr-2" />;
    }
    if (headline.includes("%") || headline.includes("off") || headline.includes("discount")) {
      return <FaPercent className="mr-2" />;
    }
    return <FaTag className="mr-2" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="w-full py-2.5 px-4 relative z-40"
        style={{ backgroundColor: banner.backgroundColor }}
      >
        <div className="container mx-auto flex items-center justify-center">
          {/* Content */}
          <Link
            to={banner.link || "/shop"}
            onClick={handleClick}
            className="flex items-center text-sm font-bold hover:opacity-80 transition-opacity"
            style={{ color: banner.textColor }}
          >
            {getIcon()}
            <span className="tracking-wide">{banner.headline}</span>
            {banner.buttonText && (
              <span
                className="ml-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                style={{
                  backgroundColor: banner.buttonColor,
                  color: banner.buttonTextColor,
                }}
              >
                {banner.buttonText}
              </span>
            )}
          </Link>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
            style={{ color: banner.textColor }}
          >
            <FaTimes size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TopBarBanner;