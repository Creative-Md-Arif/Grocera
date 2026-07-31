import { memo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetFeaturedReviewsQuery } from "@redux/api/reviewApiSlice";
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

// ── Skeleton Loaders ──
const HeaderSkeleton = () => (
  <div className="flex flex-col items-center mb-8 gap-2.5 animate-pulse">
    <div className="w-20 h-2.5 bg-gray-200/50 rounded-sm" />
    <div className="w-44 h-5 bg-gray-200/70 rounded-sm" />
    <div className="w-12 h-[2px] bg-gray-200/40 rounded-full" />
  </div>
);

const ReviewSkeleton = () => (
  <div className="min-w-[300px] md:min-w-[380px] bg-white border border-gray-100/80 rounded-sm p-6 shadow-sm flex flex-col animate-pulse">
    <div className="h-8 w-8 bg-gray-200/70 rounded-sm mb-4"></div>
    <div className="space-y-2 mb-4">
      <div className="h-3 w-full bg-gray-200/60 rounded-sm"></div>
      <div className="h-3 w-5/6 bg-gray-200/60 rounded-sm"></div>
    </div>
    <div className="flex gap-1 mb-6">
      <div className="w-4 h-4 bg-gray-200/70 rounded-sm"></div>
      <div className="w-4 h-4 bg-gray-200/70 rounded-sm"></div>
      <div className="w-4 h-4 bg-gray-200/70 rounded-sm"></div>
    </div>
    <div className="grow" />
    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
      <div className="w-10 h-10 bg-gray-200/70 rounded-full"></div>
      <div className="space-y-2">
        <div className="w-20 h-3 bg-gray-200/70 rounded-sm"></div>
        <div className="w-14 h-2.5 bg-gray-100/80 rounded-sm"></div>
      </div>
    </div>
  </div>
);

const FeaturedReviews = () => {
  const { data: reviews, isLoading } = useGetFeaturedReviewsQuery();
  const sliderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // ম্যানুয়ালি স্ক্রল করার ফাংশন (Arrow বাটনের জন্য)
  const scroll = (direction) => {
    if (sliderRef.current) {
      const firstChild = sliderRef.current.firstElementChild;
      const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 400; // gap-4 = 16px
      sliderRef.current.scrollBy({ 
        left: direction === "left" ? -scrollAmount : scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  // অটো স্লাইড করার লজিক
  useEffect(() => {
    if (isLoading || !reviews || reviews.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const firstChild = sliderRef.current.firstElementChild;
        const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 400;

        // যদি শেষ পর্যন্ত স্ক্রল হয়ে যায়, তবে আবার শুরুতে চলে যাবে
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 3000); // ৩ সেকেন্ড পর পর স্লাইড হবে

    return () => clearInterval(interval);
  }, [isLoading, reviews, isPaused]);

  if (isLoading) {
    return (
      <section className="py-10 sm:py-14 font-sans" aria-busy="true">
        <div className="max-w-screen-2xl mx-auto px-4">
          <HeaderSkeleton />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <ReviewSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) return null;

  return (
    <section
      className="py-10 sm:py-14 font-sans"
      aria-labelledby="reviews-heading"
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2">
          <h2
            id="reviews-heading"
             className="font-trebuchet text-[18px] font-bold tracking-px text-gray-900 uppercase"
          >
            Customer Reviews
          </h2>
          <p className="text-[12px] md:text-[14px] font-trebuchet font-normal tracking-px text-gray-600 max-w-xl">
            Real reviews from our verified buyers — see what they love about our products.
          </p>
          <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full" />
        </div>

        {/* Slider Container with Arrows */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md rounded-full hidden md:flex items-center justify-center text-gray-600 hover:bg-[#B88E2F] hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <FaChevronLeft size={16} />
          </button>

          {/* Horizontal Scrollable Slider (no-scrollbar ব্যবহার করা হয়েছে) */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[300px] md:min-w-[380px] snap-start bg-white p-6 rounded-sm border-[.5px] flex flex-col shadow-md transition-shadow font-figtree"
              >
                {/* Top Section: Quote & Rating */}
                <div>
                  <FaQuoteLeft className="text-gray-200/70 text-3xl mb-3" />
                  <p className="text-gray-700 text-[14px] font-trebuchet leading-relaxed mb-4 line-clamp-4">
                    {review.comment}
                  </p>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        size={14}
                        className={i < review.rating ? "text-[#B88E2F]" : "text-gray-200"}
                      />
                    ))}
                  </div>
                </div>

                <div className="grow" />

                {/* Bottom Section: User & Product */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B88E2F] font-trebuchet text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {review.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold font-trebuchet text-[14px] text-gray-900 truncate">{review.name}</h4>
                    <Link 
                      to={`/product/${review.product.slug || review.product._id}`}
                      className="text-[12px] font-trebuchet text-[#B88E2F] hover:underline truncate block"
                    >
                      {review.product.name}
                    </Link>
                  </div>
                  {review.product.image && (
                    <img 
                      src={review.product.image} 
                      alt={review.product.name} 
                      className="w-10 h-10 object-cover rounded-sm border border-gray-100 flex-shrink-0"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md rounded-full hidden md:flex items-center justify-center text-gray-600 hover:bg-[#B88E2F] hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <FaChevronRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default memo(FeaturedReviews);