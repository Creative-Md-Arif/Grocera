import { Link } from "react-router-dom";
import { useGetBrandsQuery } from "../../redux/api/brandApiSlice";
import { FaLongArrowAltRight, FaTags } from "react-icons/fa";

// BestSellers-এর স্কেলেটনের মতো একই ডিজাইন
const BrandCardSkeleton = () => (
  <div
    className="bg-white border border-gray-100/80 rounded-sm overflow-hidden flex flex-col h-full font-figtree shadow-sm"
    aria-hidden="true"
  >
    {/* Image area */}
    <div className="relative aspect-square bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden animate-pulse">
      <FaTags className="text-gray-200/70 text-2xl" />
    </div>

    {/* Content area */}
    <div className="px-3 py-3 flex flex-col grow border-t border-gray-50 text-center">
      <div className="mx-auto w-2/3 h-3 bg-gray-200/60 rounded-sm animate-pulse" />
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="flex flex-col items-center mb-8 gap-2.5 animate-pulse">
    <div className="w-20 h-2.5 bg-gray-200/50 rounded-sm" />
    <div className="w-44 h-5 bg-gray-200/70 rounded-sm" />
    <div className="w-12 h-[2px] bg-gray-200/40 rounded-full" />
  </div>
);

const ShopByBrand = () => {
  // 10টি ব্র্যান্ড নিয়ে আসছি BestSellers-এর মতো
  const { data, isLoading, isError } = useGetBrandsQuery({
    isActive: "true",
    limit: 10,
  });
  
  const brands = data?.brands || [];

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 font-sans" aria-busy="true">
        <div className="max-w-screen-2xl mx-auto px-4">
          <HeaderSkeleton />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <BrandCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-10 sm:py-14"
      aria-labelledby="shop-by-brand-heading"
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Header - BestSellers এর মতো সেম স্টাইল */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2">
          <h2
            id="shop-by-brand-heading"
            className="font-trebuchet text-[18px] font-bold tracking-px text-gray-900 uppercase"
          >
            Shop By Brand
          </h2>
          <p className="text-[12px] md:text-[14px] font-trebuchet font-normal tracking-px text-gray-600 max-w-xl">
            Discover top-rated products from your favorite trusted brands.
          </p>
          <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full" />
        </div>

        {isError ? (
          <p className="text-center text-red-500 text-sm font-medium">
            Failed to load brands. Please try again.
          </p>
        ) : (
          <>
            {/* BestSellers এর সেম গ্রিড লেআউট */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {brands.slice(0, 10).map((brand) => (
                <Link
                  to={`/brand/${brand.slug || brand._id}`}
                  key={brand._id}
                  className="group bg-white border rounded-sm overflow-hidden flex flex-col h-full shadow-md transition-all duration-300 "
                >
                  {/* Image area */}
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden p-4">
                    {brand.image ? (
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 grayscale group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <FaTags className="text-2xl" />
                      </div>
                    )}
                  </div>

                  {/* Content area */}
                  <div className="px-3 py-3 flex flex-col grow border-t border-gray-50 text-center">
                    <h3 className="text-[13px] font-trebuchet font-medium text-gray-800 uppercase tracking-wide truncate group-hover:text-[#B88E2F] hover:underline transition-colors">
                      {brand.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button - BestSellers এর সেম ডিজাইন */}
            <div className="flex justify-center mt-10">
              <Link
                to="/brands"
                className="group inline-flex items-center gap-2 px-6 py-2.5 border border-[#B88E2F] rounded-none text-[14px] font-medium uppercase tracking-[0.18em] text-[#B88E2F] hover:bg-[#B88E2F] hover:text-white transition-all duration-300 bg-white"
                style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
              >
                View All
                <FaLongArrowAltRight className="w-[13px] h-[13px] shrink-0 text-[#B88E2F] group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ShopByBrand;