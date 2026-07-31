import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@redux/api/siteSettingApiSlice";
import { toast } from "react-toastify";
import { FaSave, FaShieldAlt, FaLock } from "react-icons/fa";

// --- Skeleton Loader ---
const FormSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-4 animate-pulse mt-6">
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    <div className="h-20 bg-gray-200 rounded"></div>
    <div className="h-20 bg-gray-200 rounded"></div>
    <div className="h-20 bg-gray-200 rounded"></div>
  </div>
);

const AuthSettingManage = () => {
  const { data, isLoading } = useGetSiteSettingsQuery();
  const [updateSiteSettings, { isLoading: isSaving }] =
    useUpdateSiteSettingsMutation();

  const [authSettings, setAuthSettings] = useState({
    requireEmailVerification: true,
    allowGuestCheckout: true,
    requireLoginForCheckout: false,
  });

  useEffect(() => {
    if (data?.data?.authSettings) {
      setAuthSettings(data.data.authSettings);
    }
  }, [data]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // শুধুমাত্র authSettings পাঠানো হচ্ছে, বাকি সেটিংস আনটাচড থাকবে
      await updateSiteSettings({ authSettings }).unwrap();
      toast.success("Authentication settings updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update settings");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FaShieldAlt size={14} /> Authentication & Security
              </h2>
              <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">
                Control user registration and checkout flow
              </p>
            </div>
          </header>

          {isLoading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSave}>
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-sm p-6 mb-6"
              >
                <h2 className="text-base font-black uppercase tracking-widest text-black mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <FaLock size={14} className="text-gray-400" /> Auth Settings
                </h2>

                <div className="space-y-4">
                  {/* Require Email Verification */}
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors">
                    <div>
                      <span className="text-sm font-bold text-gray-800">
                        Require Email Verification (OTP)
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Force users to verify their email with an OTP after registration.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={authSettings.requireEmailVerification}
                      onChange={(e) =>
                        setAuthSettings({
                          ...authSettings,
                          requireEmailVerification: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-black cursor-pointer"
                    />
                  </label>

                  {/* Allow Guest Checkout */}
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors">
                    <div>
                      <span className="text-sm font-bold text-gray-800">
                        Allow Guest Checkout
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Allow customers to place orders without creating an account.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={authSettings.allowGuestCheckout}
                      onChange={(e) =>
                        setAuthSettings({
                          ...authSettings,
                          allowGuestCheckout: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-black cursor-pointer"
                    />
                  </label>

                  {/* Force Login for Checkout */}
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors">
                    <div>
                      <span className="text-sm font-bold text-gray-800">
                        Force Login for Checkout
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Require users to be logged in to complete a purchase (Overrides Guest Checkout).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={authSettings.requireLoginForCheckout}
                      onChange={(e) =>
                        setAuthSettings({
                          ...authSettings,
                          requireLoginForCheckout: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-black cursor-pointer"
                    />
                  </label>
                </div>
              </motion.section>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaSave size={12} />
                )}
                Save Changes
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthSettingManage;