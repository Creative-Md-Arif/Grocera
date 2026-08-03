/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async"; // Existing package for SEO
import {
  useGetFilteredProductsQuery,
  useGetProductsQuery,
} from "@redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import {
  setCategories,
  setProducts,
  setChecked,
  setRadio,
} from "../redux/features/shop/shopSlice";
import {
  FaTimes,
  FaFilter,
  FaChevronRight,
  FaChevronLeft,
  FaUndoAlt,
  FaFolder,
  FaFolderOpen,
  FaRegSquare,
  FaRegCheckSquare,
  FaChevronDown,
  FaSortAmountDown,
  FaSlidersH,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Range } from "react-range";
import Product from "./Products/Product";
import Breadcrumb from "../components/breadcrumb/Breadcrumb";

// ─── Price Range Slider ─────────────────────────────────────────────────────
const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-figtree font-semibold text-gray-800 uppercase tracking-widest flex items-center gap-1">
          <FaSlidersH className="text-[#6E2594]" /> Price Range
        </h3>
        <span className="text-xs font-normal font-figtree text-[#6E2594] bg-[#6E2594]/10 px-2 py-0.5 rounded-md">
          {localValue[0].toLocaleString()}৳ - {localValue[1].toLocaleString()}৳
        </span>
      </div>
      <div className="px-1 py-2">
        <Range
          step={500}
          min={min}
          max={max}
          values={localValue}
          onChange={(vals) => setLocalValue(vals)}
          onFinalChange={(vals) => onChange(vals)}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="h-1.5 w-full bg-gray-200 rounded-full relative"
            >
              <div
                className="absolute h-full bg-[#6E2594] rounded-full"
                style={{
                  left: `${((localValue[0] - min) / (max - min)) * 100}%`,
                  width: `${((localValue[1] - localValue[0]) / (max - min)) * 100}%`,
                }}
              />
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="w-4 h-4 bg-white border-2 border-[#6E2594] rounded-full shadow-none focus:outline-none focus:ring-2 focus:ring-[#6E2594]/30 cursor-grab active:cursor-grabbing"
            />
          )}
        />
      </div>
    </div>
  );
};

// ─── Skeleton Loaders ───────────────────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="bg-white border border-gray-200 shadow-lg overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-100"></div>
    <div className="p-3 flex flex-col gap-2 border-t border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-5 bg-gray-200 rounded w-1/2 mt-auto"></div>
    </div>
  </div>
);

const FilterSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white p-5 border border-gray-200 shadow-lg space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-2 bg-gray-100 rounded-full mt-4"></div>
    </div>
    <div className="bg-white p-5 border border-gray-200 shadow-lg space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 bg-gray-100 rounded-md"></div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Pagination ─────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages = [1, 2, 3, 4, "...", totalPages];
    } else if (currentPage >= totalPages - 2) {
      pages = [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pages = [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#6E2594] hover:text-[#6E2594] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FaChevronLeft size={12} />
      </button>
      {getPages().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          aria-current={page === currentPage ? "page" : undefined}
          className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${page === currentPage ? "bg-[#6E2594] text-white" : page === "..." ? "text-gray-400 cursor-default bg-transparent" : "bg-white border border-gray-200 text-gray-700 hover:border-[#6E2594] hover:text-[#6E2594]"}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#6E2594] hover:text-[#6E2594] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );
};

// ─── Sort Function ──────────────────────────────────────────────────────────
const sortProducts = (products, sortType) => {
  const sorted = [...products];
  switch (sortType) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "bestselling":
      return sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    case "rating":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
  }
};

// ─── Helpers for Nested Tree Data ───────────────────────────────────────────

// 1. Format nested API data for react-checkbox-tree
const formatCategoriesToTree = (categories) => {
  if (!categories || categories.length === 0) return [];
  return categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
    children:
      cat.children && cat.children.length > 0
        ? formatCategoriesToTree(cat.children)
        : null,
  }));
};

// 2. Find Category Path recursively for Breadcrumbs
const findCategoryPath = (categories, targetId, currentPath = []) => {
  if (!categories || categories.length === 0) return null;

  for (const cat of categories) {
    const newPath = [
      ...currentPath,
      { label: cat.name, href: `/shop?category=${cat._id}`, id: cat._id },
    ];

    if (cat._id === targetId) {
      return newPath;
    }

    if (cat.children && cat.children.length > 0) {
      const foundPath = findCategoryPath(cat.children, targetId, newPath);
      if (foundPath) return foundPath;
    }
  }
  return null;
};

// ─── Extracted Sidebar Component to prevent re-renders ──────────────────────
const ShopSidebar = ({
  priceRange,
  setPriceRange,
  categories,
  checked,
  expanded,
  handleCheckChange,
  setExpanded,
  uniqueBrands,
  selectedBrand,
  handleBrandClick,
  handleResetFilters,
  treeData,
}) => (
  <div className="space-y-6">
    <div className="bg-white p-5 border border-gray-200 shadow-lg">
      <PriceRangeSlider
        min={0}
        max={100000}
        value={priceRange}
        onChange={setPriceRange}
      />
    </div>
    <div className="bg-white p-5 border border-gray-200 shadow-lg">
      <h3 className="text-[16px] font-semibold font-figtree mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-widest">
        <span className="w-1 h-4 bg-[#6E2594] rounded-full"></span> Categories
      </h3>
      <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {categories?.length > 0 ? (
          <div
            className="light-tree-wrapper text-[14px] font-normal [&_.rct-title]:text-slate-800 [&_.rct-title]:font-medium
       
        [&_.rct-node]:py-1 [&_.rct-text]:flex [&_.rct-text]:items-center [&_.rct-text]:gap-1"
            style={{ fontFamily: '"Figtree", sans-serif' }}
          >
            <CheckboxTree
              nodes={treeData}
              checked={checked}
              expanded={expanded}
              onCheck={handleCheckChange}
              onExpand={setExpanded}
              icons={{
                check: (
                  <FaRegCheckSquare className="text-[#6E2594] text-[15px] stroke-[0.5]" />
                ),
                uncheck: (
                  <FaRegSquare className="text-slate-400 text-[15px] stroke-[0.5]" />
                ),
                halfCheck: (
                  <FaRegCheckSquare className="text-[#6E2594] opacity-70 text-[15px]" />
                ),
                expandClose: (
                  <FaChevronRight className="text-slate-500 text-[10px] stroke-2" />
                ),
                expandOpen: (
                  <FaChevronDown className="text-[#6E2594] text-[10px] stroke-2" />
                ),
                parentClose: (
                  <FaFolder className="text-[#6E2594] text-[14px]" />
                ),
                parentOpen: (
                  <FaFolderOpen className="text-[#6E2594] text-[14px]" />
                ),
                leaf: (
                  <div className="w-2.5 h-1 bg-slate-300 rounded-[2px] ml-1 flex-shrink-0" />
                ),
              }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 bg-gray-100 animate-pulse rounded-md"
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>

    {uniqueBrands.length > 0 && (
      <div className="bg-white p-5 border border-gray-200 shadow-lg">
        <h3 className="text-[16px] font-semibold font-figtree mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-widest">
          <span className="w-1 h-4 bg-[#6E2594] rounded-full"></span> Brands
        </h3>
        <div className="flex flex-wrap gap-2">
          {uniqueBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => handleBrandClick(brand)}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-normal font-figtree text-gray-600 transition-all border ${
                selectedBrand === brand
                  ? "bg-[#6E2594] text-white border-[#6E2594]"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    )}

    <button
      onClick={handleResetFilters}
      className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-[#6E2594] transition-all flex items-center justify-center gap-2 text-sm"
    >
      <FaUndoAlt size={10} /> Reset All
    </button>
  </div>
);

// ─── Main Shop Component ────────────────────────────────────────────────────
const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const urlKeyword = queryParams.get("keyword");
  const categoryId = queryParams.get("category");

  const [sortBy, setSortBy] = useState(queryParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState([]);

  const dispatch = useDispatch();
  const { categories, products, checked, selectedBrand } = useSelector(
    (state) => state.shop,
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const hasCategoryFilter = checked.length > 0;

  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery(
      {
        keyword: urlKeyword || "",
        page: currentPage,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      },
      { skip: hasCategoryFilter },
    );

  const filteredProductsQuery = useGetFilteredProductsQuery(
    {
      checked,
      radio: priceRange,
      keyword: urlKeyword || "",
      page: currentPage,
      limit: 12,
    },
    { skip: !hasCategoryFilter },
  );

  const isLoading = hasCategoryFilter
    ? filteredProductsQuery.isLoading
    : isProductsLoading;

  const treeData = useMemo(
    () => formatCategoriesToTree(categories),
    [categories],
  );

  // Memoize category path for breadcrumbs
  const categoryPath = useMemo(() => {
    if (!categoryId || !categories || categories.length === 0) return [];
    return findCategoryPath(categories, categoryId) || [];
  }, [categories, categoryId]);

  useEffect(() => {
    if (urlKeyword) {
      dispatch(setChecked([]));
      dispatch(setRadio(""));
      setExpanded([]);
    }
  }, [urlKeyword, dispatch]);

  // Effects
  useEffect(() => {
    if (categoryId && categories?.length > 0) {
      if (!checked.includes(categoryId)) {
        dispatch(setChecked([categoryId]));
      }
      const ancestorIds = categoryPath.map((c) => c.id).slice(0, -1);
      setExpanded((prev) => [
        ...new Set([...prev, ...ancestorIds, categoryId]),
      ]);
    } else if (!categoryId && checked.length > 0) {
      dispatch(setChecked([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, categories, dispatch, categoryPath]);

  useEffect(() => {
    if (!categoriesQuery.isLoading && categoriesQuery.data)
      dispatch(setCategories(categoriesQuery.data));
  }, [categoriesQuery.isLoading, categoriesQuery.data, dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [urlKeyword, checked, selectedBrand, priceRange, sortBy]);

  // Product Filtering & Sorting Logic
  useEffect(() => {
    let finalProducts = [];

    // 1) Product filtering useEffect-এ
    if (hasCategoryFilter) {
      finalProducts = filteredProductsQuery.data?.products || [];
    } else {
      finalProducts = productsData?.products || [];
    }

    if (finalProducts.length > 0 && selectedBrand) {
      finalProducts = finalProducts.filter((p) => p.brand === selectedBrand);
    }

    dispatch(setProducts(sortProducts(finalProducts, sortBy)));
  }, [
    hasCategoryFilter,
    filteredProductsQuery.data,
    productsData,
    dispatch,
    priceRange,
    sortBy,
    selectedBrand,
  ]);

  // Handlers
  const scrollToTop = useCallback(
    () => window.scrollTo({ top: 0, behavior: "smooth" }),
    [],
  );

  const handleBrandClick = useCallback(
    (brand) => {
      dispatch(setRadio(selectedBrand === brand ? "" : brand));
      setCurrentPage(1);
      scrollToTop();
    },
    [dispatch, selectedBrand, scrollToTop],
  );

  const handleCheckChange = useCallback(
    (newChecked) => {
      dispatch(setChecked(newChecked));
      setCurrentPage(1);
      scrollToTop();

      if (newChecked.length > 0) {
        navigate(`/shop?category=${newChecked[0]}`, {
          replace: true,
        });
      } else {
        navigate("/shop", { replace: true });
      }
    },
    [dispatch, navigate, scrollToTop],
  );

  const handleResetFilters = useCallback(() => {
    setPriceRange([0, 100000]);
    setSortBy("newest");
    setCurrentPage(1);
    dispatch(setChecked([]));
    dispatch(setRadio(""));
    setExpanded([]);
    navigate("/shop");
    scrollToTop();
  }, [dispatch, navigate, scrollToTop]);

  const totalPages = hasCategoryFilter
    ? filteredProductsQuery.data?.pages || 1
    : productsData?.pages || 1;
  const paginatedProducts = products;

  const uniqueBrands = useMemo(() => {
    const baseDataForBrands = hasCategoryFilter
      ? filteredProductsQuery.data?.products || []
      : productsData?.products || [];
    return [...new Set(baseDataForBrands.map((p) => p.brand).filter(Boolean))];
  }, [hasCategoryFilter, filteredProductsQuery.data, productsData]);

  return (
    <div className="min-h-screen bg-white pb-20 font-figtree">
      {/* ── SEO Optimization using Helmet ── */}
      <Helmet>
        <title>
          {urlKeyword
            ? `Search: ${urlKeyword} | Grocera`
            : "Shop All Products | Grocera"}
        </title>
        <meta
          name="description"
          content="Shop premium quality products at Grocera. Filter by category, price, and brand to find exactly what you need. Fast delivery and secure payment."
        />
      </Helmet>

      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          ...categoryPath.map((cat, index) => ({
            label: cat.label,
            href: index === categoryPath.length - 1 ? undefined : cat.href,
          })),
          ...(urlKeyword && !categoryId
            ? [{ label: `Search: "${urlKeyword}"` }]
            : []),
        ]}
      />

      <div className="max-w-screen-2xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-[280px] sticky top-24 self-start">
          {categoriesQuery.isLoading || isLoading ? (
            <FilterSkeleton />
          ) : (
            <ShopSidebar
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              categories={categories}
              checked={checked}
              expanded={expanded}
              handleCheckChange={handleCheckChange}
              setExpanded={setExpanded}
              uniqueBrands={uniqueBrands}
              selectedBrand={selectedBrand}
              handleBrandClick={handleBrandClick}
              handleResetFilters={handleResetFilters}
              treeData={treeData}
            />
          )}
        </aside>

        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-[1000] lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween" }}
                className="absolute right-0 top-0 h-full w-[300px] bg-white p-6 shadow-lg overflow-y-auto border-l border-gray-200"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[16px] font-semibold font-figtree tracking-widest text-gray-800">
                    Filters
                  </h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close filters"
                    className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                <ShopSidebar
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  categories={categories}
                  checked={checked}
                  expanded={expanded}
                  handleCheckChange={handleCheckChange}
                  setExpanded={setExpanded}
                  uniqueBrands={uniqueBrands}
                  selectedBrand={selectedBrand}
                  handleBrandClick={handleBrandClick}
                  handleResetFilters={handleResetFilters}
                  treeData={treeData}
                />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full">
          {urlKeyword && !categoryId && (
            <div className="mb-6 text-center">
              <p className="text-gray-600 font-figtree text-sm">
                Found{" "}
                <span className="font-bold text-[#6E2594]">
                  {products?.length || 0}
                </span>{" "}
                results for
                <span className="font-bold text-gray-900">
                  {" "}
                  &ldquo;{urlKeyword}&rdquo;
                </span>
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3 border border-gray-200 shadow-lg">
            <p className="text-gray-800 text-[16px] font-figtree font-semibold px-2">
              {isLoading ? "..." : products?.length || 0} Products
            </p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <label htmlFor="sort-by" className="sr-only">
                  Sort products
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-sm font-normal font-figtree focus:outline-none focus:ring-2 focus:ring-[#6E2594]/20 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low</option>
                  <option value="price-high">Price: High</option>
                  <option value="bestselling">Best Selling</option>
                  <option value="rating">Top Rated</option>
                </select>
                <FaSortAmountDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-[#6E2594]  rounded-lg text-[16px] font-semibold font-figtree text-white"
                aria-label="Open filters"
              >
                <FaFilter size={10} /> Filters
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-gray-200 shadow-lg">
              <h3 className="text-lg font-figtree font-bold text-gray-800 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 text-sm font-figtree mb-6">
                Try adjusting your filters
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-[#6E2594] text-white rounded-lg font-bold text-sm font-figtree hover:bg-[#5a1d78] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts?.map((p) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Product product={p} />
                  </motion.div>
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  scrollToTop();
                }}
              />
            </>
          )}
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6E2594; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .light-tree-wrapper .react-checkbox-tree { font-family: inherit; font-size: 13px; }
        .light-tree-wrapper .rct-text { padding: 3px 0; transition: all 0.2s; border-radius: 6px; }
        .light-tree-wrapper .rct-text:hover { background: rgba(184, 142, 47, 0.05); }
        .light-tree-wrapper .rct-title { padding-left: 6px; color: #4b5563; font-weight: 500; }
        .light-tree-wrapper .rct-node-clickable:hover .rct-title { color: #000; }
        .light-tree-wrapper label { margin-bottom: 0; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default Shop;
