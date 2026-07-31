import { motion } from "framer-motion";
import { useGetPromotionalBannersQuery } from "@redux/api/bannerApiSlice";
import { FaArrowRight } from "react-icons/fa";

const PromotionalPage = () => {
  const { data: promoBanners, isLoading } = useGetPromotionalBannersQuery("desktop");

  if (isLoading || !promoBanners || promoBanners.length === 0) return null;

  // প্রথম অ্যাক্টিভ প্রমোশনাল ব্যানারটি দেখাবে
  const promo = promoBanners[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      // ✅ 'relative' বাদ দেওয়া হয়েছে, কারণ 'sticky' নিজে থেকেই relative হিসেবে কাজ করে
      className="sticky top-24 h-[500px] lg:h-[calc(100vh-8rem)] rounded-xl overflow-hidden group"
    >
      {/* ✅ Animated Shadow Effect */}
      <motion.div
        animate={{
          boxShadow: [
            "0px 4px 15px rgba(0,0,0,0.1)",
            "0px 8px 25px rgba(0,0,0,0.3)",
            "0px 4px 15px rgba(0,0,0,0.1)",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full rounded-xl overflow-hidden border border-gray-100"
      >
        {/* Background Image Section (Full Height) */}
        {promo.image && (
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={promo.image} 
              alt={promo.headline} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* ছবির উপর কালার গ্রেডিয়েন্ট যাতে টেক্সট পরিষ্কার দেখা যায় */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          </div>
        )}

        {/* Content Overlay (নিচের দিকে থাকবে) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-center flex flex-col items-center">
          
          {/* Offer Badge (উপরে থাকলে ভালো দেখায়) */}
          {promo.buttonType !== "default" && (
            <span 
              className="inline-block px-3 py-1 rounded-sm text-[10px] font-bold mb-3 uppercase tracking-widest text-white"
              style={{ backgroundColor: promo.buttonColor || "#E04F23" }}
            >
              Special Offer
            </span>
          )}

          <h3 
            className="text-lg font-black uppercase tracking-wide drop-shadow-lg mb-2 leading-tight"
            style={{ color: promo.textColor || "#FFFFFF" }}
          >
            {promo.headline}
          </h3>

          {promo.subHeadline && (
            <p 
              className="text-xs mb-5 opacity-90 leading-relaxed line-clamp-3"
              style={{ color: promo.textColor || "#FFFFFF" }}
            >
              {promo.subHeadline}
            </p>
          )}

          {/* Action Button */}
          {promo.link && (
            <a 
              href={promo.link}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105 w-full shadow-lg"
              style={{ 
                backgroundColor: promo.buttonColor || "#000000", 
                color: promo.buttonTextColor || "#ffffff" 
              }}
            >
              {promo.buttonText || "Shop Now"} <FaArrowRight size={10} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PromotionalPage;