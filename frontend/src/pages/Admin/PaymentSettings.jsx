/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useCallback, memo } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import {
  useGetPaymentMethodsQuery,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from "../../redux/api/paymentApiSlice";
import { FaSave, FaTrash, FaPlus, FaEdit } from "react-icons/fa";

// --- Skeleton Loader ---
const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="border border-gray-200 p-6 rounded-sm bg-white animate-pulse">
        <div className="flex justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-100 rounded w-32"></div>
          </div>
          <div className="h-8 w-16 bg-gray-100 rounded"></div>
        </div>
        <div className="h-12 bg-gray-100 rounded"></div>
      </div>
    ))}
  </div>
);

// --- Memoized Payment Method Card ---
const MethodCard = memo(function MethodCard({ method, onEdit, onDelete }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="border border-gray-200 p-5 sm:p-6 rounded-sm bg-white hover:border-black transition-colors group"
    >
      <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-black uppercase tracking-wider font-['Playfair_Display']">{method.type}</h3>
          <p className="text-sm text-gray-500 font-bold uppercase mt-1">{method.accountName}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(method)} 
            className="p-2 text-gray-500 hover:text-black transition-colors rounded-sm" 
            title="Edit"
            aria-label="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button 
            onClick={() => onDelete(method.type)} 
            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-sm" 
            title="Delete"
            aria-label="Delete"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
        <p className="font-bold text-lg tracking-wider text-black font-['Playfair_Display']">{method.number}</p>
        <p className="text-sm text-gray-500 mt-1 font-bold uppercase">{method.accountType}</p>
      </div>
      {method.instructions && (
        <p className="text-sm text-gray-600 mt-4 bg-white border border-dashed border-gray-200 p-3 rounded-sm">
          <span className="font-bold text-black uppercase">Note:</span> {method.instructions}
        </p>
      )}
    </motion.article>
  );
});

const PaymentSettings = () => {
  const { data: methods, isLoading, refetch } = useGetPaymentMethodsQuery();
  const [updateMethod] = useUpdatePaymentMethodMutation();
  const [deleteMethod] = useDeletePaymentMethodMutation();

  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: "bKash",
    number: "",
    accountType: "Personal",
    accountName: "",
    instructions: "",
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await updateMethod(formData).unwrap();
      toast.success("Updated successfully");
      setEditingMethod(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update");
    }
  }, [formData, updateMethod, refetch]);

  const handleDelete = useCallback(async (type) => {
    if (window.confirm("Deactivate this method?")) {
      try {
        await deleteMethod(type).unwrap();
        toast.success("Deactivated");
        refetch();
      } catch (err) {
        toast.error("Failed to deactivate");
      }
    }
  }, [deleteMethod, refetch]);

  const handleEdit = useCallback((method) => {
    setEditingMethod(method.type);
    setFormData(method);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingMethod("new");
    setFormData({ type: "bKash", number: "", accountType: "Personal", accountName: "", instructions: "" });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Reusable Styles with Trebuchet MS and min 14px font
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-6 py-2 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
                Payment <span className="text-red-600">/ Settings</span>
              </h1>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                Manage gateways & accounts
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm w-full md:w-auto justify-center"
            >
              <FaPlus size={14} /> Add Method
            </button>
          </header>

          {/* Methods Grid */}
          {isLoading ? (
            <GridSkeleton />
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {methods?.map((method) => (
                <MethodCard 
                  key={method.type} 
                  method={method} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              ))}
            </section>
          )}

          {/* Edit / Add Form */}
          {editingMethod && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="border border-gray-200 p-6 sm:p-8 rounded-sm bg-white"
            >
              <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 font-['Playfair_Display']">
                {editingMethod === "new" ? "Add New Method" : "Edit Method"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Payment Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Account Type</label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="Personal">Personal</option>
                      <option value="Agent">Agent</option>
                      <option value="Merchant">Merchant</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className={labelClass}>Account Number *</label>
                  <input
                    type="text"
                    name="number"
                    placeholder="e.g. 017XXXXXXXX"
                    value={formData.number}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Account Name *</label>
                  <input
                    type="text"
                    name="accountName"
                    placeholder="e.g. John Doe"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Instructions (Optional)</label>
                  <textarea
                    name="instructions"
                    placeholder="Payment instructions for customers..."
                    value={formData.instructions}
                    onChange={handleInputChange}
                    className={`${inputClass} h-24 resize-none`}
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-black text-white rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaSave size={14} /> Save Method
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingMethod(null)} 
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-sm font-bold uppercase tracking-widest text-sm hover:border-black hover:text-black transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSettings;