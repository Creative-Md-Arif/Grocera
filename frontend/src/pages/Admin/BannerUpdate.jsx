/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import {
  useGetBannerByIdQuery,
  useUpdateBannerMutation,
} from "@redux/api/bannerApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useGetProductsQuery } from "@redux/api/productApiSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL, UPLOAD_URL } from "../../redux/constants";
import {
  FaSave,
  FaCloudUploadAlt,
  FaTrash,
  FaArrowLeft,
  FaImage,
  FaMobileAlt,
  FaTag,
} from "react-icons/fa";

// --- Skeleton Loader ---
const FormSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
    <div className="space-y-6">
      <div className="border border-gray-200 p-6 rounded-sm h-48 bg-gray-100"></div>
      <div className="border border-gray-200 p-6 rounded-sm h-64 bg-gray-100"></div>
      <div className="border border-gray-200 p-6 rounded-sm h-24 bg-gray-100"></div>
    </div>
    <div className="space-y-6">
      <div className="border border-gray-200 p-6 rounded-sm h-64 bg-gray-100"></div>
      <div className="border border-gray-200 p-6 rounded-sm h-48 bg-gray-100"></div>
      <div className="border border-gray-200 p-6 rounded-sm h-32 bg-gray-100"></div>
    </div>
  </div>
);

const BannerUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: banner, isLoading: isFetching } = useGetBannerByIdQuery(id);
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const { data: categories } = useFetchCategoriesQuery();
  const { data: products } = useGetProductsQuery({});

  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(null);

  const buttonTypeOptions = useMemo(
    () => [
      { value: "default", label: "Default (Shop Now)", icon: "🛒" },
      { value: "weekend-deal", label: "Weekend Deal", icon: "🔥" },
      { value: "flash-sale", label: "Flash Sale", icon: "⚡" },
      { value: "big-sale", label: "Big Sale", icon: "💥" },
      { value: "limited-offer", label: "Limited Offer", icon: "⏰" },
      { value: "special-offer", label: "Special Offer", icon: "🎁" },
      { value: "clearance", label: "Clearance", icon: "🏷️" },
      { value: "new-arrival", label: "New Arrival", icon: "✨" },
      { value: "best-seller", label: "Best Seller", icon: "⭐" },
      { value: "trending-now", label: "Trending Now", icon: "📈" },
      { value: "hot-deal", label: "Hot Deal", icon: "🌶️" },
      { value: "mega-sale", label: "Mega Sale", icon: "🎉" },
      { value: "seasonal-offer", label: "Seasonal Offer", icon: "🌸" },
      { value: "exclusive", label: "Exclusive", icon: "💎" },
      { value: "last-chance", label: "Last Chance", icon: "⚠️" },
      { value: "doorbuster", label: "Doorbuster", icon: "🚪" },
      { value: "early-bird", label: "Early Bird", icon: "🐦" },
      { value: "member-exclusive", label: "Member Exclusive", icon: "👤" },
      { value: "bundle-deal", label: "Bundle Deal", icon: "📦" },
      { value: "buy-one-get-one", label: "Buy 1 Get 1", icon: "🎊" },
    ],
    [],
  );

  const offerTypes = useMemo(
    () => [
      { value: "percentage", label: "Percentage Discount" },
      { value: "fixed", label: "Fixed Amount" },
      { value: "bogo", label: "Buy 1 Get 1 Free" },
      { value: "free-shipping", label: "Free Shipping" },
    ],
    [],
  );

  const bannerTypes = useMemo(
    () => [
      { value: "hero", label: "Hero Banner" },
      { value: "category", label: "Category Banner" },
      { value: "promotional", label: "Promotional" },
      { value: "sidebar", label: "Sidebar" },
      { value: "popup", label: "Popup" },
      { value: "footer", label: "Footer" },
      { value: "top-bar", label: "Top Bar" },
      { value: "middle", label: "Middle" },
    ],
    [],
  );

  const displayPageOptions = useMemo(
    () => [
      { value: "home", label: "Homepage" },
      { value: "category", label: "Category" },
      { value: "product", label: "Product" },
      { value: "cart", label: "Cart" },
      { value: "checkout", label: "Checkout" },
      { value: "all", label: "All Pages" },
    ],
    [],
  );

  useEffect(() => {
    if (banner) {
      setFormData({
        name: banner.name || "",
        type: banner.type || "hero",
        headline: banner.headline || "",
        subHeadline: banner.subHeadline || "",
        image: banner.image || "",
        mobileImage: banner.mobileImage || "",
        buttonText: banner.buttonText || "Shop Now",
        buttonType: banner.buttonType || "default",
        link: banner.link || "",
        product: banner.product?._id || "",
        category: banner.category?._id || "",
        position: banner.position || 1,
        backgroundColor: banner.backgroundColor || "#ffffff",
        textColor: banner.textColor || "#000000",
        buttonColor: banner.buttonColor || "#000000",
        buttonTextColor: banner.buttonTextColor || "#ffffff",
        startDate: banner.startDate
          ? new Date(banner.startDate).toISOString().slice(0, 16)
          : "",
        endDate: banner.endDate
          ? new Date(banner.endDate).toISOString().slice(0, 16)
          : "",
        isActive: banner.isActive ?? true,
        displayPages: banner.displayPages || ["home"],
        displayOn: banner.displayOn || {
          desktop: true,
          mobile: true,
          tablet: true,
        },
        popupSettings: banner.popupSettings || {
          delay: 5,
          showAgainAfter: 24,
          couponCode: "",
          discountAmount: 0,
        },
        // ✅ countdownEndTime ফরম্যাট করা হলো
        offerSettings: {
          offerType: banner.offerSettings?.offerType || "percentage",
          offerValue: banner.offerSettings?.offerValue || 0,
          isLimitedTime: banner.offerSettings?.isLimitedTime || false,
          countdownEndTime: banner.offerSettings?.countdownEndTime
            ? new Date(banner.offerSettings.countdownEndTime)
                .toISOString()
                .slice(0, 16)
            : "",
        },
      });
    }
  }, [banner]);

  const getButtonTypeStyle = useCallback(
    (type) => {
      return (
        buttonTypeOptions.find((opt) => opt.value === type) ||
        buttonTypeOptions[0]
      );
    },
    [buttonTypeOptions],
  );

  const handleImageUpload = useCallback(async (e, isMobile = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      const { data } = await axios.post(
        `${API_URL}${UPLOAD_URL}/banner`,
        uploadFormData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setFormData((prev) => ({
        ...prev,
        [isMobile ? "mobileImage" : "image"]: data.image,
      }));
      toast.success(`${isMobile ? "Mobile" : "Desktop"} image uploaded!`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formData) return;
      try {
        await updateBanner({ bannerId: id, bannerData: formData }).unwrap();
        toast.success("Banner updated successfully!");
        navigate("/admin/bannerlist");
      } catch (error) {
        toast.error(error.data?.error || "Failed to update banner");
      }
    },
    [formData, id, navigate, updateBanner],
  );

  const handleDisplayPageChange = useCallback((page) => {
    setFormData((prev) => {
      const current = prev.displayPages;
      if (current.includes(page))
        return { ...prev, displayPages: current.filter((p) => p !== page) };
      return { ...prev, displayPages: [...current, page] };
    });
  }, []);

  // Reusable Styles with Trebuchet MS and min 14px font
  const inputClass =
    "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass =
    "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-6 py-2 gap-4">
            <div>
              {/* ✅ Dynamic Title based on type */}
              <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight uppercase">
                Update{" "}
                <span className="text-red-600">
                  /{" "}
                  {formData?.type
                    ? formData.type.charAt(0).toUpperCase() +
                      formData.type.slice(1)
                    : "Banner"}
                </span>
              </h1>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                ID: {id}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/bannerlist")}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm font-bold uppercase tracking-wider"
            >
              <FaArrowLeft size={12} /> Back to List
            </button>
          </header>

          {isFetching || !formData ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column: Images & Basic Info */}
                <div className="space-y-6">
                  {/* Images */}
                  <section className="border border-gray-200 p-6 rounded-sm bg-white">
                    <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 flex items-center gap-2 font-['Playfair_Display']">
                      <FaImage size={14} /> Assets
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Desktop */}
                      <div>
                        <label className={labelClass}>Desktop</label>
                        {formData.image ? (
                          <div className="relative group border border-gray-200 rounded-sm overflow-hidden">
                            <img
                              src={formData.image}
                              alt="Desktop"
                              className="w-full h-36 sm:h-40 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, image: "" }))
                              }
                              className="absolute top-2 right-2 bg-black text-white p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-36 sm:h-40 border border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-black transition-colors bg-gray-50">
                            <FaCloudUploadAlt className="text-2xl text-gray-400" />
                            <span className="text-sm font-bold text-gray-500 mt-2 uppercase">
                              Upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, false)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      {/* Mobile */}
                      <div>
                        <label className={labelClass}>Mobile</label>
                        {formData.mobileImage ? (
                          <div className="relative group border border-gray-200 rounded-sm overflow-hidden">
                            <img
                              src={formData.mobileImage}
                              alt="Mobile"
                              className="w-full h-36 sm:h-40 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  mobileImage: "",
                                }))
                              }
                              className="absolute top-2 right-2 bg-black text-white p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-36 sm:h-40 border border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-black transition-colors bg-gray-50">
                            <FaMobileAlt className="text-2xl text-gray-400" />
                            <span className="text-sm font-bold text-gray-500 mt-2 uppercase">
                              Upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Basic Info */}

                  <section className="border border-gray-200 p-6 rounded-sm bg-white">
                    <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 font-['Playfair_Display']">
                      Basic Info
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* ✅ Read-Only Type Input */}
                        <div>
                          <label className={labelClass}>Banner Type</label>
                          <input
                            type="text"
                            value={
                              formData.type
                                ? formData.type.charAt(0).toUpperCase() +
                                  formData.type.slice(1)
                                : ""
                            }
                            disabled
                            className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Headline</label>
                        <input
                          type="text"
                          value={formData.headline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              headline: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Sub Headline</label>
                        <input
                          type="text"
                          value={formData.subHeadline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              subHeadline: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          className={`${labelClass} flex items-center gap-1`}
                        >
                          <FaTag size={12} /> Button Type
                        </label>
                        <select
                          value={formData.buttonType}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              buttonType: e.target.value,
                            }))
                          }
                          className={selectClass}
                        >
                          {buttonTypeOptions.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2">
                          <span className="inline-block bg-black text-white px-2 py-1 rounded-sm text-sm font-bold uppercase">
                            {getButtonTypeStyle(formData.buttonType).icon}{" "}
                            {getButtonTypeStyle(formData.buttonType).label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Colors */}
                  <section className="border border-gray-200 p-6 rounded-sm bg-white">
                    <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 font-['Playfair_Display']">
                      Theme Colors
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { key: "backgroundColor", label: "Background" },
                        { key: "textColor", label: "Text" },
                        { key: "buttonColor", label: "Button" },
                        { key: "buttonTextColor", label: "Btn Text" },
                      ].map((c) => (
                        <div key={c.key} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData[c.key]}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [c.key]: e.target.value,
                              }))
                            }
                            className="w-10 h-10 border border-gray-200 rounded-sm cursor-pointer p-1"
                          />
                          <span className="text-sm font-bold text-gray-700 uppercase">
                            {c.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                  {/* Links */}
                  <section className="border border-gray-200 p-6 rounded-sm bg-white">
                    <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 font-['Playfair_Display']">
                      Links & Reference
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Button Text</label>
                          <input
                            type="text"
                            value={formData.buttonText}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                buttonText: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Position</label>
                          <input
                            type="number"
                            value={formData.position}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                position: parseInt(e.target.value),
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>URL</label>
                        <input
                          type="text"
                          value={formData.link}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              link: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Product</label>
                        <select
                          value={formData.product}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              product: e.target.value,
                            }))
                          }
                          className={selectClass}
                        >
                          <option value="">None</option>
                          {products?.products?.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className={selectClass}
                        >
                          <option value="">None</option>
                          {categories?.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Schedule */}
                  <section className="border border-gray-200 p-6 rounded-sm bg-white">
                    <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 font-['Playfair_Display']">
                      Schedule
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Start Date</label>
                          <input
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>End Date</label>
                          <input
                            type="datetime-local"
                            value={formData.endDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="accent-black w-5 h-5"
                        />
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Active
                        </span>
                      </label>
                    </div>
                  </section>

                  {/* Display Settings */}
                  <section className="border border-gray-200 p-6 rounded-sm bg-white">
                    <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 font-['Playfair_Display']">
                      Display Pages
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {displayPageOptions.map((page) => (
                        <label
                          key={page.value}
                          className={`px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors ${formData.displayPages.includes(page.value) ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-black"}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.displayPages.includes(page.value)}
                            onChange={() => handleDisplayPageChange(page.value)}
                            className="hidden"
                          />
                          {page.label}
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* Popup Settings */}
                  {formData.type === "popup" && (
                    <section className="bg-gray-50 border border-gray-200 p-6 rounded-sm">
                      <h2 className="text-base font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-200 pb-3 font-['Playfair_Display']">
                        Popup Settings
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Delay (sec)</label>
                          <input
                            type="number"
                            value={formData.popupSettings.delay}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                popupSettings: {
                                  ...prev.popupSettings,
                                  delay: parseInt(e.target.value),
                                },
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Show Again (hrs)</label>
                          <input
                            type="number"
                            value={formData.popupSettings.showAgainAfter}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                popupSettings: {
                                  ...prev.popupSettings,
                                  showAgainAfter: parseInt(e.target.value),
                                },
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* ✅ Offer Settings সেকশনটি যুক্ত করা হলো */}
                  {(formData.type === "promotional" ||
                    formData.type === "middle") && (
                    <section className="bg-gray-50 border border-gray-200 p-6 rounded-sm">
                      <h2 className="text-base font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-200 pb-3 font-['Playfair_Display']">
                        Offer Settings
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Offer Type</label>
                          <select
                            value={formData.offerSettings.offerType}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                offerSettings: {
                                  ...prev.offerSettings,
                                  offerType: e.target.value,
                                },
                              }))
                            }
                            className={selectClass}
                          >
                            {offerTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Offer Value</label>
                          <input
                            type="number"
                            value={formData.offerSettings.offerValue}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                offerSettings: {
                                  ...prev.offerSettings,
                                  offerValue: parseInt(e.target.value),
                                },
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                            Limited Time
                          </label>
                          <input
                            type="checkbox"
                            checked={formData.offerSettings.isLimitedTime}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                offerSettings: {
                                  ...prev.offerSettings,
                                  isLimitedTime: e.target.checked,
                                },
                              }))
                            }
                            className="accent-black w-5 h-5"
                          />
                        </div>
                        {formData.offerSettings.isLimitedTime && (
                          <div>
                            <label className={labelClass}>
                              Countdown End Time
                            </label>
                            <input
                              type="datetime-local"
                              value={formData.offerSettings.countdownEndTime}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  offerSettings: {
                                    ...prev.offerSettings,
                                    countdownEndTime: e.target.value,
                                  },
                                }))
                              }
                              className={inputClass}
                            />
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Preview & Submit */}
              <section className="mt-8 border-t border-gray-200 pt-8">
                <div
                  className="border border-gray-200 p-6 rounded-sm mb-6"
                  style={{
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                  }}
                >
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-40 font-['Playfair_Display']">
                    Live Preview
                  </h3>
                  {formData.buttonType !== "default" && (
                    <span className="inline-block bg-black text-white px-2 py-1 rounded-sm text-sm font-bold mb-3 uppercase">
                      {getButtonTypeStyle(formData.buttonType).icon}{" "}
                      {getButtonTypeStyle(formData.buttonType).label}
                    </span>
                  )}
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-sm mb-4 border border-gray-200"
                    />
                  )}
                  <h4 className="text-xl font-black uppercase tracking-tight font-['Playfair_Display']">
                    {formData.headline}
                  </h4>
                  <p className="text-sm opacity-80 mt-1">
                    {formData.subHeadline}
                  </p>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData.buttonColor,
                      color: formData.buttonTextColor,
                    }}
                    className="mt-4 px-5 py-2 rounded-sm font-bold text-sm uppercase tracking-wider"
                  >
                    {formData.buttonText}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/bannerlist")}
                    className="px-6 py-3 border border-gray-200 text-black font-bold uppercase tracking-widest text-sm hover:border-black transition-colors rounded-sm w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || uploading}
                    className="px-6 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm w-full sm:w-auto"
                  >
                    {isUpdating ? (
                      "Saving..."
                    ) : (
                      <>
                        <FaSave size={12} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </section>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default BannerUpdate;
