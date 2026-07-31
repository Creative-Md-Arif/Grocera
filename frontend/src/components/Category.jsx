import PropTypes from "prop-types";
import { useGetHomepageCategoriesQuery } from "@redux/api/categoryApiSlice"; // ✅ API call 100% unchanged
import { Link } from "react-router-dom";
import { FaFolder } from "react-icons/fa";

const Skeleton = () => (
  <section className="py-10 sm:py-14 bg-white font-sans">
    <div className="max-w-screen-2xl mx-auto px-4">
      <div className="flex flex-col items-center mb-8 sm:mb-10 gap-2">
        <div className="w-44 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="w-10 h-[2px] bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-4 sm:p-5 gap-3"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 animate-pulse" />
            <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ErrorState = () => (
  <section className="py-10 bg-white font-sans">
    <div className="max-w-screen-2xl mx-auto px-4 flex flex-col items-center gap-3 text-center">
      <FaFolder className="w-8 h-8 text-[#B88E2F] opacity-40" />
      <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">
        Failed to Load
      </p>
    </div>
  </section>
);

const EmptyState = () => (
  <section className="py-10 bg-white font-sans">
    <div className="max-w-screen-2xl mx-auto px-4 flex flex-col items-center gap-3 text-center">
      <FaFolder className="w-8 h-8 text-[#B88E2F] opacity-40" />
      <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">
        No Categories Found
      </p>
    </div>
  </section>
);

// ── CategoryCard ── (Clean design, only text color hover, no shadow, no border hover)
const CategoryCard = ({ category }) => (
  <div className="border shadow-md rounded-md overflow-hidden">
    <Link
      to={`/shop?category=${category._id}`}
      aria-label={`Browse ${category.name}`}
      className="group flex flex-col items-center justify-center gap-3 p-4 sm:p-5 bg-white"
    >
      <div className="w-10 h-10 flex items-center justify-center">
        <img
          src={category.image || "/placeholder.jpg"}
          alt={category.name}
          loading="lazy"
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-[11px] lg:text-[16px] text-black font-trebuchet group-hover:text-[#EF4A23] transition-colors duration-300 text-center font-medium tracking-wide capitalize">
        {category.name}
      </p>
    </Link>
  </div>
);

CategoryCard.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
};

// ── Main Component ──
const Category = () => {
  // ✅ API call 100% unchanged
  const { data, error, isLoading } = useGetHomepageCategoriesQuery();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (!Array.isArray(data) || data.length === 0) return <EmptyState />;

  return (
    <section
      aria-labelledby="category-heading"
      className="py-10 sm:py-14 bg-white font-sans"
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2">
          <h2
            id="category-heading"
            className="font-trebuchet text-[18px] font-bold tracking-px text-gray-900 uppercase"
          >
            Featured Category
          </h2>
          <p className="text-[12px] md:text-[14px] font-trebuchet font-normal tracking-px text-gray-600 max-w-xl">
            Explore skincare, makeup, hair care, fragrances, and more.
          </p>
          <div className="h-[2px] w-8 sm:w-10 bg-[#B88E2F] rounded-full" />
        </div>

        {/* Clean Grid Layout — matches image (responsive: 2 → 3 → 4 → 6 → 8 cols) */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 gap-2 sm:gap-3">
          {data.map((cat) => (
            <CategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;
