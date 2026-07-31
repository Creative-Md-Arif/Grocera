/* eslint-disable no-unused-vars */
import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminMenu from "./AdminMenu";
import { 
  useGetIntegrationsQuery, 
  useCreateIntegrationMutation, 
  useUpdateIntegrationMutation, // ✅ আপডেট হুক ইম্পোর্ট করা হয়েছে
  useDeleteIntegrationMutation 
} from "@redux/api/integrationApiSlice";
import { toast } from "react-toastify";
import { FaWhatsapp, FaFacebookMessenger, FaTelegram, FaInstagram, FaPlus, FaTimes, FaTrash, FaEdit } from "react-icons/fa";

const platformConfig = {
  whatsapp: { icon: <FaWhatsapp />, color: "text-green-600", bg: "bg-green-50", placeholder: "e.g. 8801712345678" },
  messenger: { icon: <FaFacebookMessenger />, color: "text-blue-600", bg: "bg-blue-50", placeholder: "e.g. m.me/yourpage" },
  telegram: { icon: <FaTelegram />, color: "text-sky-600", bg: "bg-sky-50", placeholder: "e.g. t.me/yourusername" },
  instagram: { icon: <FaInstagram />, color: "text-pink-600", bg: "bg-pink-50", placeholder: "e.g. your_instagram_username" },
};

const IntegrationManage = () => {
  const { data: integrations, isLoading } = useGetIntegrationsQuery();
  const [createIntegration] = useCreateIntegrationMutation();
  const [updateIntegration] = useUpdateIntegrationMutation(); // ✅ আপডেট হুক
  const [deleteIntegration] = useDeleteIntegrationMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // ✅ এডিটিং আইডি ট্র্যাক করার জন্য
  const [formData, setFormData] = useState({ platform: "whatsapp", accountName: "", linkOrNumber: "" });

  // ✅ নতুন অ্যাকাউন্ট যোগ করার মোড ওপেন করার ফাংশন
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ platform: "whatsapp", accountName: "", linkOrNumber: "" });
    setIsModalOpen(true);
  };

  // ✅ এডিট মোড ওপেন করার ফাংশন
  const openEditModal = (acc) => {
    setEditingId(acc._id);
    setFormData({ platform: acc.platform, accountName: acc.accountName, linkOrNumber: acc.linkOrNumber });
    setIsModalOpen(true);
  };

  // ✅ ক্রিয়েট এবং আপডেট হ্যান্ডেল করার ফাংশন
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // আপডেট করার লজিক
        await updateIntegration({ id: editingId, data: formData }).unwrap();
        toast.success("Account updated successfully");
      } else {
        // নতুন তৈরি করার লজিক
        await createIntegration(formData).unwrap();
        toast.success("Account linked successfully");
      }
      setIsModalOpen(false);
      setFormData({ platform: "whatsapp", accountName: "", linkOrNumber: "" });
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save account");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this account?")) {
      try {
        await deleteIntegration(id).unwrap();
        toast.success("Removed");
      } catch (error) {
        toast.error("Failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">
              Manage Contact Accounts
            </h2>
            {/* ✅ বাটনে openCreateModal যুক্ত করা হয়েছে */}
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800">
              <FaPlus size={12} /> Link New Account
            </button>
          </header>

          {isLoading ? (
            <div className="h-24 bg-gray-50 animate-pulse rounded-sm"></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations?.map((acc) => {
                const config = platformConfig[acc.platform];
                return (
                  <motion.div key={acc._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center text-2xl ${config.color}`}>
                        {config.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-black">{acc.accountName}</h4>
                        <span className="text-xs text-gray-500">{acc.linkOrNumber}</span>
                      </div>
                    </div>
                    {/* ✅ এডিট এবং ডিলিট বাটন যুক্ত করা হয়েছে */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(acc)} className="text-gray-500 hover:text-black p-2 transition-colors">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => handleDelete(acc._id)} className="text-red-500 hover:text-red-600 p-2 transition-colors">
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-sm w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                {/* ✅ টাইটেল ডাইনামিক করা হয়েছে */}
                <h3 className="text-lg font-bold uppercase tracking-wider">{editingId ? "Edit Account" : "Link Account"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black"><FaTimes size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Platform</label>
                  <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="messenger">Messenger</option>
                    <option value="telegram">Telegram</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Account Name</label>
                  <input type="text" required value={formData.accountName} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} placeholder="e.g. Support Team" className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Phone Number / Username / Link</label>
                  <input type="text" required value={formData.linkOrNumber} onChange={(e) => setFormData({ ...formData, linkOrNumber: e.target.value })} placeholder={platformConfig[formData.platform].placeholder} className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-bold uppercase rounded-sm hover:bg-gray-50">Cancel</button>
                  {/* ✅ বাটন টেক্সট ডাইনামিক করা হয়েছে */}
                  <button type="submit" className="px-4 py-2 bg-black text-white text-sm font-bold uppercase rounded-sm hover:bg-gray-800">{editingId ? "Update" : "Save"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(IntegrationManage);