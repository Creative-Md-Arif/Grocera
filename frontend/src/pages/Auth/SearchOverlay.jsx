import { useState, useEffect, useCallback, useMemo, memo } from "react";
import PropTypes from "prop-types";
import { IoSearchOutline, IoCloseOutline, IoArrowForward } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../../redux/api/productApiSlice";

// ─── 1. Custom Hook: useDebounce ────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ─── 2. Utility: highlightMatch ─────────────────────────────────────────────
function highlightMatch(text, term) {
  if (!term || !text) return text;
  const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = String(text).split(new RegExp(`(${safeTerm})`, "gi"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} className="bg-yellow-300 text-inherit rounded-[2px] px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── 3. Memoized Component: SearchResultItem ────────────────────────────────
const SearchResultItem = memo(function SearchResultItem({ product, query, onClick }) {
  const to = `/product/${product.slug || product._id}`;
  
  // Memoize expensive highlight calculation
  const highlightedName = useMemo(
    () => highlightMatch(product.name, query),
    [product.name, query]
  );

  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <Link
        to={to}
        onClick={onClick}
        className="group flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors -mx-2 px-2 rounded-md"
      >
        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          {product.brand && (
            <p className="text-[11px] font-trebuchet font-bold uppercase tracking-px text-[#D4A843]">
              {product.brand}
            </p>
          )}
          <p className="text-[13px] sm:text-sm font-trebuchet font-medium text-gray-800 truncate">
            {highlightedName}
          </p>
          {product.category?.name && (
            <p className="text-[11px] text-gray-400 font-trebuchet truncate">
              {product.category.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[13px] sm:text-sm font-trebuchet font-bold text-gray-900">
            ৳{product.price?.toLocaleString()}
          </span>
          <IoArrowForward
            className="text-gray-300 group-hover:text-[#D4A843] group-hover:translate-x-0.5 transition-all"
            size={16}
          />
        </div>
      </Link>
    </li>
  );
});

SearchResultItem.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    slug: PropTypes.string,
    name: PropTypes.string.isRequired,
    brand: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
    price: PropTypes.number,
  }).isRequired,
  query: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

// ─── 4. Main Component: SearchOverlay ───────────────────────────────────────
export default function SearchOverlay({
  open,
  onClose,
  externalQuery = "", // Default empty string to prevent undefined errors
  showInput = false,
  inputRef,
}) {
  const navigate = useNavigate();
  
  // Local state for Mobile embedded input (isolated from Navigation re-renders)
  const [localQuery, setLocalQuery] = useState("");
  const debouncedLocalQuery = useDebounce(localQuery, 400);
  
  // Desktop uses externalQuery (already debounced in Navigation), Mobile uses local
  const activeQuery = (showInput ? debouncedLocalQuery : externalQuery) || "";
  
  const { data, isFetching, isLoading } = useGetProductsQuery(
    { keyword: activeQuery, page: 1 },
    { skip: activeQuery.length < 2 }
  );

  // Safely handle both array or object response from API
  const apiProducts = Array.isArray(data) ? data : data?.products;
  const results = (apiProducts ?? []).slice(0, 10);
  const hasQuery = activeQuery.length >= 2;

  const goToAllResults = useCallback(() => {
    navigate(`/shop?keyword=${encodeURIComponent(activeQuery)}`);
    onClose();
  }, [navigate, activeQuery, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryToSubmit = showInput ? localQuery : externalQuery;
    if (queryToSubmit.trim().length >= 2) {
      navigate(`/shop?keyword=${encodeURIComponent(queryToSubmit.trim())}`);
      onClose();
    }
  };

  // Clear mobile input when overlay closes
  useEffect(() => {
    if (!open) setLocalQuery("");
  }, [open]);

  return (
    <div
      className={`search-dropdown fixed left-0 right-0 z-[1000] top-14 sm:top-16 lg:top-[124px] transition-all duration-200 ease-out ${
        open
          ? "opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2"
      }`}
    >
      <div className="w-full bg-white shadow-xl border-t border-gray-200 max-h-[75vh] flex flex-col">
        {/* Embedded input — mobile only */}
        {showInput && (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50"
          >
            <IoSearchOutline className="text-gray-400 shrink-0" size={18} />
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search here....."
              className="flex-1 text-sm font-trebuchet text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
            />
            {localQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setLocalQuery("")}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Clear search"
              >
                <IoCloseOutline size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <IoCloseOutline size={20} />
            </button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4">
            {/* Loading skeleton - Show on initial load OR while fetching new keystrokes with no prior results */}
            {(isLoading || (isFetching && results.length === 0)) && hasQuery && (
              <div className="py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3 border-b border-gray-100 animate-pulse"
                  >
                    <div className="w-12 h-12 rounded-md bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 w-16 bg-gray-100 rounded" />
                      <div className="h-3 w-2/3 bg-gray-100 rounded" />
                    </div>
                    <div className="h-3 w-12 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Results - Show immediately without flickering if data exists */}
            {!isLoading && hasQuery && results.length > 0 && (
              <ul className="py-1">
                {results.map((product) => (
                  <SearchResultItem
                    key={product._id}
                    product={product}
                    query={activeQuery}
                    onClick={onClose}
                  />
                ))}
              </ul>
            )}

            {/* No results - Only show when fetching is completely done */}
            {!isFetching && !isLoading && hasQuery && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <IoSearchOutline className="w-8 h-8 text-gray-300" />
                <p className="text-[13px] text-gray-500">
                  No results found for &quot;
                  <span className="text-[#D4A843] font-semibold">
                    {activeQuery}
                  </span>
                  &quot;
                </p>
              </div>
            )}

            {/* Prompt state */}
            {!hasQuery && (
              <div className="flex flex-col items-center justify-center py-10 gap-1 text-center">
                <IoSearchOutline className="w-8 h-8 text-gray-300" />
                <p className="text-[12px] text-gray-500 font-medium">
                  Start typing to search
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Minimum 2 characters required
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer — View all results */}
        {hasQuery && results.length > 0 && (
          <button
            type="button"
            onClick={goToAllResults}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A1A1A] hover:bg-[#252525] text-white text-[13px] font-trebuchet font-semibold tracking-px transition-colors"
          >
            <IoSearchOutline size={15} />
            <span>
              View all results for &quot;{activeQuery}&quot;
            </span>
            <IoArrowForward size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

SearchOverlay.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  externalQuery: PropTypes.string,
  showInput: PropTypes.bool,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};