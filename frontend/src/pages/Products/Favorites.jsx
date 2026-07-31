/* eslint-disable react/prop-types */
import { useSelector, useDispatch } from "react-redux";
import { useCallback, memo } from "react";
import {
  selectFavoriteProduct,
  removeFromFavorites,
} from "../../redux/features/favorite/favoriteSlice";
import { removeFavoriteFromLocalStorage } from "../../Utils/localStorage";
import Product from "../Products/Product";
import { Link } from "react-router-dom";
import { LuHeart } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { FaArrowRight, FaHome } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

// --- Memoized Favorite Item Component ---
const FavoriteItem = memo(function FavoriteItem({ product, onRemove }) {
  return (
    <article className="relative group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Product Component */}
      <Product product={product} />

      {/* Interactive Remove Button */}
      <button
        onClick={() => onRemove(product)}
        className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 hover:scale-110 transition-all duration-200 shadow-sm z-10 border border-gray-100 hover:border-red-200"
        aria-label="Remove from favorites"
      >
        <IoMdClose size={16} />
      </button>
    </article>
  );
});

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavoriteProduct);

  const removeHandler = useCallback(
    (product) => {
      dispatch(removeFromFavorites(product));
      removeFavoriteFromLocalStorage(product._id);
    },
    [dispatch],
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Trebuchet_MS']">
      {/* Breadcrumb & Header Section */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className=" max-w-screen-2xl mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium flex-wrap bg-white"
          >
            <Link
              to="/"
              className="flex items-center gap-1.5 text-black hover:underline text-sm font-medium"
            >
              <FaHome className="text-sm" />
              <span>Home</span>
            </Link>

            <span className="contents">
              <HiChevronRight className="text-sm text-black flex-shrink-0" />
              <span className="text-black font-black text-sm">Wishlist</span>
            </span>
          </nav>

  

        </div>
      </header>

      {/* Content Section */}
      <main className="max-w-7xl mx-auto px-4 mt-8 sm:mt-10">
        {favorites.length === 0 ? (
          // Empty State Design
          <section className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <LuHeart className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-lg sm:text-xl font-['Playfair_Display'] font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-xs">
              Save your favorite items here to find them easily later.
            </p>
            <Link
              to="/shop"
              className="flex items-center gap-2 bg-black text-white py-3 px-8 rounded-lg font-bold uppercase text-sm tracking-widest hover:bg-[#D4A843] transition-all shadow-md"
            >
              Explore Shop <FaArrowRight size={14} />
            </Link>
          </section>
        ) : (
          // Grid Design
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favorites.map((product) => (
              <FavoriteItem
                key={product._id}
                product={product}
                onRemove={removeHandler}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Favorites;
