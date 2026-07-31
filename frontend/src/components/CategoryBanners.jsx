import { motion } from "framer-motion";
import { useGetCategoryBannersQuery, useIncrementBannerClicksMutation } from "@redux/api/bannerApiSlice";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const CategoryBanners = () => {
  const { data: banners, isLoading } = useGetCategoryBannersQuery();
  const [incrementClicks] = useIncrementBannerClicksMutation();

  console.log(banners);
  

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!banners?.length) return null;

  const handleClick = async (bannerId) => {
    await incrementClicks(bannerId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {banners.map((banner, index) => (
        <motion.div
          key={banner._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="relative group overflow-hidden rounded-2xl h-64 md:h-80"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={banner.image}
              alt={banner.headline}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${banner.backgroundColor}ee 0%, ${banner.backgroundColor}60 60%, transparent 100%)`
              }}
            />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center p-6 md:p-10">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70"
              style={{ color: banner.textColor }}
            >
              {banner.category?.name || "Category"}
            </motion.span>

            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-black mb-2"
              style={{ color: banner.textColor }}
            >
              {banner.headline}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm mb-6 max-w-xs"
              style={{ color: banner.textColor, opacity: 0.8 }}
            >
              {banner.subHeadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to={banner.category ? `/category/${banner.category.slug}` : banner.link || "/shop"}
                onClick={() => handleClick(banner._id)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all hover:scale-105"
                style={{
                  backgroundColor: banner.buttonColor,
                  color: banner.buttonTextColor,
                }}
              >
                {banner.buttonText}hnhgjh
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryBanners;