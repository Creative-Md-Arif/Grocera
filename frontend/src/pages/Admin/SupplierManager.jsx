/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useGetSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation } from "@redux/api/supplierApiSlice";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTimes, FaSave, FaTruckMoving } from "react-icons/fa";
import AdminMenu from "./AdminMenu";

const SupplierManager = () => {
  // RTK Query Hooks
  const { data: suppliers, isLoading, error, refetch } = useGetSuppliersQuery();
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Reusable Styles matching SeoSettings
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass = "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  // Input Change Handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or Update Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone number are required");
      return;
    }

    try {
      if (editingId) {
        await updateSupplier({ id: editingId, data: formData }).unwrap();
        toast.success("Supplier updated successfully");
      } else {
        await createSupplier(formData).unwrap();
        toast.success("New supplier added successfully");
      }
      
      // Reset Form
      setFormData({ name: "", companyName: "", email: "", phone: "", address: "" });
      setEditingId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Something went wrong");
    }
  };

  // Edit Handler
  const handleEdit = (supplier) => {
    setEditingId(supplier._id);
    setFormData({
      name: supplier.name,
      companyName: supplier.companyName || "",
      email: supplier.email || "",
      phone: supplier.phone,
      address: supplier.address || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel Edit Handler
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", companyName: "", email: "", phone: "", address: "" });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS']">
      <AdminMenu />
      <div className="pt-24 text-center text-gray-500 uppercase tracking-widest font-bold">Loading...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS']">
      <AdminMenu />
      <div className="pt-24 text-center text-red-500 uppercase tracking-widest font-bold">Error loading suppliers</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          
          {/* Header */}
          <header className="mb-8 border-l-4 border-black pl-6 py-2">
            <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight flex items-center gap-3">
              <FaTruckMoving /> Supplier <span className="text-red-600">/ Management</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
              Add, edit, and manage your product suppliers
            </p>
          </header>

          {/* Form Section */}
          <section className="bg-white border border-gray-200 p-6 rounded-sm mb-6">
            <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
              {editingId ? <FaEdit size={14} /> : <FaPlus size={14} />} 
              {editingId ? "Edit Supplier" : "Add New Supplier"}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Supplier Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="email@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Full Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`${inputClass} resize-none`}
                  placeholder="Enter full address"
                ></textarea>
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave size={14} /> {editingId ? "Update Supplier" : "Save Supplier"}
                    </>
                  )}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-8 py-3 bg-gray-100 text-gray-700 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded-sm"
                  >
                    <FaTimes size={14} /> Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* List Section */}
          <section className="bg-white border border-gray-200 p-6 rounded-sm">
            <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
              Supplier List ({suppliers?.length || 0})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Name & Address</th>
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Company</th>
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers?.map((supplier) => (
                    <tr key={supplier._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-gray-800">{supplier.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{supplier.address || "N/A"}</div>
                      </td>
                      <td className="p-3 text-gray-700">{supplier.companyName || "-"}</td>
                      <td className="p-3 text-gray-700 font-medium">{supplier.phone}</td>
                      <td className="p-3 text-gray-700">{supplier.email || "-"}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-black hover:text-red-600 transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider border border-gray-200 px-3 py-1.5 rounded-sm hover:border-black"
                        >
                          <FaEdit /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {suppliers?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-400 uppercase tracking-widest text-xs font-bold">
                        No suppliers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
};

export default SupplierManager;