import { Link } from "react-router-dom";
import { useGetFooterBannersQuery } from "@redux/api/bannerApiSlice";

const FooterWideBanner = () => {
  // ✅ ব্যাকএন্ড থেকে 'footer' টাইপের ব্যানার নিয়ে আসা হচ্ছে
  const { data: banners, isLoading } = useGetFooterBannersQuery("desktop");

  // ✅ Skeleton Loading State
  if (isLoading) {
    return (
      <section className="py-10 sm:py-14 font-sans">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="relative rounded-sm overflow-hidden h-48 sm:h-64 bg-gray-100 animate-pulse flex items-center justify-between w-full px-6 sm:px-10">
            <div className="space-y-3 w-full">
              {/* Eyebrow Placeholder */}
              <div className="h-3 w-32 bg-gray-300 rounded"></div>
              {/* Headline Placeholder */}
              <div className="h-6 w-64 sm:w-80 bg-gray-300 rounded"></div>
            </div>
            {/* Button Placeholder */}
            <div className="h-9 w-32 bg-gray-300 rounded-sm flex-shrink-0"></div>
          </div>
        </div>
      </section>
    );
  }

  // যদি কোনো ব্যানার না থাকে, তবে কিছু দেখাবে না
  if (!banners || banners.length === 0) return null;

  // প্রথম ফুটার ব্যানারটি দেখাবে
  const banner = banners[0];

  return (
    <section className="py-10 sm:py-14 font-sans">
      <div className="max-w-screen-2xl mx-auto px-4">
        <Link
          to={banner.link || "/shop"} 
          className="group relative rounded-sm overflow-hidden h-48 sm:h-64 bg-black cursor-pointer border border-transparent hover:border-[#B88E2F] transition-all duration-300 flex items-center"
        >
          {/* Background Image */}
          <img
            src={banner.image}
            alt={banner.headline}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-25 group-hover:scale-105 transition-all duration-500"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-6 sm:px-10 gap-4">
            <div>
              {/* subHeadline বা name কে Eyebrow হিসেবে দেখানো হলো */}
              <p className="text-[#B88E2F] text-[11px] font-trebuchet font-black tracking-[0.3em] uppercase mb-1">
                {banner.subHeadline || banner.name}
              </p>
              {/* headline কে Main Title হিসেবে দেখানো হলো */}
              <p className="text-white font-trebuchet text-xl sm:text-2xl font-black uppercase tracking-tight">
                {banner.headline}
              </p>
            </div>
            {/* Button */}
            <span className="bg-[#B88E2F] group-hover:bg-black text-white text-[11px] uppercase font-trebuchet tracking-widest px-6 py-2.5 font-black rounded-sm flex-shrink-0 transition-colors duration-200">
              {banner.buttonText || "Claim Offer"}
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default FooterWideBanner;