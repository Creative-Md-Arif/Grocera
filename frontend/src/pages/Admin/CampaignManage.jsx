/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, memo, useCallback } from "react";
import {
  useGetAllCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useToggleCampaignStatusMutation,
  useUploadCampaignBannerMutation,
} from "@redux/api/campaignApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useAllProductsQuery } from "@redux/api/productApiSlice";
import {
  FaPlus,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCalendar,
  FaTag,
  FaCloudArrowUp,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";
import { FaRegEdit } from "react-icons/fa";

const initialFormData = {
  title: "",
  subtitle: "",
  buttonText: "",
  description: "",
  bannerImage: "",
  type: "flash_sale",
  discountType: "percentage",
  discountValue: "",
  scope: "all",
  applicableCategories: [],
  applicableProducts: [],
  excludedProducts: [],
  maxDiscountAmount: "",
  minPurchaseAmount: "",
  startDate: "",
  endDate: "",
  priority: 0,
  isStackable: false,
  usageLimit: "",
  usagePerUser: 1,
};

// --- Skeleton Loader ---
const CardSkeleton = () => (
  <div className="bg-white border border-gray-200 p-6 rounded-sm animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100 pt-4">
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

// --- Memoized Campaign Card ---
const CampaignCard = memo(function CampaignCard({
  camp,
  handleToggle,
  handleDelete,
  openModal,
  getStatusBadgeClasses,
  togglingId,
  deletingId,
}) {
  return (
    <article className="bg-white border border-gray-200 p-6 hover:border-gray-400 transition-colors rounded-sm">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Info Section */}
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-black font-['Playfair_Display']">
              {camp.title}
            </h3>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <span
                className={`px-3 py-1 text-sm font-bold uppercase rounded-sm ${getStatusBadgeClasses(camp.status)}`}
              >
                {camp.status}
              </span>
              <span className="px-3 py-1 text-sm font-bold uppercase rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                {camp.type.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">
                Discount
              </p>
              <p className="font-medium text-black text-base">
                {camp.discountType === "percentage"
                  ? `${camp.discountValue}%`
                  : `৳${camp.discountValue}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">Scope</p>
              <p className="font-medium text-black capitalize text-base">
                {camp.scope}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">
                Schedule
              </p>
              <p className="font-medium text-black flex items-center gap-1 text-base">
                <FaCalendar size={12} />
                {new Date(camp.startDate).toLocaleDateString()} -{" "}
                {new Date(camp.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">Usage</p>
              <p className="font-medium text-black text-base">
                {camp.usedCount} / {camp.usageLimit || "∞"}
              </p>
            </div>
          </div>

          {camp.minPurchaseAmount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              * Min purchase: ৳{camp.minPurchaseAmount}
            </p>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="flex flex-row lg:flex-col gap-2 items-start lg:items-end justify-end">
          <button
            onClick={() => handleToggle(camp._id)}
            disabled={togglingId === camp._id || deletingId === camp._id}
            className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:border-black hover:text-black transition-colors text-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
          >
            {togglingId === camp._id ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {camp.status === "disabled" ? (
                  <FaToggleOff size={16} />
                ) : (
                  <FaToggleOn size={16} className="text-green-600" />
                )}
                {camp.status === "disabled" ? "Enable" : "Disable"}
              </>
            )}
          </button>

          <button
            onClick={() => openModal(camp, "edit")}
            disabled={togglingId === camp._id || deletingId === camp._id}
            className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-black text-black hover:bg-black hover:text-white transition-colors text-sm font-bold uppercase tracking-wider rounded-sm"
          >
            <FaRegEdit size={14} /> Edit
          </button>

          <button
            onClick={() => handleDelete(camp._id)}
            disabled={togglingId === camp._id || deletingId === camp._id}
            className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
          >
            {deletingId === camp._id ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaTrash size={14} /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

const CampaignManage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [modalType, setModalType] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    data: campaignRes,
    isLoading,
    refetch,
  } = useGetAllCampaignsQuery(activeTab === "all" ? "" : { status: activeTab });
  const campaigns = campaignRes?.data || [];

  const { data: categories } = useFetchCategoriesQuery();
  const { data: products } = useAllProductsQuery();

  const [createCampaign, { isLoading: isCreating }] =
    useCreateCampaignMutation();
  const [updateCampaign, { isLoading: isUpdating }] =
    useUpdateCampaignMutation();
  const [deleteCampaign, { isLoading: isDeleting }] =
    useDeleteCampaignMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleCampaignStatusMutation();
  const [uploadBanner, { isLoading: isUploading }] =
    useUploadCampaignBannerMutation();

  const tabs = ["all", "active", "upcoming", "expired", "disabled"];

  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date - offset).toISOString().slice(0, 16);
  };

  const openModal = useCallback((campaign, type) => {
    if (type === "edit" && campaign) {
      setFormData({
        ...campaign,
        subtitle: campaign.subtitle || "",
        buttonText: campaign.buttonText || "",
        startDate: formatDateTimeLocal(campaign.startDate),
        endDate: formatDateTimeLocal(campaign.endDate),
        maxDiscountAmount: campaign.maxDiscountAmount || "",
        usageLimit: campaign.usageLimit || "",
      });
      setImagePreview(campaign.bannerImage || null);
      setSelectedCampaign(campaign);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
      setSelectedCampaign(null);
    }
    setSelectedFile(null);
    setModalType(type);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedCampaign(null);
    setFormData(initialFormData);
    setSelectedFile(null);
    setImagePreview(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleArrayToggle = useCallback((id, field) => {
    setFormData((prev) => {
      const currentArray = prev[field] || [];
      return {
        ...prev,
        [field]: currentArray.includes(id)
          ? currentArray.filter((itemId) => itemId !== id)
          : [...currentArray, id],
      };
    });
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return toast.error("Please select an image first");
    try {
      const formDataCloud = new FormData();
      formDataCloud.append("image", selectedFile);
      const res = await uploadBanner(formDataCloud).unwrap();
      setFormData((prev) => ({ ...prev, bannerImage: res.url }));
      toast.success("Banner uploaded to cloud!");
    } catch (err) {
      toast.error(err?.data?.message || "Image upload failed");
    }
  }, [selectedFile, uploadBanner]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formData.bannerImage)
        return toast.error("Campaign banner image is required");
      if (new Date(formData.endDate) <= new Date(formData.startDate))
        return toast.error("End date must be after start date");

      try {
        const payload = {
          ...formData,
          maxDiscountAmount: formData.maxDiscountAmount
            ? Number(formData.maxDiscountAmount)
            : null,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
          discountValue: Number(formData.discountValue),
          minPurchaseAmount: Number(formData.minPurchaseAmount) || 0,
          priority: Number(formData.priority) || 0,
          usagePerUser: Number(formData.usagePerUser) || 1,
        };

        if (modalType === "create") {
          await createCampaign(payload).unwrap();
          toast.success("Campaign created successfully");
        } else if (modalType === "edit") {
          await updateCampaign({
            id: selectedCampaign._id,
            data: payload,
          }).unwrap();
          toast.success("Campaign updated successfully");
        }
        closeModal();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Something went wrong");
      }
    },
    [
      formData,
      modalType,
      selectedCampaign,
      createCampaign,
      updateCampaign,
      closeModal,
      refetch,
    ],
  );

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this campaign?")) {
        setDeletingId(id);
        try {
          await deleteCampaign(id).unwrap();
          toast.success("Campaign deleted");
          refetch();
        } catch (err) {
          toast.error(err?.data?.message || "Failed to delete");
        } finally {
          setDeletingId(null);
        }
      }
    },
    [deleteCampaign, refetch],
  );

  const handleToggle = useCallback(
    async (id) => {
      setTogglingId(id);
      try {
        await toggleStatus(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to toggle status");
      } finally {
        setTogglingId(null);
      }
    },
    [toggleStatus, refetch],
  );

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "expired":
        return "bg-gray-100 text-gray-700";
      case "disabled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Reusable Styles
  const inputClass =
    "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass =
    "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 border-l-4 border-black pl-6 py-2">
            <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
              Campaign <span className="text-red-600">/ Management</span>
            </h1>
            <button
              onClick={() => openModal(null, "create")}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold hover:bg-red-600 transition-colors uppercase tracking-wider text-sm rounded-sm"
            >
              <FaPlus size={14} /> Create Campaign
            </button>
          </header>

          {/* Tabs */}
          <nav className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wider border transition-colors rounded-sm ${
                  activeTab === tab
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Campaigns List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <section className="space-y-4">
              {campaigns.map((camp) => (
                <CampaignCard
                  key={camp._id}
                  camp={camp}
                  handleToggle={handleToggle}
                  handleDelete={handleDelete}
                  openModal={openModal}
                  getStatusBadgeClasses={getStatusBadgeClasses}
                  togglingId={togglingId}
                  deletingId={deletingId}
                />
              ))}
            </section>
          ) : (
            <div className="bg-white border border-gray-200 p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm rounded-sm">
              No campaigns found in this category.
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalType && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl my-10 p-6 md:p-8 border border-gray-200 rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-black mb-6 uppercase font-['Playfair_Display']">
                {modalType === "create" ? "Create New" : "Edit"} Campaign
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Campaign Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                      placeholder="e.g., Winter Flash Sale"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Subtitle (Optional)</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="e.g., Special Premium Collection"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Button Text (Optional)</label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="e.g., Shop Now"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Campaign Banner Image *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="w-full sm:w-48 h-32 border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaCloudArrowUp className="text-3xl text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-red-600 file:cursor-pointer file:transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleUpload}
                          disabled={isUploading || !selectedFile}
                          className="w-full py-2.5 border border-black text-black text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm flex items-center justify-center gap-2"
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </>
                          ) : (
                            "Upload to Cloud"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Discount & Type Config */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-base font-bold text-black mb-4 uppercase flex items-center gap-2 font-['Playfair_Display']">
                    <FaTag size={14} /> Discount Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="flash_sale">Flash Sale</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="clearance">Clearance</option>
                        <option value="category_sale">Category Sale</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Discount Type</label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (৳)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Discount Value *</label>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Max Discount (৳)</label>
                      <input
                        type="number"
                        name="maxDiscountAmount"
                        value={formData.maxDiscountAmount}
                        onChange={handleInputChange}
                        min="0"
                        className={inputClass}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Min Purchase (৳)</label>
                      <input
                        type="number"
                        name="minPurchaseAmount"
                        value={formData.minPurchaseAmount}
                        onChange={handleInputChange}
                        min="0"
                        className={inputClass}
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isStackable"
                          checked={formData.isStackable}
                          onChange={handleInputChange}
                          className="w-5 h-5 accent-black"
                        />
                        <span className="text-sm text-gray-700 font-bold uppercase">
                          Is Stackable?
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Row 3: Scope Configuration */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-base font-bold text-black mb-4 uppercase font-['Playfair_Display']">
                    Scope & Applicability
                  </h3>
                  <div className="mb-4 w-full md:w-1/3">
                    <label className={labelClass}>Scope</label>
                    <select
                      name="scope"
                      value={formData.scope}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="all">All Products</option>
                      <option value="category">Specific Categories</option>
                      <option value="product">Specific Products</option>
                    </select>
                  </div>

                  {formData.scope === "category" && (
                    <div className="mb-4">
                      <p className={labelClass}>Select Categories:</p>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 rounded-sm">
                        {categories?.map((cat) => (
                          <label
                            key={cat._id}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.applicableCategories.includes(
                                cat._id,
                              )}
                              onChange={() =>
                                handleArrayToggle(
                                  cat._id,
                                  "applicableCategories",
                                )
                              }
                              className="w-4 h-4 accent-black"
                            />
                            {cat.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.scope === "product" && (
                    <div className="mb-4">
                      <p className={labelClass}>Select Products:</p>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 p-3 space-y-2 bg-gray-50 rounded-sm">
                        {products?.map((prod) => (
                          <label
                            key={prod._id}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.applicableProducts.includes(
                                prod._id,
                              )}
                              onChange={() =>
                                handleArrayToggle(
                                  prod._id,
                                  "applicableProducts",
                                )
                              }
                              className="w-4 h-4 accent-black"
                            />
                            {prod.name}{" "}
                            <span className="text-gray-400">
                              (৳{prod.price})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.scope === "category" && (
                    <div>
                      <p className={labelClass}>
                        Excluded Products (Optional):
                      </p>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 p-3 space-y-2 bg-gray-50 rounded-sm">
                        {products?.map((prod) => (
                          <label
                            key={prod._id}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.excludedProducts.includes(
                                prod._id,
                              )}
                              onChange={() =>
                                handleArrayToggle(prod._id, "excludedProducts")
                              }
                              className="w-4 h-4 accent-black"
                            />
                            {prod.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 4: Schedule & Limits */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-base font-bold text-black mb-4 uppercase flex items-center gap-2 font-['Playfair_Display']">
                    <FaCalendar size={14} /> Schedule & Limits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>Start Date *</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Date *</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Priority</label>
                      <input
                        type="number"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        min="0"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Total Usage Limit</label>
                      <input
                        type="number"
                        name="usageLimit"
                        value={formData.usageLimit}
                        onChange={handleInputChange}
                        min="0"
                        className={inputClass}
                        placeholder="Empty = Unlimited"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Per User Limit</label>
                      <input
                        type="number"
                        name="usagePerUser"
                        value={formData.usagePerUser}
                        onChange={handleInputChange}
                        min="1"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-sm hover:border-black transition-colors rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex-1 py-3 bg-black text-white font-bold uppercase tracking-wider text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm"
                  >
                    {isCreating || isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : modalType === "create" ? (
                      "Create Campaign"
                    ) : (
                      "Update Campaign"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignManage;
