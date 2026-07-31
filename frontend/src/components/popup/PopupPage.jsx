
import { useGetPopupBannerQuery } from "@redux/api/bannerApiSlice";
import { toast } from "react-toastify";
import { FaTimes, FaCopy, FaGift } from "react-icons/fa";
import { useEffect, useState } from "react";

const PopupPage = () => {
  const { data: popupBanner, isLoading } = useGetPopupBannerQuery("desktop");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && popupBanner && popupBanner._id) {
      // Local Storage চেক করা হচ্ছে - ইউজার কি সম্প্রতি এটি ক্লোজ করেছে?
      const lastShown = localStorage.getItem(`popup_closed_${popupBanner._id}`);
      const showAgainAfter = popupBanner.popupSettings?.showAgainAfter || 24; // ডিফল্ট ২৪ ঘন্টা
      
      if (!lastShown || (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60) > showAgainAfter) {
        // Delay সেট করা হচ্ছে (সেকেন্ড থেকে মিলিসেকেন্ডে কনভার্ট)
        const delaySeconds = popupBanner.popupSettings?.delay || 5;
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, delaySeconds * 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [popupBanner, isLoading]);

  const handleClose = () => {
    setIsVisible(false);
    if (popupBanner?._id) {
      // ক্লোজ করার সময়টি Local Storage এ সেভ করা হলো
      localStorage.setItem(`popup_closed_${popupBanner._id}`, Date.now().toString());
    }
  };

  const handleCopyCoupon = () => {
    if (popupBanner?.popupSettings?.couponCode) {
      navigator.clipboard.writeText(popupBanner.popupSettings.couponCode);
      toast.success("Coupon code copied!");
    }
  };

  // Stop background scroll when popup is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isVisible]);

  if (isLoading || !isVisible || !popupBanner) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="relative bg-white rounded-lg overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md transition-all"
          aria-label="Close popup"
        >
          <FaTimes size={16} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
          <img 
            src={popupBanner.image} 
            alt={popupBanner.headline} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div 
          className="w-full md:w-1/2 p-8 flex flex-col justify-center text-center items-center"
          style={{ 
            backgroundColor: popupBanner.backgroundColor || "#ffffff", 
            color: popupBanner.textColor || "#000000" 
          }}
        >
          {popupBanner.buttonType !== "default" && (
            <span className=" bg-black text-white px-3 py-1 rounded-sm text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
              <FaGift /> Special Offer
            </span>
          )}

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 font-['Playfair_Display']">
            {popupBanner.headline}
          </h2>
          
          {popupBanner.subHeadline && (
            <p className="text-sm md:text-base mb-6 opacity-80">
              {popupBanner.subHeadline}
            </p>
          )}

          {/* Coupon Code Section */}
          {popupBanner.popupSettings?.couponCode && (
            <div className="w-full mb-6">
              <p className="text-xs uppercase tracking-widest mb-2 opacity-60">Use Coupon Code</p>
              <div 
                className="flex items-center justify-between border-2 border-dashed p-3 rounded-lg w-full cursor-pointer hover:bg-black/5 transition-colors"
                style={{ borderColor: popupBanner.textColor || "#000000" }}
                onClick={handleCopyCoupon}
              >
                <span className="text-lg font-black tracking-widest font-['Trebuchet_MS']">
                  {popupBanner.popupSettings.couponCode}
                </span>
                <FaCopy className="opacity-50" />
              </div>
              {popupBanner.popupSettings?.discountAmount > 0 && (
                <p className="text-sm font-bold mt-2 text-red-600">
                  Save ৳{popupBanner.popupSettings.discountAmount} Now!
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          {popupBanner.link && (
            <a 
              href={popupBanner.link} 
              onClick={handleClose}
              className="px-8 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-opacity rounded-sm w-full md:w-auto"
              style={{ 
                backgroundColor: popupBanner.buttonColor || "#000000", 
                color: popupBanner.buttonTextColor || "#ffffff" 
              }}
            >
              {popupBanner.buttonText || "Shop Now"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupPage;