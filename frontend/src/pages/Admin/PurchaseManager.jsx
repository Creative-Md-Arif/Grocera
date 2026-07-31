/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  useGetPurchaseOrdersQuery, useCreatePurchaseOrderMutation, useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation, useReceivePurchaseItemsMutation, useGenerateInvoiceMutation,
  useRecordPaymentMutation
} from "@redux/api/purchaseApiSlice";
import { useGetSuppliersQuery } from "@redux/api/supplierApiSlice";
import { useAllProductsQuery } from "@redux/api/productApiSlice";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaEdit, FaWarehouse, FaPrint, FaMoneyBillWave, FaSearch, FaTimes, FaSave } from "react-icons/fa";
import AdminMenu from "./AdminMenu";
import PurchaseInvoicePrint from "./PurchaseInvoicePrint";

const PurchaseManager = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: poData, isLoading, refetch } = useGetPurchaseOrdersQuery({ page, keyword, status: statusFilter });
  const { data: suppliers } = useGetSuppliersQuery();
  const { data: products } = useAllProductsQuery();

  // Mutations with Loading States
  const [createPO, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();
  const [updatePO, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();
  const [deletePO] = useDeletePurchaseOrderMutation();
  const [receiveItems, { isLoading: isReceiving }] = useReceivePurchaseItemsMutation();
  const [generateInvoice, { isLoading: isGenerating }] = useGenerateInvoiceMutation();
  const [recordPayment, { isLoading: isPaying }] = useRecordPaymentMutation();

  // Modals & Forms
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [formData, setFormData] = useState({ supplierId: "", notes: "", orderItems: [] });
  
  // Form State for adding item
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [qty, setQty] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  // Modals for Action
  const [activeReceivePO, setActiveReceivePO] = useState(null);
  const [receiveQuantities, setReceiveQuantities] = useState({});
  const [activePaymentPO, setActivePaymentPO] = useState(null);
  const [paymentData, setPaymentData] = useState({ amount: 0, method: "bKash", note: "" });
  const [activeInvoicePO, setActiveInvoicePO] = useState(null);

  // Styles
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass = "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";
  const btnPrimary = "px-6 py-2.5 bg-black text-white uppercase text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 rounded-sm disabled:bg-gray-400 disabled:cursor-not-allowed";
  const btnSecondary = "px-6 py-2.5 bg-gray-100 text-gray-700 uppercase text-sm font-bold hover:bg-gray-200 transition-colors rounded-sm";

  // Filtered Products for Search
  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10);

  const openCreateModal = () => {
    setEditingPO(null);
    setFormData({ supplierId: "", notes: "", orderItems: [] });
    setSearchQuery(""); setSelectedProductId(""); setSelectedVariant(""); setQty(1); setUnitCost(0);
    setIsFormModalOpen(true);
  };

  const openEditModal = (po) => {
    setEditingPO(po);
    setFormData({ supplierId: po.supplier._id, notes: po.notes, orderItems: po.orderItems });
    setIsFormModalOpen(true);
  };

  const handleAddItemToForm = () => {
    // Validation
    if (!selectedProductId) return toast.error("Please select a product");
    if (Number(qty) <= 0) return toast.error("Quantity must be at least 1");
    if (Number(unitCost) < 0) return toast.error("Unit cost cannot be negative");

    const product = products.find(p => p._id === selectedProductId);
    let variantInfo = { hasVariants: false };
    let itemName = product.name;

    if (product.hasVariants && selectedVariant) {
      const [cIdx, sIdx] = selectedVariant.split("-").map(Number);
      const v = product.variants[cIdx];
      const s = v.sizes[sIdx];
      variantInfo = { hasVariants: true, colorName: v.color.name, sizeName: s.size, sku: s.sku };
      itemName = `${product.name} (${v.color.name}/${s.size})`;
    }

    setFormData(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, { productId: selectedProductId, name: itemName, qty: Number(qty), unitCost: Number(unitCost), variantInfo }]
    }));
    setSearchQuery(""); setSelectedProductId(""); setSelectedVariant(""); setQty(1); setUnitCost(0);
  };

  const handleRemoveFormItem = (idx) => {
    setFormData(prev => ({ ...prev, orderItems: prev.orderItems.filter((_, i) => i !== idx) }));
  };

  const handleSubmitPO = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) return toast.error("Supplier is required");
    if (formData.orderItems.length === 0) return toast.error("At least one item is required");

    try {
      if (editingPO) {
        await updatePO({ id: editingPO._id, data: formData }).unwrap();
        toast.success("PO Updated Successfully");
      } else {
        await createPO(formData).unwrap();
        toast.success("PO Created Successfully");
      }
      setIsFormModalOpen(false);
      refetch();
    } catch (err) { toast.error(err?.data?.error || "Failed to save PO"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Purchase Order?")) {
      try { await deletePO(id).unwrap(); toast.success("Deleted Successfully"); refetch(); } 
      catch (err) { toast.error(err?.data?.error || "Failed to delete"); }
    }
  };

  const openReceiveModal = (po) => {
    const initQty = {};
    po.orderItems.forEach(item => {
      const key = `${item.product}_${item.variantInfo?.colorName}_${item.variantInfo?.sizeName}`;
      initQty[key] = item.qty - item.receivedQty;
    });
    setReceiveQuantities(initQty);
    setActiveReceivePO(po);
  };

  const handleConfirmReceive = async () => {
    const receivedItems = activeReceivePO.orderItems.map(item => ({
      productId: item.product,
      variantInfo: item.variantInfo,
      qty: receiveQuantities[`${item.product}_${item.variantInfo?.colorName}_${item.variantInfo?.sizeName}`] || 0,
    }));
    
    // Validation
    const totalToReceive = receivedItems.reduce((acc, item) => acc + Number(item.qty), 0);
    if (totalToReceive === 0) return toast.error("Please enter quantity to receive");

    try {
      await receiveItems({ id: activeReceivePO._id, data: { receivedItems } }).unwrap();
      toast.success("Stock Updated Successfully");
      setActiveReceivePO(null); refetch();
    } catch (err) { toast.error(err?.data?.error || "Failed to receive stock"); }
  };

  const handlePaymentSubmit = async () => {
    // Validation
    if (!paymentData.amount || Number(paymentData.amount) <= 0) return toast.error("Enter valid amount");
    const due = activePaymentPO.totalCost - activePaymentPO.paidAmount;
    if (Number(paymentData.amount) > due) return toast.error("Amount cannot exceed due amount");

    try {
      await recordPayment({ id: activePaymentPO._id, data: paymentData }).unwrap();
      toast.success("Payment Recorded Successfully");
      setActivePaymentPO(null); refetch();
    } catch (err) { toast.error(err?.data?.error || "Failed to record payment"); }
  };

  const handlePrintInvoice = async (po) => {
    try {
      const res = await generateInvoice(po._id).unwrap();
      setActiveInvoicePO(res);
      setTimeout(() => window.print(), 500);
    } catch (err) { toast.error("Failed to generate invoice"); }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <div className="print:hidden">
        <AdminMenu />
      </div>
      
      {/* Print Area - Hidden on screen, visible on print */}
      <div className="hidden print:block">
        <PurchaseInvoicePrint po={activeInvoicePO} />
      </div>

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300 print:hidden">
        <div className="max-w-[1500px] mx-auto">
          <header className="mb-8 border-l-4 border-black pl-6 py-2 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
                Purchase <span className="text-red-600">/ Orders</span>
              </h1>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">Manage procurement & inventory</p>
            </div>
            <button onClick={openCreateModal} className={btnPrimary}>
              <FaPlus /> Create PO
            </button>
          </header>

          {/* Filters */}
          <div className="bg-white border border-gray-200 p-4 rounded-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input type="text" placeholder="Search by PO ID or Invoice..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} className={`${inputClass} pl-8`} />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={`${inputClass} md:w-1/4`}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partially_received">Partially Received</option>
              <option value="received">Received</option>
            </select>
          </div>

          {/* Table */}
          <section className="bg-white border border-gray-200 p-6 rounded-sm">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-3 font-bold uppercase tracking-wider">PO ID / Date</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Supplier</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-center">Items</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-right">Total Cost</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-center">Status</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-center">Payment</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poData?.orders?.map(po => (
                      <tr key={po._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-bold text-black">{po.poId}</p>
                          <p className="text-xs text-gray-400">{new Date(po.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-3 text-gray-700">{po.supplier?.name}</td>
                        <td className="p-3 text-center text-gray-700">{po.orderItems.length}</td>
                        <td className="p-3 text-right font-bold">৳{po.totalCost.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-sm uppercase font-bold ${po.status === 'received' ? 'bg-green-100 text-green-700' : po.status === 'partially_received' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {po.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs font-bold uppercase ${po.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{po.paymentStatus}</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {po.status !== 'received' && <button onClick={() => openReceiveModal(po)} title="Receive Stock" className="text-blue-600 hover:text-blue-800"><FaWarehouse /></button>}
                            <button onClick={() => openEditModal(po)} title="Edit" className="text-gray-500 hover:text-black"><FaEdit /></button>
                            <button onClick={() => setActivePaymentPO(po)} title="Add Payment" className="text-green-600 hover:text-green-800"><FaMoneyBillWave /></button>
                            <button onClick={() => handlePrintInvoice(po)} title="Print Invoice" disabled={isGenerating} className="text-black hover:text-red-600 disabled:text-gray-300">
                              {isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <FaPrint />}
                            </button>
                            <button onClick={() => handleDelete(po._id)} title="Delete" className="text-red-400 hover:text-red-600"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {poData?.pages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {[...Array(poData.pages).keys()].map(x => (
                  <button key={x+1} onClick={() => setPage(x+1)} className={`px-3 py-1 border ${page === x+1 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>{x+1}</button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Create/Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-bold font-['Playfair_Display']">{editingPO ? "Edit PO" : "Create Purchase Order"}</h2>
              <button onClick={() => setIsFormModalOpen(false)}><FaTimes /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className={labelClass}>Supplier *</label>
                <select value={formData.supplierId} onChange={(e) => setFormData({...formData, supplierId: e.target.value})} className={inputClass}>
                  <option value="">Select Supplier</option>
                  {suppliers?.map(s => <option key={s._id} value={s._id}>{s.name} ({s.companyName})</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className={inputClass} />
              </div>
            </div>

            {/* Add Item Section */}
            <div className="bg-gray-50 p-4 rounded-sm mb-4 border border-gray-200">
              <h3 className="text-sm font-bold uppercase mb-3 text-gray-700">Add Product</h3>
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4 relative">
                  <label className={labelClass}>Search Product</label>
                  <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedProductId(""); }} className={inputClass} placeholder="Type name..." />
                  {searchQuery && (
                    <div className="absolute z-10 mt-1 w-full bg-white border shadow-lg max-h-40 overflow-y-auto">
                      {filteredProducts?.map(p => (
                        <div key={p._id} onMouseDown={() => { setSelectedProductId(p._id); setSearchQuery(p.name); }} className="p-2 hover:bg-gray-100 cursor-pointer text-xs">
                          {p.name} <span className="text-gray-400">(Stock: {p.countInStock})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  <label className={labelClass}>Variant</label>
                  <select value={selectedVariant} onChange={(e) => setSelectedVariant(e.target.value)} disabled={!selectedProductId || !products?.find(p=>p._id===selectedProductId)?.hasVariants} className={`${inputClass} disabled:bg-gray-200`}>
                    <option value="">N/A</option>
                    {selectedProductId && products?.find(p=>p._id===selectedProductId)?.hasVariants && (
                      products.find(p=>p._id===selectedProductId).variants.map((vc, cIdx) => vc.sizes.map((s, sIdx) => <option key={`${cIdx}-${sIdx}`} value={`${cIdx}-${sIdx}`}>{vc.color.name}/{s.size}</option>))
                    )}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Unit Cost</label>
                  <input type="number" min="0" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Qty</label>
                  <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className={inputClass} />
                </div>
                <div className="col-span-1">
                  <button type="button" onClick={handleAddItemToForm} className="w-full h-[42px] bg-black text-white flex items-center justify-center rounded-sm hover:bg-red-600 transition-colors"><FaPlus /></button>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-6">
              <thead><tr className="bg-gray-100 border-b"><th className="p-2 text-left">Product</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Cost</th><th className="p-2 text-right">Total</th><th className="p-2"></th></tr></thead>
              <tbody>
                {formData.orderItems.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-center">{item.qty}</td>
                    <td className="p-2 text-right">৳{item.unitCost}</td>
                    <td className="p-2 text-right font-bold">৳{(item.qty * item.unitCost).toFixed(2)}</td>
                    <td className="p-2 text-center"><button onClick={() => handleRemoveFormItem(idx)} className="text-red-500 hover:text-red-700"><FaTrash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormModalOpen(false)} className={btnSecondary}>Cancel</button>
              <button type="button" onClick={handleSubmitPO} disabled={isCreating || isUpdating} className={btnPrimary}>
                {isCreating || isUpdating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                ) : (
                  <><FaSave /> Save PO</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {activeReceivePO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-bold font-['Playfair_Display']">Receive Stock: {activeReceivePO.poId}</h2>
              <button onClick={() => setActiveReceivePO(null)}><FaTimes /></button>
            </div>
            <table className="w-full text-sm mb-4">
              <thead><tr className="bg-gray-100 border-b"><th className="p-2 text-left">Product</th><th className="p-2 text-center">Ordered</th><th className="p-2 text-center">Received</th><th className="p-2 text-center">Receive Now</th></tr></thead>
              <tbody>
                {activeReceivePO.orderItems.map((item, idx) => {
                  const key = `${item.product}_${item.variantInfo?.colorName}_${item.variantInfo?.sizeName}`;
                  return (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-center">{item.qty}</td>
                      <td className="p-2 text-center">{item.receivedQty}</td>
                      <td className="p-2 text-center">
                        <input type="number" min="0" max={item.qty - item.receivedQty} defaultValue={item.qty - item.receivedQty} onChange={(e) => setReceiveQuantities({...receiveQuantities, [key]: Number(e.target.value)})} className="w-20 border px-2 py-1 text-center rounded-sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end gap-3">
              <button onClick={() => setActiveReceivePO(null)} className={btnSecondary}>Cancel</button>
              <button onClick={handleConfirmReceive} disabled={isReceiving} className={`${btnPrimary} bg-blue-600 hover:bg-blue-700`}>
                {isReceiving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Receiving...</>
                ) : (
                  <><FaWarehouse /> Confirm Receive</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {activePaymentPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-bold font-['Playfair_Display']">Record Payment</h2>
              <button onClick={() => setActivePaymentPO(null)}><FaTimes /></button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-sm text-sm">
              <div className="flex justify-between"><span>Total Cost:</span> <span className="font-bold">৳{activePaymentPO.totalCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Paid:</span> <span className="font-bold text-green-600">৳{activePaymentPO.paidAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Due:</span> <span className="font-bold text-red-600">৳{(activePaymentPO.totalCost - activePaymentPO.paidAmount).toFixed(2)}</span></div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Amount *</label>
                <input type="number" min="1" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Method</label>
                <select value={paymentData.method} onChange={(e) => setPaymentData({...paymentData, method: e.target.value})} className={inputClass}>
                  <option value="bKash">bKash</option><option value="Nagad">Nagad</option><option value="Bank">Bank</option><option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Note</label>
                <input type="text" value={paymentData.note} onChange={(e) => setPaymentData({...paymentData, note: e.target.value})} className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setActivePaymentPO(null)} className={btnSecondary}>Cancel</button>
              <button onClick={handlePaymentSubmit} disabled={isPaying} className={`${btnPrimary} bg-green-600 hover:bg-green-700`}>
                {isPaying ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                ) : (
                  <><FaMoneyBillWave /> Save Payment</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManager;