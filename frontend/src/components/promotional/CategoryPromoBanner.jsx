import { Link } from "react-router-dom";
import { useGetCategoryBannersQuery } from "@redux/api/bannerApiSlice";

const btnClass =
  "inline-flex items-center gap-2 px-5 py-2 border border-white/40 rounded-sm text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white bg-white/10 backdrop-blur-sm hover:bg-[#B88E2F] hover:border-[#B88E2F] transition-all duration-200";

const CategoryPromoBanner = () => {
  const { data: banners, isLoading } = useGetCategoryBannersQuery("desktop");


  if (isLoading) {
    return (
      <section className="py-10 sm:py-14 font-sans">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex flex-col items-center mb-8 text-center gap-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-[2px] w-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative h-56 sm:h-72 bg-gray-100 rounded-sm animate-pulse overflow-hidden flex flex-col justify-end p-5 sm:p-6 gap-2"
              >
                {/* Eyebrow Placeholder */}
                <div className="h-3 w-1/3 bg-gray-300 rounded"></div>
                {/* Title Placeholder */}
                <div className="h-5 w-2/3 bg-gray-300 rounded"></div>
                {/* Button Placeholder */}
                <div className="h-8 w-24 bg-gray-300 rounded-sm mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) return null;

  const displayBanners = banners.slice(0, 3);

  return (
    <section className="py-10 sm:py-14 font-sans">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex flex-col items-center mb-8 text-center gap-2">
          <h2  className="font-trebuchet text-[18px] font-bold tracking-px text-gray-900 uppercase">
            Shop By Department
          </h2>
          <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {displayBanners.map((b) => {
            const linkUrl = b.category
              ? `/shop?category=${b.category._id}`
              : b.link || "/shop";

            return (
              <Link
                key={b._id}
                to={linkUrl}
                className="group relative rounded-sm overflow-hidden h-56 sm:h-72 bg-black cursor-pointer border border-transparent hover:border-[#B88E2F] transition-all duration-300 flex items-end"
              >
                <img
                  src={b.image}
                  alt={b.headline}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="relative z-10 p-5 sm:p-6 flex flex-col gap-2">
                  <p className="text-[#B88E2F] font-trebuchet text-[11px] font-black tracking-px uppercase">
                    {b.subHeadline || b.name}
                  </p>

                  <p className="text-white font-trebuchet font-black text-xl uppercase tracking-px">
                    {b.headline}
                  </p>

                  <span
                    className={`w-fit ${btnClass} opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`}
                  >
                    {b.buttonText || "Shop"}{" "}
                    <span className="text-[10px] font-trebuchet text-white font-medium tracking-px">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryPromoBanner;