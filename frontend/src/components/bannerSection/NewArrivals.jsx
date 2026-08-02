import { Link } from "react-router-dom";
import { useGetNewArrivalsQuery } from "../../redux/api/productApiSlice";
import Product from "../../pages/Products/Product";
import Message from "../Message";
import { FaShoppingBag } from "react-icons/fa";

const NEW_ARRIVALS_LIMIT = 10;

const ProductSkeleton = () => (
  <div
    className="bg-white border border-gray-100/80 rounded-sm overflow-hidden flex flex-col h-full font-figtree shadow-sm"
    aria-hidden="true"
  >
    <div className="relative aspect-square bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden animate-pulse">
      <FaShoppingBag className="text-gray-200/70 text-2xl" />
    </div>

    {/* Content area */}
    <div className="px-3 pb-3 sm:px-3.5 flex flex-col grow border-t pt-4 border-gray-50">
      <div className="mb-2 space-y-2 animate-pulse">
        <div className="w-full h-3 bg-gray-200/60 rounded-sm" />
        <div className="w-2/3 h-3 bg-gray-200/60 rounded-sm" />
      </div>

      <div className="grow" />

      {/* Price row */}
      <div className="flex items-baseline gap-2 mt-1 pt-2 animate-pulse">
        <div className="w-14 h-3.5 bg-gray-200/70 rounded-sm" />
        <div className="w-9 h-2.5 bg-gray-100/80 rounded-sm" />
      </div>
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

const NewArrivals = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useGetNewArrivalsQuery(NEW_ARRIVALS_LIMIT);

  console.log(products);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 font-sans" aria-busy="true">
        <div className="max-w-screen-2xl mx-auto px-4">
          <HeaderSkeleton />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: NEW_ARRIVALS_LIMIT }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-10 sm:py-14 font-sans"
      aria-labelledby="new-arrivals-heading"
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2">
          <h2
            id="new-arrivals-heading"
            className="font-trebuchet text-[18px] font-bold tracking-px text-gray-900 uppercase"
          >
            New Arrivals
          </h2>
          <p className="text-[12px] md:text-[14px] font-trebuchet font-normal tracking-px text-gray-600 max-w-xl">
            Discover the freshest groceries, daily essentials, and new products
            added to our shelves.
          </p>
          <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full" />
        </div>

        {isError ? (
          <Message variant="danger">
            Failed to load new arrivals. Please try again.
          </Message>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {products?.slice(0, NEW_ARRIVALS_LIMIT).map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <Link
                to="/shop?sort=newest"
                className="group inline-flex items-center justify-center gap-3 px-6 py-2.5 border border-[#B88E2F] rounded-[4px] text-[13px] font-medium uppercase tracking-[0.18em] text-[#B88E2F] hover:bg-[#B88E2F] hover:text-white transition-all duration-300 bg-white"
                style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
              >
                <span>View All</span>

                <span className="text-[14px] leading-none transition-transform duration-300 group-hover:translate-x-1">
                  ➔
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
