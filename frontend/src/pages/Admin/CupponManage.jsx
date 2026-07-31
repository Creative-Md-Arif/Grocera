/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaChartBar, FaTimes, FaSearch, FaTag,
} from "react-icons/fa";
import {
  useGetCupponsQuery, useCreateCupponMutation, useUpdateCupponMutation,
  useDeleteCupponMutation, useToggleCupponStatusMutation, useLazyGetCupponStatsQuery,
} from "@redux/api/cupponApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useGetProductsQuery } from "@redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";

const initialFormState = {
  code: "", description: "", discountType: "percentage", discountValue: 0,
  minimumOrderAmount: 0, maximumDiscountAmount: "", usageLimit: "", perUserLimit: 1,
  isFirstTimeOnly: false, startDate: new Date().toISOString().split("T")[0], endDate: "",
  isActive: true, applicableCategories: [], applicableProducts: [], excludedCategories: [], excludedProducts: [],
};

// --- Skeleton Loaders ---
const TableSkeleton = () => (
  <div className="hidden md:block border border-gray-200 rounded-sm bg-white">
    <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>)}
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100 flex gap-4 items-center">
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="md:hidden space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="border border-gray-200 p-4 rounded-sm bg-white">
        <div className="flex justify-between mb-3">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3">
          <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- Memoized Components ---
const CouponCard = memo(function CouponCard({ cuppon, handleToggle, handleEdit, handleViewStats, handleDelete, formatDate, togglingId, deletingId }) {
  const isExpired = new Date() > new Date(cuppon.endDate);
  return (
    <article className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-['Playfair_Display'] font-bold text-black uppercase tracking-wider text-base">{cuppon.code}</h3>
          {cuppon.description && <p className="text-sm text-gray-500 mt-1 truncate max-w-[200px]">{cuppon.description}</p>}
        </div>
        <button onClick={() => handleToggle(cuppon._id)} disabled={togglingId === cuppon._id || deletingId === cuppon._id} className={`text-2xl ${cuppon.isActive ? "text-black" : "text-gray-300"} disabled:opacity-50`}>
          {togglingId === cuppon._id ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : cuppon.isActive ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 border-t border-b border-gray-100 py-3">
        <div>
          <span className="text-sm font-bold text-gray-500 uppercase block">Discount</span>
          <span className="font-bold text-red-600 text-base">{cuppon.discountType === "percentage" ? `${cuppon.discountValue}%` : `৳${cuppon.discountValue}`}</span>
        </div>
        <div>
          <span className="text-sm font-bold text-gray-500 uppercase block">Min Order</span>
          <span className="font-bold text-black text-base">৳{cuppon.minimumOrderAmount || 0}</span>
        </div>
        <div>
          <span className="text-sm font-bold text-gray-500 uppercase block">Validity</span>
          <span className="font-medium text-gray-700 text-sm">{formatDate(cuppon.startDate)} - {formatDate(cuppon.endDate)}</span>
        </div>
        <div>
          <span className="text-sm font-bold text-gray-500 uppercase block">Status</span>
          <span className={`text-sm px-2 py-1 rounded-sm font-bold uppercase ${isExpired ? "bg-red-100 text-red-700" : cuppon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {isExpired ? "Expired" : cuppon.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">Used: <span className="font-bold text-black">{cuppon.usageCount}/{cuppon.usageLimit || "∞"}</span></div>
        <div className="flex gap-3 items-center">
          <button onClick={() => handleEdit(cuppon)} className="text-gray-500 hover:text-black transition-colors" aria-label="Edit"><FaEdit size={16} /></button>
          <button onClick={() => handleViewStats(cuppon._id)} className="text-gray-500 hover:text-black transition-colors" aria-label="Stats"><FaChartBar size={16} /></button>
          <button onClick={() => handleDelete(cuppon._id)} disabled={deletingId === cuppon._id} className="text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50" aria-label="Delete">
            {deletingId === cuppon._id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <FaTrash size={14} />}
          </button>
        </div>
      </div>
    </article>
  );
});

const CouponRow = memo(function CouponRow({ cuppon, handleToggle, handleEdit, handleViewStats, handleDelete, formatDate, togglingId, deletingId }) {
  const isExpired = new Date() > new Date(cuppon.endDate);
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="p-4">
        <div className="font-['Trebuchet_MS'] font-bold text-black uppercase tracking-wider bg-gray-100 px-3 py-1.5 inline-block text-sm border border-gray-200 rounded-sm">
          {cuppon.code}
        </div>
        {cuppon.description && <p className="text-sm text-gray-500 mt-1 w-40 truncate">{cuppon.description}</p>}
      </td>
      <td className="p-4">
        <span className="font-bold text-red-600 text-base">{cuppon.discountType === "percentage" ? `${cuppon.discountValue}%` : `৳${cuppon.discountValue}`}</span>
        {cuppon.maximumDiscountAmount && cuppon.discountType === "percentage" && <span className="text-sm text-gray-500 block">(Max: ৳{cuppon.maximumDiscountAmount})</span>}
        <span className="text-sm text-gray-500 block">Min: ৳{cuppon.minimumOrderAmount || 0}</span>
      </td>
      <td className="p-4 text-sm text-gray-700">
        <p>Total: <span className="font-bold text-black">{cuppon.usageCount}/{cuppon.usageLimit || "∞"}</span></p>
        <p>User: <span className="font-bold text-black">{cuppon.perUserLimit}</span></p>
        {cuppon.isFirstTimeOnly && <span className="text-sm bg-black text-white px-2 py-0.5 rounded-sm">New Users</span>}
      </td>
      <td className="p-4 text-sm text-gray-600">
        <p>{formatDate(cuppon.startDate)}</p>
        <p className="font-bold text-black">to {formatDate(cuppon.endDate)}</p>
      </td>
      <td className="p-4">
        <div className="flex flex-col items-start gap-2">
          <button onClick={() => handleToggle(cuppon._id)} disabled={togglingId === cuppon._id || deletingId === cuppon._id} className={`text-xl ${cuppon.isActive ? "text-black" : "text-gray-300"} disabled:opacity-50`}>
            {togglingId === cuppon._id ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : cuppon.isActive ? <FaToggleOn /> : <FaToggleOff />}
          </button>
          <span className={`text-sm px-2 py-1 rounded-sm font-bold uppercase ${isExpired ? "bg-red-100 text-red-700" : cuppon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {isExpired ? "Expired" : cuppon.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-3 justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleEdit(cuppon)} className="text-gray-500 hover:text-black transition-colors" title="Edit"><FaEdit size={16} /></button>
          <button onClick={() => handleViewStats(cuppon._id)} className="text-gray-500 hover:text-black transition-colors" title="Stats"><FaChartBar size={16} /></button>
          <button onClick={() => handleDelete(cuppon._id)} disabled={deletingId === cuppon._id} className="text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
            {deletingId === cuppon._id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <FaTrash size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
});

const CupponManage = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingCupponId, setEditingCupponId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [productSearch, setProductSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ Bug Fix: isActiveFilter empty হলে undefined পাঠানো হচ্ছে
  const { data, isLoading, refetch } = useGetCupponsQuery({
    pageNumber: page,
    keyword,
    isActive: isActiveFilter || undefined,
  });

  const [createCuppon, { isLoading: isCreating }] = useCreateCupponMutation();
  const [updateCuppon, { isLoading: isUpdating }] = useUpdateCupponMutation();
  const [deleteCuppon] = useDeleteCupponMutation();
  const [toggleCupponStatus] = useToggleCupponStatusMutation();
  const [fetchStats, { data: statsData, isLoading: isStatsLoading }] = useLazyGetCupponStatsQuery();

  const { data: categoriesData } = useFetchCategoriesQuery();
  const { data: productsData } = useGetProductsQuery({ pageNumber: 1, keyword: productSearch });

  const categories = categoriesData?.categories || categoriesData || [];
  const products = productsData?.products || productsData || [];

  useEffect(() => { refetch(); }, [page, keyword, isActiveFilter, refetch]);

  const openAddModal = useCallback(() => {
    setFormData(initialFormState);
    setEditingCupponId(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((cuppon) => {
    setEditingCupponId(cuppon._id);
    setFormData({
      code: cuppon.code,
      description: cuppon.description || "",
      discountType: cuppon.discountType,
      discountValue: cuppon.discountValue,
      minimumOrderAmount: cuppon.minimumOrderAmount || 0,
      maximumDiscountAmount: cuppon.maximumDiscountAmount || "",
      usageLimit: cuppon.usageLimit || "",
      perUserLimit: cuppon.perUserLimit || 1,
      isFirstTimeOnly: cuppon.isFirstTimeOnly,
      startDate: cuppon.startDate ? new Date(cuppon.startDate).toISOString().split("T")[0] : "",
      endDate: cuppon.endDate ? new Date(cuppon.endDate).toISOString().split("T")[0] : "",
      isActive: cuppon.isActive,
      applicableCategories: cuppon.applicableCategories?.map(String) || [],
      applicableProducts: cuppon.applicableProducts?.map(String) || [],
      excludedCategories: cuppon.excludedCategories?.map(String) || [],
      excludedProducts: cuppon.excludedProducts?.map(String) || [],
    });
    setIsFormModalOpen(true);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handleArrayChange = useCallback((name, value) => {
    setFormData((prev) => {
      const arr = prev[name];
      if (arr.includes(value)) {
        return { ...prev, [name]: arr.filter((id) => id !== value) };
      } else {
        return { ...prev, [name]: [...arr, value] };
      }
    });
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      setDeletingId(id);
      try {
        await deleteCuppon(id).unwrap();
        toast.success("Coupon deleted successfully");
        refetch();
      } catch (err) {
        toast.error(err?.data?.error || "Failed to delete coupon");
      } finally {
        setDeletingId(null);
      }
    }
  }, [deleteCuppon, refetch]);

  const handleToggle = useCallback(async (id) => {
    setTogglingId(id);
    try {
      await toggleCupponStatus(id).unwrap();
      toast.success("Coupon status updated");
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Failed to toggle status");
    } finally {
      setTogglingId(null);
    }
  }, [toggleCupponStatus, refetch]);

  const handleViewStats = useCallback(async (id) => {
    setIsStatsModalOpen(true);
    try {
      await fetchStats(id).unwrap();
    } catch (err) {
      toast.error("Failed to load stats");
    }
  }, [fetchStats]);

  const submitHandler = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.endDate) {
      return toast.error("Please fill in all required fields (Code, Value, End Date)");
    }
    const payload = {
      ...formData,
      minimumOrderAmount: Number(formData.minimumOrderAmount) || 0,
      maximumDiscountAmount: formData.maximumDiscountAmount ? Number(formData.maximumDiscountAmount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      perUserLimit: Number(formData.perUserLimit) || 1,
      discountValue: Number(formData.discountValue),
    };
    try {
      if (editingCupponId) {
        await updateCuppon({ cupponId: editingCupponId, updatedCuppon: payload }).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await createCuppon(payload).unwrap();
        toast.success("Coupon created successfully");
      }
      setIsFormModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Something went wrong");
    }
  }, [formData, editingCupponId, updateCuppon, createCuppon, refetch]);

  const submitBtnLoading = isCreating || isUpdating;
  const formatDate = (dateStr) => !dateStr ? "N/A" : new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  // ✅ Bug Fix: Empty State Check
  const showEmptyState = !isLoading && (!data?.cuppons || data.cuppons.length === 0);

  // Reusable Styles
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass = "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          
          {/* Header Section */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-6 py-2 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
                Coupon <span className="text-red-600">/ Management</span>
              </h1>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                Create, edit, and track discount coupons
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm w-full md:w-auto justify-center"
            >
              <FaPlus size={14} /> Create Coupon
            </button>
          </header>

          {/* Filters Section */}
          <section className="bg-white p-4 mb-6 flex flex-col md:flex-row gap-3 items-center border border-gray-200 rounded-sm">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="SEARCH BY CODE..."
                className={`${inputClass} pl-10 uppercase`}
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className={`${inputClass} md:w-1/4 cursor-pointer uppercase`}
              value={isActiveFilter}
              onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </section>

          {isLoading ? (
            <>
              <CardSkeleton />
              <TableSkeleton />
            </>
          ) : showEmptyState ? (
            <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm border border-dashed border-gray-200 rounded-sm bg-white">
              No coupons found. Create one!
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Card Layout */}
              <div className="md:hidden space-y-4">
                {data?.cuppons?.map((cuppon) => (
                  <CouponCard 
                    key={cuppon._id} 
                    cuppon={cuppon} 
                    handleToggle={handleToggle}
                    handleEdit={handleEdit}
                    handleViewStats={handleViewStats}
                    handleDelete={handleDelete}
                    formatDate={formatDate}
                    togglingId={togglingId}
                    deletingId={deletingId}
                  />
                ))}
              </div>

              {/* DESKTOP VIEW: Table Layout */}
              <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Code</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Discount</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Limits</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Validity</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Status</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data?.cuppons?.map((cuppon) => (
                      <CouponRow 
                        key={cuppon._id} 
                        cuppon={cuppon} 
                        handleToggle={handleToggle}
                        handleEdit={handleEdit}
                        handleViewStats={handleViewStats}
                        handleDelete={handleDelete}
                        formatDate={formatDate}
                        togglingId={togglingId}
                        deletingId={deletingId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <nav className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2">
              {[...Array(data.totalPages).keys()].map((x) => (
                <button
                  key={x + 1}
                  onClick={() => setPage(x + 1)}
                  className={`w-10 h-10 text-sm font-bold transition-all rounded-sm ${page === x + 1 ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"}`}
                >
                  {x + 1}
                </button>
              ))}
            </nav>
          )}
        </div>
      </main>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-24 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-3xl mb-10">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-base font-bold text-black uppercase tracking-wider font-['Playfair_Display']">{editingCupponId ? "Update Coupon" : "Create New Coupon"}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><FaTimes size={18} /></button>
            </div>

            <form onSubmit={submitHandler} className="p-5 space-y-6">
              {/* Section 1: Basic Info */}
              <section className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 flex items-center gap-2"><FaTag size={12} /> Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Coupon Code *</label>
                    <input type="text" name="code" value={formData.code} onChange={handleInputChange} className={`${inputClass} uppercase`} required />
                  </div>
                  <div>
                    <label className={labelClass}>Discount Type *</label>
                    <select name="discountType" value={formData.discountType} onChange={handleInputChange} className={`${inputClass} cursor-pointer`}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Discount Value *</label>
                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} className={inputClass} min="0" required />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${inputClass} resize-none`} rows="2"></textarea>
                  </div>
                </div>
              </section>

              {/* Section 2: Limits & Conditions */}
              <section className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Limits & Conditions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Min Order Amount (৳)</label>
                    <input type="number" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleInputChange} className={inputClass} min="0" />
                  </div>
                  {formData.discountType === "percentage" && (
                    <div>
                      <label className={labelClass}>Max Discount Cap (৳)</label>
                      <input type="number" name="maximumDiscountAmount" value={formData.maximumDiscountAmount} onChange={handleInputChange} className={inputClass} min="0" placeholder="No limit" />
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Total Usage Limit</label>
                    <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} className={inputClass} min="1" placeholder="Unlimited" />
                  </div>
                  <div>
                    <label className={labelClass}>Per User Limit</label>
                    <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleInputChange} className={inputClass} min="1" />
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date *</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className={inputClass} required />
                  </div>
                </div>
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="accent-black w-5 h-5" />
                    <span className="text-sm font-bold text-gray-700 uppercase">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isFirstTimeOnly" checked={formData.isFirstTimeOnly} onChange={handleInputChange} className="accent-black w-5 h-5" />
                    <span className="text-sm font-bold text-gray-700 uppercase">First Time Buyers Only</span>
                  </label>
                </div>
              </section>

              {/* Section 3: Restrictions */}
              <section className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Restrictions (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Applicable Categories</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {categories.length === 0 ? <p className="text-sm text-gray-400 p-1">No categories</p> :
                        categories.map((cat) => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-sm">
                            <input type="checkbox" checked={formData.applicableCategories.includes(cat._id)} onChange={() => handleArrayChange("applicableCategories", cat._id)} className="accent-black w-4 h-4" />
                            <span className="text-gray-700">{cat.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Excluded Categories</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {categories.length === 0 ? <p className="text-sm text-gray-400 p-1">No categories</p> :
                        categories.map((cat) => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-sm">
                            <input type="checkbox" checked={formData.excludedCategories.includes(cat._id)} onChange={() => handleArrayChange("excludedCategories", cat._id)} className="accent-red-600 w-4 h-4" />
                            <span className="text-gray-700">{cat.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Applicable Products</label>
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={`${inputClass} mb-2`} />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {products.length === 0 ? <p className="text-sm text-gray-400 p-1">No products</p> :
                        products.map((prod) => (
                          <label key={prod._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-sm">
                            <input type="checkbox" checked={formData.applicableProducts.includes(prod._id)} onChange={() => handleArrayChange("applicableProducts", prod._id)} className="accent-black w-4 h-4" />
                            <span className="text-gray-700 truncate">{prod.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Excluded Products</label>
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={`${inputClass} mb-2`} />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {products.length === 0 ? <p className="text-sm text-gray-400 p-1">No products</p> :
                        products.map((prod) => (
                          <label key={prod._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-sm">
                            <input type="checkbox" checked={formData.excludedProducts.includes(prod._id)} onChange={() => handleArrayChange("excludedProducts", prod._id)} className="accent-red-600 w-4 h-4" />
                            <span className="text-gray-700 truncate">{prod.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitBtnLoading}
                  className="w-full bg-black text-white py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-red-600 disabled:bg-gray-400 transition-all flex justify-center items-center gap-2"
                >
                  {submitBtnLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : editingCupponId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ STATS MODAL ============ */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-base font-bold text-black uppercase tracking-wider font-['Playfair_Display']">Coupon Stats</h2>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><FaTimes size={18} /></button>
            </div>
            <div className="p-5">
              {isStatsLoading ? (
                <div className="text-center py-8 text-gray-500 text-sm uppercase font-bold animate-pulse">Loading stats...</div>
              ) : statsData ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-200">
                    <h3 className="font-['Playfair_Display'] font-bold text-black uppercase tracking-wider text-base mb-3">
                      Code: {statsData.cuppon.code}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 uppercase font-bold">Usage Count</p>
                        <p className="font-bold text-black text-lg">{statsData.cuppon.usageCount} / {statsData.cuppon.usageLimit || "∞"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase font-bold">Total Orders</p>
                        <p className="font-bold text-black text-lg">{statsData.ordersCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-sm border border-red-200">
                    <p className="text-sm text-red-600 uppercase font-bold">Total Discount Given</p>
                    <p className="font-bold text-red-800 text-xl font-['Playfair_Display']">৳{statsData.totalDiscountGiven}</p>
                  </div>
                  {statsData.recentOrders.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3 text-black uppercase text-sm tracking-wider">Recent Orders</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {statsData.recentOrders.map((order) => (
                          <div key={order._id} className="text-sm bg-gray-50 p-3 rounded-sm border border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-black">#{order.orderId}</span>
                            <span className="text-red-600 font-bold">-৳{order.appliedCuppon?.discountAmount || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm uppercase font-bold">No stats available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CupponManage;