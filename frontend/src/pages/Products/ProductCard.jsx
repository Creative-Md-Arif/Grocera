/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { memo } from "react";

// Local helper for standard discount
const calculateEffectivePrice = (product) => {
  const price = product?.price || 0;
  const discountPercent = product?.discountPercentage || 0;
  if (discountPercent > 0) {
    return price - (price * discountPercent) / 100;
  }
  return price;
};

const formatPrice = (val) => Math.round(val).toLocaleString("en-BD");

// Skeleton Loader for Similar View
const SimilarSkeleton = () => (
  <div className="flex gap-4 items-start py-4 border-b border-gray-100 last:border-0 font-sans animate-pulse">
    <div className="w-[80px] h-[80px] flex-shrink-0 bg-gray-200 rounded"></div>
    <div className="flex-1 min-w-0 pt-2">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const ProductCard = ({ p, viewMode }) => {
  // Skeleton Loading State
  if (!p) {
    if (viewMode === "similar") return <SimilarSkeleton />;
    return null;
  }

  // ── আগের ফাংশন (১০০% unchanged) ──
  const finalPrice = calculateEffectivePrice(p);
  const originalPrice = p?.price || 0;
  const displayDiscountPercent = p?.discountPercentage || 0;

  // ── নতুন ক্যাম্পেইন লজিক ──
  const hasCampaign = p?.appliedCampaigns && p.appliedCampaigns.length > 0;
  
  let priceToShow = finalPrice; 
  let crossedPrice = null;

  if (hasCampaign) {
    priceToShow = p.campaignPrice; 
    crossedPrice = originalPrice;     // ✅ এখন সবসময় মূল বেস প্রাইস লাইন-থ্রু হবে
  } else if (displayDiscountPercent > 0) {
    crossedPrice = originalPrice;  // সাধারণ ডিসকাউন্টেও বেস প্রাইস লাইন-থ্রু হবে
  }

  const mainImage =
    Array.isArray(p?.images) && p.images.length > 0
      ? p.images[0]
      : p?.image || "/placeholder.jpg";

  const productPath = `/product/${p?.slug || p?._id}`;

  // ── Similar Products Sidebar Mode ──
  if (viewMode === "similar") {
    return (
      <div className="flex gap-4 items-start py-4 border-b border-gray-100 last:border-0 font-sans">
        <Link to={productPath} className="w-[80px] h-[80px] flex-shrink-0 bg-white flex items-center justify-center overflow-hidden">
          <img
            src={mainImage}
            alt={p?.name}
            className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={productPath} className="block group">
            <h4 className="text-[14px] font-normal text-[#111111] leading-[18px] line-clamp-2 group-hover:text-[#EE4622] group-hover:underline transition-colors duration-200">
              {p?.name}
            </h4>
          </Link>
          
          <div className="flex items-center gap-2 mt-1.5 font-sans">
            <span className="text-[15px] font-bold text-[#D63031]">
              {formatPrice(priceToShow)}৳
            </span>
            {crossedPrice && (
              <span className="text-[13px] text-gray-400 line-through">
                {formatPrice(crossedPrice)}৳
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ✅ Memoized to prevent unnecessary re-renders
export default memo(ProductCard);
