/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useCallback, memo } from "react";
import AdminMenu from "./AdminMenu";
import { useGetSeoSettingsQuery, useUpdateSeoSettingsMutation } from "@redux/api/seoApiSlice";
import { toast } from "react-toastify";
import { FaSave, FaSearch, FaCode, FaShareAlt, FaChartBar } from "react-icons/fa";

// --- Skeleton Loader ---
const FormSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-48 bg-gray-100 rounded-sm border border-gray-200"></div>
    <div className="h-48 bg-gray-100 rounded-sm border border-gray-200"></div>
    <div className="h-48 bg-gray-100 rounded-sm border border-gray-200"></div>
    <div className="h-64 bg-gray-100 rounded-sm border border-gray-200"></div>
  </div>
);

const SeoSettings = () => {
  // ✅ Fix: seoResponse থেকে data কে আলাদা করা হয়েছে
  const { data: seoResponse, isLoading } = useGetSeoSettingsQuery();
  const seoData = seoResponse?.data || {}; 
  
  const [updateSeo, { isLoading: isUpdating }] = useUpdateSeoSettingsMutation();

  const [formData, setFormData] = useState({
    metaTitle: "", 
    metaDescription: "", 
    metaKeywords: "",
    ogTitle: "", 
    ogDescription: "", 
    ogImage: "", 
    twitterCard: "summary_large_image",
    googleAnalyticsId: "", 
    googleSearchConsole: "", 
    facebookPixelId: "",
    robotsTxt: "", 
    structuredData: "",
  });

  useEffect(() => {
    if (seoData) {
      setFormData({
        // ✅ Fix: seoData এর ভেতর থেকে ভ্যালুগুলো নেওয়া হয়েছে
        metaTitle: seoData.metaTitle || "",
        metaDescription: seoData.metaDescription || "",
        metaKeywords: seoData.metaKeywords || "",
        ogTitle: seoData.ogTitle || "",
        ogDescription: seoData.ogDescription || "",
        ogImage: seoData.ogImage || "",
        twitterCard: seoData.twitterCard || "summary_large_image",
        googleAnalyticsId: seoData.googleAnalyticsId || "",
        googleSearchConsole: seoData.googleSearchConsole || "",
        facebookPixelId: seoData.facebookPixelId || "",
        robotsTxt: seoData.robotsTxt || "",
        structuredData: seoData.structuredData || "",
      });
    }
  }, [seoData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await updateSeo(formData).unwrap();
      toast.success("SEO Settings updated successfully!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update settings");
    }
  }, [formData, updateSeo]);

  // Reusable Styles with Trebuchet MS and min 14px font
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass = "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 border-l-4 border-black pl-6 py-2">
            <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
              SEO <span className="text-red-600">/ Settings</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
              Manage global search engine optimization & tracking
            </p>
          </header>

          {isLoading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Section 1: General Meta Tags */}
              <section className="bg-white border border-gray-200 p-6 rounded-sm">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
                  <FaSearch size={14} /> General Meta Tags
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={labelClass}>Meta Title *</label>
                    <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className={inputClass} required />
                    <p className="text-sm text-gray-400 mt-1">Ideal length: 50-60 characters</p>
                  </div>
                  <div>
                    <label className={labelClass}>Meta Description *</label>
                    <textarea name="metaDescription" rows="3" value={formData.metaDescription} onChange={handleInputChange} className={`${inputClass} resize-none`} required />
                    <p className="text-sm text-gray-400 mt-1">Ideal length: 150-160 characters</p>
                  </div>
                  <div>
                    <label className={labelClass}>Meta Keywords</label>
                    <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleInputChange} className={inputClass} placeholder="Skin, gadgets, electronics" />
                  </div>
                </div>
              </section>

              {/* Section 2: Social Media Sharing */}
              <section className="bg-white border border-gray-200 p-6 rounded-sm">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
                  <FaShareAlt size={14} /> Social Media (Open Graph)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>OG Title</label>
                    <input type="text" name="ogTitle" value={formData.ogTitle} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Twitter Card Type</label>
                    <select name="twitterCard" value={formData.twitterCard} onChange={handleInputChange} className={inputClass}>
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary with Large Image</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>OG Description</label>
                    <textarea name="ogDescription" rows="2" value={formData.ogDescription} onChange={handleInputChange} className={`${inputClass} resize-none`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>OG Image URL</label>
                    <input type="text" name="ogImage" value={formData.ogImage} onChange={handleInputChange} className={inputClass} placeholder="https://example.com/image.jpg" />
                  </div>
                </div>
              </section>

              {/* Section 3: Analytics & Tracking */}
              <section className="bg-white border border-gray-200 p-6 rounded-sm">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
                  <FaChartBar size={14} /> Analytics & Tracking
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Google Analytics ID</label>
                    <input type="text" name="googleAnalyticsId" value={formData.googleAnalyticsId} onChange={handleInputChange} className={inputClass} placeholder="G-XXXXXXXXXX" />
                  </div>
                  <div>
                    <label className={labelClass}>Facebook Pixel ID</label>
                    <input type="text" name="facebookPixelId" value={formData.facebookPixelId} onChange={handleInputChange} className={inputClass} placeholder="1234567890" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Google Search Console Verification Code</label>
                    <input type="text" name="googleSearchConsole" value={formData.googleSearchConsole} onChange={handleInputChange} className={inputClass} placeholder="google-site-verification=..." />
                  </div>
                </div>
              </section>

              {/* Section 4: Advanced Settings */}
              <section className="bg-white border border-gray-200 p-6 rounded-sm">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
                  <FaCode size={14} /> Advanced Settings
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={labelClass}>Robots.txt Content</label>
                    <textarea name="robotsTxt" rows="4" value={formData.robotsTxt} onChange={handleInputChange} className={`${inputClass} resize-none font-mono`} />
                  </div>
                  <div>
                    <label className={labelClass}>Structured Data (JSON-LD Schema)</label>
                    <textarea name="structuredData" rows="6" value={formData.structuredData} onChange={handleInputChange} className={`${inputClass} resize-none font-mono`} placeholder='{"@context":"https://schema.org", ...}' />
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <div className="flex justify-end border-t border-gray-100 pt-6">
                <button 
                  type="submit" 
                  disabled={isUpdating} 
                  className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave size={14} /> Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default memo(SeoSettings);