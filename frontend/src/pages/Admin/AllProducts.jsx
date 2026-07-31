/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import {
  useAllProductsQuery,
  useUpdateProductFieldsMutation,
} from "@redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountDown,
  FaBox,
  FaExternalLinkAlt,
  FaHome,
  FaTimes,
  FaSortNumericDown,
  FaPencilAlt,
} from "react-icons/fa";

// --- Skeleton Components ---
const TableSkeleton = () => (
  <div className="hidden md:block border border-gray-200 rounded-sm">
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="flex gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
        ))}
      </div>
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100 flex gap-4 items-center">
        <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="md:hidden space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="border border-gray-200 p-4 rounded-sm bg-white">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- Stock status helper ---
const getStockInfo = (product) => {
  const stock = product.countInStock;
  if (stock <= 0) return { label: "Depleted", color: "red", dot: "bg-red-600" };
  if (stock < 10) return { label: "Low Stock", color: "orange", dot: "bg-orange-500" };
  return { label: "In Stock", color: "green", dot: "bg-green-500" };
};

// --- Memoized Sub-Components ---
const ProductRow = memo(function ProductRow({
  product,
  onOpenPopup,
  onUnlist,
  processingId,
}) {
  const stockInfo = getStockInfo(product);

  return (
    <tr className="group hover:bg-gray-50 transition-colors align-top">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-black group-hover:text-red-600 transition-colors uppercase tracking-tight max-w-[200px] truncate font-['Playfair_Display']">
            {product.name}
          </span>
          <span className="text-sm text-gray-500 font-bold tracking-widest mt-1">
            {product.brand || "GENERIC"}
          </span>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="w-14 h-14 border border-gray-200 p-0.5 group-hover:border-black transition-all overflow-hidden bg-white">
          <img
            src={Array.isArray(product.images) ? product.images[0] : product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="px-3 py-1 bg-gray-100 text-sm font-bold uppercase text-gray-600 border border-gray-200 rounded-sm tracking-tighter">
          {product.category?.name || "N/A"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FaBox size={12} className="text-gray-400" />
            <span className={`text-sm font-bold ${stockInfo.color === "red" ? "text-red-600" : stockInfo.color === "orange" ? "text-orange-600" : "text-black"}`}>
              {product.countInStock} <span className="text-sm text-gray-400 font-normal">Units</span>
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-base font-black text-black font-['Playfair_Display']">
            <span className="text-red-600 text-sm mr-0.5 font-normal">৳</span>
            {product.price.toLocaleString()}
          </span>
        </div>
      </td>
      
      {/* ===== Homepage Status UI (Badge + Change Order Button) ===== */}
      <td className="px-4 py-3">
        {product.showOnHomepage ? (
          <div className="flex flex-col gap-2">
            <span className="bg-blue-50 border border-blue-500 text-blue-600 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-flex items-center gap-1 w-fit">
              <FaHome size={10} /> Active
            </span>
            <button 
              onClick={() => onOpenPopup(product)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black font-bold transition-colors"
            >
              <FaSortNumericDown size={10} /> Order: {product.homepageOrder || 0}
              <FaPencilAlt size={8} className="ml-1" />
            </button>
          </div>
        ) : (
          <span className="bg-white border border-gray-300 text-gray-500 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-flex items-center gap-1 w-fit">
            <FaHome size={10} /> Hidden
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stockInfo.dot}`}></div>
          <span className={`text-sm font-bold uppercase tracking-widest ${stockInfo.color === "red" ? "text-red-600" : stockInfo.color === "orange" ? "text-orange-600" : "text-green-600"}`}>
            {stockInfo.label}
          </span>
        </div>
      </td>

      <td className="px-4 py-3 text-right">
        <div className="inline-flex gap-2 flex-wrap justify-end">
          {product.showOnHomepage ? (
            <button
              onClick={() => onUnlist(product._id)}
              disabled={processingId === product._id}
              className="py-2 px-3 border border-gray-200 text-gray-600 hover:bg-gray-600 hover:text-white hover:border-gray-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1 disabled:opacity-50"
            >
              {processingId === product._id ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Unlist</>
              )}
            </button>
          ) : (
            <button
              onClick={() => onOpenPopup(product)}
              disabled={processingId === product._id}
              className="py-2 px-3 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1 disabled:opacity-50"
            >
              {processingId === product._id ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaHome size={12} /> List
                </>
              )}
            </button>
          )}

          <Link
            to={`/admin/product/update/${product._id}`}
            className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1"
          >
            Edit <FaExternalLinkAlt size={10} />
          </Link>
        </div>
      </td>
    </tr>
  );
});

const ProductCard = memo(function ProductCard({
  product,
  onOpenPopup,
  onUnlist,
  processingId,
}) {
  const stockInfo = getStockInfo(product);

  return (
    <div className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
      <div className="flex gap-4">
        <div className="relative w-16 h-16 border border-gray-200 p-1 flex-shrink-0 bg-white">
          <img
            src={Array.isArray(product.images) ? product.images[0] : product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-black uppercase tracking-tight truncate font-['Playfair_Display']">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 font-bold tracking-widest mt-1">
            {product.brand || "GENERIC"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Price</span>
          <span className="text-base font-black text-black">৳ {product.price.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Stock</span>
          <span className={`text-sm font-bold ${stockInfo.color === "red" ? "text-red-600" : "text-black"}`}>
            {product.countInStock} Units
          </span>
        </div>
        
        <div className="flex items-center justify-between col-span-2 mt-2">
          {product.showOnHomepage ? (
            <>
              <span className="bg-blue-50 border border-blue-500 text-blue-600 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-flex items-center gap-1">
                <FaHome size={8} /> Active
              </span>
              <button 
                onClick={() => onOpenPopup(product)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-black font-bold transition-colors"
              >
                Order: {product.homepageOrder || 0} <FaPencilAlt size={8} className="ml-1" />
              </button>
            </>
          ) : (
            <span className="bg-white border border-gray-300 text-gray-500 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-flex items-center gap-1">
              <FaHome size={8} /> Hidden
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 col-span-2 mt-2">
          {product.showOnHomepage ? (
            <button
              onClick={() => onUnlist(product._id)}
              disabled={processingId === product._id}
              className="flex-1 py-2 px-3 border border-gray-200 text-gray-600 hover:bg-gray-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {processingId === product._id ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Unlist</>
              )}
            </button>
          ) : (
            <button
              onClick={() => onOpenPopup(product)}
              disabled={processingId === product._id}
              className="flex-1 py-2 px-3 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {processingId === product._id ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><FaHome size={10} /> List Home</>
              )}
            </button>
          )}
          
          <Link
            to={`/admin/product/update/${product._id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all rounded-sm"
          >
            Edit <FaExternalLinkAlt size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
});

const AllProducts = () => {
  const { data: products, isLoading, isError } = useAllProductsQuery();
  const [updateProductFields] = useUpdateProductFieldsMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processingId, setProcessingId] = useState(null);
  
  // পপ-আপ স্টেট ম্যানেজমেন্ট
  const [popupData, setPopupData] = useState(null); // { product: {}, order: 0 }
  const [popupError, setPopupError] = useState(""); // ডুপ্লিকেট এরর মেসেজের জন্য

  // পপ-আপ ওপেন হ্যান্ডলার
  const handleOpenPopup = (product) => {
    setPopupData({ product, order: product.homepageOrder || 0 });
    setPopupError(""); // পপ-আপ খোলার সময় এরর ক্লিয়ার থাকবে
  };

  // পপ-আপ ক্লোজ হ্যান্ডলার
  const handleClosePopup = () => {
    setPopupData(null);
    setPopupError("");
  };

  // পপ-আপ থেকে সেভ করার হ্যান্ডলার (List বা Update Order দুটোর জন্যই কাজ করবে)
  const handleSaveOrder = async () => {
    if (!popupData) return;
    const { product, order } = popupData;
    const orderNum = Number(order) || 0;

    // ===== ডুপ্লিকেট চেক লজিক =====
    // বর্তমান প্রোডাক্ট ছাড়া বাকি যেসব প্রোডাক্ট হোমপেজে লিস্টেড আছে তাদের অর্ডার নাম্বার বের করা
    const existingOrders = products
      ?.filter((p) => p.showOnHomepage && p._id !== product._id)
      .map((p) => p.homepageOrder || 0) || [];

    // যদি ইনপুট দেওয়া নাম্বারটি আগে থেকেই লিস্টে থাকে
    if (existingOrders.includes(orderNum)) {
      setPopupError(`Order ${orderNum} is already taken. Please choose a different number.`);
      toast.error(`Order ${orderNum} is already in use.`);
      return; // সেভ হবে না
    }
    // =============================

    setPopupError("");
    setProcessingId(product._id);
    try {
      await updateProductFields({
        productId: product._id,
        fields: {
          showOnHomepage: true,
          homepageOrder: orderNum,
        },
      }).unwrap();
      toast.success(`Product listed with order ${orderNum}`);
      handleClosePopup();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  // আনলিস্ট করার হ্যান্ডলার
  const handleUnlist = async (productId) => {
    setProcessingId(productId);
    try {
      await updateProductFields({
        productId,
        fields: { showOnHomepage: false },
      }).unwrap();
      toast.success("Removed from homepage");
    } catch (err) {
      toast.error("Failed to unlist product");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtering and sorting
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortConfig.key) {
        const valA = sortConfig.key === "category" ? a.category?.name : a[sortConfig.key];
        const valB = sortConfig.key === "category" ? b.category?.name : b[sortConfig.key];

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [products, searchTerm, sortConfig]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-['Trebuchet_MS'] font-bold italic text-lg">
        ERROR: FAILED_TO_LOAD_DATABASE
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      {/* ===== Mini Popup Modal ===== */}
      {popupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-sm shadow-xl w-full max-w-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-black uppercase tracking-widest text-sm">
                {popupData.product.showOnHomepage ? "Change Order" : "Set Display Order"}
              </h3>
              <button onClick={handleClosePopup} className="text-gray-400 hover:text-black transition-colors">
                <FaTimes size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3 italic">
              Enter a number for display priority. (e.g., 0 shows first on homepage)
            </p>
            <div className={`flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded-sm mb-2 ${popupError ? 'border-red-500' : 'border-gray-200'}`}>
              <FaSortNumericDown size={14} className="text-gray-400" />
              <input
                type="number"
                min="0"
                value={popupData.order}
                onChange={(e) => {
                  setPopupData({ ...popupData, order: e.target.value });
                  setPopupError(""); // টাইপ করলে এরর মুছে যাবে
                }}
                className="w-full bg-transparent text-base font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black rounded-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                autoFocus
              />
            </div>
            {/* ডুপ্লিকেট এরর মেসেজ দেখানোর জন্য */}
            {popupError && (
              <p className="text-xs text-red-600 font-bold mb-3 flex items-center gap-1">
                <FaTimes size={10} /> {popupError}
              </p>
            )}
            
            <div className={`flex gap-2 ${popupError ? 'mt-4' : 'mt-6'}`}>
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-bold uppercase tracking-widest transition-all rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={processingId === popupData.product._id}
                className="flex-1 py-2.5 bg-black text-white hover:bg-red-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center disabled:opacity-50"
              >
                {processingId === popupData.product._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                Total Managed Items: {sortedProducts.length}
              </p>
            </div>

            <div className="relative group w-full md:w-96">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors text-sm" />
              <input
                type="text"
                placeholder="SEARCH BY NAME..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-gray-200 rounded-sm py-3 pl-10 pr-4 text-sm font-bold text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </header>

          <section className="bg-black text-white p-4 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-gray-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Page Size:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent border border-gray-700 text-sm font-bold px-3 py-1.5 focus:outline-none focus:border-red-600 cursor-pointer rounded-sm"
                >
                  {[5, 10, 20, 50].map((val) => (
                    <option key={val} value={val} className="text-black">{val}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="hidden md:block text-sm font-bold tracking-widest text-gray-500 italic">
              STATUS: SECURE_ACCESS
            </div>
          </section>

          {isLoading ? (
            <>
              <CardSkeleton />
              <TableSkeleton />
            </>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden space-y-4">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onOpenPopup={handleOpenPopup}
                      onUnlist={handleUnlist}
                      processingId={processingId}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-sm">
                    No Products Found
                  </div>
                )}
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {[
                        { label: "Product", key: "name" },
                        { label: "Image", key: null },
                        { label: "Category", key: "category" },
                        { label: "Stock", key: "countInStock" },
                        { label: "Price", key: "price" },
                        { label: "Homepage", key: "showOnHomepage" },
                        { label: "Status", key: null },
                        { label: "Action", key: null },
                      ].map((col, i) => (
                        <th
                          key={i}
                          onClick={() => col.key && handleSort(col.key)}
                          className={`px-4 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 ${col.key ? "cursor-pointer hover:text-black" : ""} transition-colors`}
                        >
                          <div className="flex items-center gap-1.5">
                            {col.label}
                            {col.key && (
                              <FaSortAmountDown
                                size={12}
                                className={sortConfig.key === col.key ? "text-black" : "text-gray-300"}
                              />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product) => (
                        <ProductRow
                          key={product._id}
                          product={product}
                          onOpenPopup={handleOpenPopup}
                          onUnlist={handleUnlist}
                          processingId={processingId}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-sm">
                          No Products Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Navigation */}
              {currentProducts.length > 0 && (
                <nav className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Showing{" "}
                    <span className="text-black font-black">
                      {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedProducts.length)}
                    </span>{" "}
                    of <span className="text-red-600 font-black">{sortedProducts.length}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-3 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:cursor-not-allowed transition-all rounded-sm"
                      aria-label="Previous Page"
                    >
                      <FaChevronLeft size={14} />
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 text-sm font-bold transition-all rounded-sm ${currentPage === i + 1 ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-3 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:cursor-not-allowed transition-all rounded-sm"
                      aria-label="Next Page"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllProducts;