/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTimes, FaMapMarkerAlt, FaTruck, FaExclamationTriangle,
} from "react-icons/fa";
import {
  useGetAllShippingZonesQuery, useCreateShippingZoneMutation, useUpdateShippingZoneMutation, useDeleteShippingZoneMutation,
} from "@redux/api/shippingApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useGetProductsQuery } from "@redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";
import bd from "@bd-geo-data/bd-location-data";

const DIVISION_ALIASES = {
  Chattogram: "CHITTAGONG", Barishal: "BARISAL", Cumilla: "COMILLA", Jashore: "JESSORE",
  Dhaka: "DHAKA", Khulna: "KHULNA", Mymensingh: "MYMENSINGH", Rajshahi: "RAJSHAHI",
  Rangpur: "RANGPUR", Sylhet: "SYLHET",
};

const normalizeDivision = (div) => DIVISION_ALIASES[div] || div.trim().toUpperCase();

const initialFormState = {
  zoneName: "", divisions: [], districts: [], thanas: [], baseCost: 60, baseWeightKg: 1,
  extraWeightCostPerKg: 20, freeShippingMinOrder: "", estimatedDays: "3-5 Days", isActive: true,
  applicableCategories: [], applicableProducts: [], excludedCategories: [], excludedProducts: [],
};

// --- Skeleton Loaders ---
const TableSkeleton = () => (
  <div className="hidden md:block border border-gray-200 rounded-sm bg-white">
    <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>)}
    </div>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100 flex gap-4 items-center">
        <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 h-8 bg-gray-100 rounded animate-pulse"></div>
        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-12 h-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="md:hidden space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="border border-gray-200 p-4 rounded-sm bg-white">
        <div className="flex justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-12 bg-gray-100 rounded animate-pulse mb-4"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ))}
  </div>
);

// --- Memoized Components ---
const ZoneCard = memo(function ZoneCard({ zone, handleToggle, handleEdit, handleDelete }) {
  return (
    <article className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-['Playfair_Display'] font-bold text-black uppercase tracking-wider text-base">{zone.zoneName}</h3>
          <p className="text-sm text-gray-500 font-bold uppercase mt-1">{zone.estimatedDays}</p>
        </div>
        <button onClick={() => handleToggle(zone)} className={`text-2xl ${zone.isActive ? "text-black" : "text-gray-300"}`}>
          {zone.isActive ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3 border-t border-b border-gray-100 py-3">
        {zone.divisions?.map((div) => (
          <span key={div} className="bg-gray-100 border border-gray-200 text-black px-2 py-1 text-sm font-bold uppercase rounded-sm">{div}</span>
        ))}
        {zone.districts?.map((dist) => (
          <span key={dist} className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 text-sm uppercase rounded-sm">{dist}</span>
        ))}
        {zone.thanas?.slice(0, 3).map((thana) => (
          <span key={thana} className="bg-white border border-gray-200 text-gray-600 px-2 py-1 text-sm capitalize rounded-sm">{thana}</span>
        ))}
        {zone.thanas?.length > 3 && <span className="text-sm text-gray-500 font-bold">+{zone.thanas.length - 3} more</span>}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <span className="text-gray-500 block font-bold uppercase">Base Cost</span>
          <span className="font-bold text-black text-base">৳{zone.baseCost} ({zone.baseWeightKg}kg)</span>
        </div>
        <div>
          <span className="text-gray-500 block font-bold uppercase">Extra/Kg</span>
          <span className="font-bold text-black text-base">৳{zone.extraWeightCostPerKg}</span>
        </div>
        {zone.freeShippingMinOrder && (
          <div className="col-span-2">
            <span className="text-green-600 font-bold text-sm">Free Shipping over ৳{zone.freeShippingMinOrder}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-gray-100 pt-3">
        <button onClick={() => handleEdit(zone)} className="flex-1 py-2 border border-gray-200 text-gray-600 hover:border-black hover:text-black text-sm font-bold uppercase tracking-wider transition-all rounded-sm flex items-center justify-center gap-1">
          <FaEdit size={12} /> Edit
        </button>
        <button onClick={() => handleDelete(zone._id)} className="flex-1 py-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-sm font-bold uppercase tracking-wider transition-all rounded-sm flex items-center justify-center gap-1">
          <FaTrash size={12} /> Del
        </button>
      </div>
    </article>
  );
});

const ZoneRow = memo(function ZoneRow({ zone, handleToggle, handleEdit, handleDelete }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="p-4">
        <div className="font-['Playfair_Display'] font-bold text-black uppercase tracking-wider text-base">{zone.zoneName}</div>
        <div className="text-sm text-gray-500 font-bold uppercase mt-1">{zone.estimatedDays}</div>
      </td>
      <td className="p-4">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {zone.divisions?.map((div) => <span key={div} className="bg-gray-100 border border-gray-200 text-black px-2 py-1 text-sm font-bold uppercase rounded-sm">{div}</span>)}
          {zone.districts?.map((dist) => <span key={dist} className="bg-white border border-gray-200 text-gray-700 px-2 py-1 text-sm uppercase rounded-sm">{dist}</span>)}
          {zone.thanas?.slice(0, 3).map((thana) => <span key={thana} className="bg-white border border-gray-200 text-gray-600 px-2 py-1 text-sm capitalize rounded-sm">{thana}</span>)}
          {zone.thanas?.length > 3 && <span className="text-sm text-gray-500 font-bold">+{zone.thanas.length - 3} more</span>}
        </div>
      </td>
      <td className="p-4 text-sm text-gray-700 space-y-1">
        <p className="font-bold text-black text-base">Base: ৳{zone.baseCost} ({zone.baseWeightKg}kg)</p>
        <p>Extra: ৳{zone.extraWeightCostPerKg}/kg</p>
        {zone.freeShippingMinOrder && <p className="text-green-600 font-bold text-sm uppercase">Free &gt;৳{zone.freeShippingMinOrder}</p>}
      </td>
      <td className="p-4">
        <button onClick={() => handleToggle(zone)} className={`text-2xl ${zone.isActive ? "text-black" : "text-gray-300"}`}>
          {zone.isActive ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      </td>
      <td className="p-4 text-right">
        <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleEdit(zone)} className="text-gray-500 hover:text-black transition-colors" title="Edit"><FaEdit size={16} /></button>
          <button onClick={() => handleDelete(zone._id)} className="text-gray-500 hover:text-red-600 transition-colors" title="Delete"><FaTrash size={14} /></button>
        </div>
      </td>
    </tr>
  );
});

const ShippingManage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [productSearch, setProductSearch] = useState("");

  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [selectedThanas, setSelectedThanas] = useState([]);

  const { data: zones, isLoading, refetch } = useGetAllShippingZonesQuery();
  const [createZone, { isLoading: isCreating }] = useCreateShippingZoneMutation();
  const [updateZone, { isLoading: isUpdating }] = useUpdateShippingZoneMutation();
  const [deleteZone] = useDeleteShippingZoneMutation();

  const { data: categoriesData } = useFetchCategoriesQuery();
  const { data: productsData } = useGetProductsQuery({ keyword: productSearch });

  const categories = categoriesData?.categories || categoriesData || [];
  const products = productsData?.products || productsData || [];
  const divisionsEn = bd.allDivisions("en");
  const divisionsBn = bd.allDivisions("bn");

  useEffect(() => { refetch(); }, [refetch]);

  // --- Memoized Conflict Detection ---
  const { categoryConflicts, productConflicts, hasConflicts } = useMemo(() => {
    const getConflictingIds = (applicableList, excludedList) => applicableList.filter((id) => excludedList.includes(id));
    const catConf = getConflictingIds(formData.applicableCategories, formData.excludedCategories);
    const prodConf = getConflictingIds(formData.applicableProducts, formData.excludedProducts);
    return {
      categoryConflicts: catConf,
      productConflicts: prodConf,
      hasConflicts: catConf.length > 0 || prodConf.length > 0,
    };
  }, [formData.applicableCategories, formData.excludedCategories, formData.applicableProducts, formData.excludedProducts]);

  // --- Handlers wrapped in useCallback ---
  const openAddModal = useCallback(() => {
    setFormData(initialFormState);
    setEditingId(null);
    setSelectedDivision(""); setSelectedDistrict(""); setDistricts([]); setThanas([]); setSelectedThanas([]);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((zone) => {
    setEditingId(zone._id);
    setFormData({
      zoneName: zone.zoneName, divisions: zone.divisions || [], districts: zone.districts || [], thanas: zone.thanas || [],
      baseCost: zone.baseCost, baseWeightKg: zone.baseWeightKg, extraWeightCostPerKg: zone.extraWeightCostPerKg,
      freeShippingMinOrder: zone.freeShippingMinOrder || "", estimatedDays: zone.estimatedDays, isActive: zone.isActive,
      applicableCategories: zone.applicableCategories?.map(String) || [], applicableProducts: zone.applicableProducts?.map(String) || [],
      excludedCategories: zone.excludedCategories?.map(String) || [], excludedProducts: zone.excludedProducts?.map(String) || [],
    });
    setSelectedDivision(""); setSelectedDistrict(""); setDistricts([]); setThanas([]); setSelectedThanas([]);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Are you sure you want to delete this shipping zone?")) {
      try {
        await deleteZone(id).unwrap(); toast.success("Zone deleted"); refetch();
      } catch (err) { toast.error(err?.data?.error || "Failed to delete"); }
    }
  }, [deleteZone, refetch]);

  const handleToggle = useCallback(async (zone) => {
    try {
      await updateZone({ zoneId: zone._id, data: { isActive: !zone.isActive } }).unwrap();
      toast.success("Status updated"); refetch();
    } catch (err) { toast.error("Failed to toggle status"); }
  }, [updateZone, refetch]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handleDivisionChange = useCallback((e) => {
    const divEn = e.target.value;
    setSelectedDivision(divEn); setSelectedDistrict(""); setThanas([]); setSelectedThanas([]);
    if (divEn) { setDistricts(bd.districtsOf(divEn, "en")); } else { setDistricts([]); }
  }, []);

  const handleDistrictChange = useCallback((e) => {
    const distEn = e.target.value;
    setSelectedDistrict(distEn); setSelectedThanas([]);
    if (distEn) {
      const thanasEn = bd.thanasOf(distEn, "en"); const thanasBn = bd.thanasOf(distEn, "bn");
      setThanas(thanasEn.map((tEn, i) => ({ en: tEn, bn: thanasBn[i] })));
    } else { setThanas([]); }
  }, []);

  const handleAddEntireDivision = useCallback(() => {
    if (!selectedDivision) return toast.error("Select a division first");
    const normalizedDiv = normalizeDivision(selectedDivision);
    setFormData((prev) => {
      const updatedDivisions = prev.divisions.includes(normalizedDiv) ? prev.divisions : [...prev.divisions, normalizedDiv];
      const distsUnderDiv = bd.districtsOf(selectedDivision, "en").map((d) => d.toUpperCase());
      const updatedDistricts = prev.districts.filter((d) => !distsUnderDiv.includes(d.toUpperCase()));
      let updatedThanas = prev.thanas;
      bd.districtsOf(selectedDivision, "en").forEach((dist) => {
        const thanasUnderDist = bd.thanasOf(dist, "en").map((t) => t.toLowerCase());
        updatedThanas = updatedThanas.filter((t) => !thanasUnderDist.includes(t));
      });
      return { ...prev, divisions: updatedDivisions, districts: updatedDistricts, thanas: updatedThanas };
    });
    toast.success(`${normalizedDiv} division added!`);
  }, [selectedDivision]);

  const handleAddEntireDistrict = useCallback(() => {
    if (!selectedDistrict) return toast.error("Select a district first");
    const normalizedDist = selectedDistrict.trim().toUpperCase();
    setFormData((prev) => {
      const updatedDistricts = prev.districts.includes(normalizedDist) ? prev.districts : [...prev.districts, normalizedDist];
      const thanasUnderDist = bd.thanasOf(selectedDistrict, "en").map((t) => t.toLowerCase());
      const updatedThanas = prev.thanas.filter((t) => !thanasUnderDist.includes(t));
      return { ...prev, districts: updatedDistricts, thanas: updatedThanas };
    });
    toast.success(`${normalizedDist} district added!`);
  }, [selectedDistrict]);

  const handleThanaCheck = useCallback((thanaEn) => {
    setSelectedThanas((prev) => prev.includes(thanaEn) ? prev.filter((t) => t !== thanaEn) : [...prev, thanaEn]);
  }, []);

  const handleSelectAllThanas = useCallback((e) => {
    if (e.target.checked) { setSelectedThanas(thanas.map((t) => t.en)); } else { setSelectedThanas([]); }
  }, [thanas]);

  const handleAddSelectedThanas = useCallback(() => {
    if (selectedThanas.length === 0) return toast.error("Please select at least one thana");
    setFormData((prev) => {
      let newThanas = [...prev.thanas];
      selectedThanas.forEach((thanaEn) => {
        const cityVal = thanaEn.toLowerCase().trim();
        if (!newThanas.includes(cityVal)) newThanas.push(cityVal);
      });
      return { ...prev, thanas: newThanas };
    });
    setSelectedThanas([]);
    toast.success("Thanas added successfully");
  }, [selectedThanas]);

  const handleSelectAllArray = useCallback((field, items, isChecked) => {
    if (isChecked) { setFormData((prev) => ({ ...prev, [field]: items.map((i) => i._id.toString()) })); } 
    else { setFormData((prev) => ({ ...prev, [field]: [] })); }
  }, []);

  const handleArrayIdChange = useCallback((field, id) => {
    const strId = id.toString();
    setFormData((prev) => {
      const arr = prev[field];
      if (arr.includes(strId)) { return { ...prev, [field]: arr.filter((item) => item !== strId) }; } 
      else { return { ...prev, [field]: [...arr, strId] }; }
    });
  }, []);

  const submitHandler = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.zoneName || (formData.divisions.length === 0 && formData.districts.length === 0 && formData.thanas.length === 0)) return toast.error("Zone name and at least one area are required");
    if (hasConflicts) return toast.error("Some items are in both Applicable and Excluded lists. Please fix conflicts before saving.");
    
    const payload = {
      ...formData,
      baseCost: Number(formData.baseCost), baseWeightKg: Number(formData.baseWeightKg),
      extraWeightCostPerKg: Number(formData.extraWeightCostPerKg),
      freeShippingMinOrder: formData.freeShippingMinOrder ? Number(formData.freeShippingMinOrder) : null,
    };
    
    try {
      if (editingId) { await updateZone({ zoneId: editingId, data: payload }).unwrap(); toast.success("Zone updated"); } 
      else { await createZone(payload).unwrap(); toast.success("Zone created"); }
      setIsModalOpen(false); refetch();
    } catch (err) { toast.error(err?.data?.error || "Something went wrong"); }
  }, [formData, hasConflicts, editingId, updateZone, createZone, refetch]);

  const submitBtnLoading = isCreating || isUpdating;
  const areAllThanasSelected = thanas.length > 0 && selectedThanas.length === thanas.length;

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
                Shipping <span className="text-red-600">/ Zones</span>
              </h1>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">Configure rates, weight logic, and restrictions</p>
            </div>
            <button onClick={openAddModal} className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm w-full md:w-auto justify-center">
              <FaPlus size={14} /> Create Zone
            </button>
          </header>

          {isLoading ? (
            <>
              <CardSkeleton />
              <TableSkeleton />
            </>
          ) : zones?.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm border border-dashed border-gray-200 rounded-sm bg-white">
              No zones found. Create one!
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Card Layout */}
              <div className="md:hidden space-y-4">
                {zones?.map((zone) => (
                  <ZoneCard key={zone._id} zone={zone} handleToggle={handleToggle} handleEdit={handleEdit} handleDelete={handleDelete} />
                ))}
              </div>

              {/* DESKTOP VIEW: Table Layout */}
              <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Zone Name</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Coverage</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Cost</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600">Status</th>
                      <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {zones?.map((zone) => (
                      <ZoneRow key={zone._id} zone={zone} handleToggle={handleToggle} handleEdit={handleEdit} handleDelete={handleDelete} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-24 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-3xl mb-10">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-base font-bold text-black uppercase tracking-wider font-['Playfair_Display']">
                {editingId ? "Update Zone" : "Create New Zone"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><FaTimes size={18} /></button>
            </div>

            <form onSubmit={submitHandler} className="p-5 space-y-6">
              {/* Section 1: Coverage Info */}
              <section className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 flex items-center gap-2 font-['Playfair_Display']"><FaTruck size={14} /> Zone & Coverage Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Zone Name *</label>
                    <input type="text" name="zoneName" value={formData.zoneName} onChange={handleInputChange} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Estimated Days</label>
                    <input type="text" name="estimatedDays" value={formData.estimatedDays} onChange={handleInputChange} className={inputClass} />
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 p-4 border border-gray-200 rounded-sm">
                  <label className="text-sm font-bold text-gray-600 uppercase tracking-wider block mb-3">Select Coverage Area *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-bold text-gray-500 uppercase block mb-2">বিভাগ / Division</label>
                      <select value={selectedDivision} onChange={handleDivisionChange} className={selectClass}>
                        <option value="">নির্বাচন করুন</option>
                        {divisionsEn.map((div, i) => (<option key={div} value={div}>{divisionsBn[i]} ({div})</option>))}
                      </select>
                      {selectedDivision && (
                        <button type="button" onClick={handleAddEntireDivision} className="mt-2 text-sm bg-black text-white px-4 py-2 rounded-sm w-full hover:bg-red-600 transition-all font-bold uppercase tracking-wider">
                          + Add Entire Division ({normalizeDivision(selectedDivision)})
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-500 uppercase block mb-2">জেলা / District</label>
                      <select value={selectedDistrict} onChange={handleDistrictChange} className={selectClass} disabled={!selectedDivision}>
                        <option value="">নির্বাচন করুন</option>
                        {districts.map((dist) => (<option key={dist} value={dist}>{dist}</option>))}
                      </select>
                      {selectedDistrict && (
                        <button type="button" onClick={handleAddEntireDistrict} className="mt-2 text-sm bg-black text-white px-4 py-2 rounded-sm w-full hover:bg-red-600 transition-all font-bold uppercase tracking-wider">
                          + Add Entire District ({selectedDistrict.toUpperCase()})
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedDistrict && thanas.length > 0 && (
                    <div className="border border-dashed border-gray-300 rounded-sm p-4 bg-white">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-gray-100 pb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" onChange={handleSelectAllThanas} checked={areAllThanasSelected} className="accent-black w-5 h-5" />
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select All Thanas</span>
                        </label>
                        <button type="button" onClick={handleAddSelectedThanas} className="bg-black text-white px-4 py-2 rounded-sm text-sm font-bold hover:bg-red-600 transition-all flex items-center gap-2 uppercase tracking-wider">
                          <FaPlus size={12} /> Add Selected ({selectedThanas.length})
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1">
                        {thanas.map((thana) => (
                          <label key={thana.en} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-sm border border-gray-200 hover:border-black transition-all text-sm">
                            <input type="checkbox" checked={selectedThanas.includes(thana.en)} onChange={() => handleThanaCheck(thana.en)} className="accent-black w-4 h-4" />
                            <span className="text-gray-700 truncate">{thana.bn}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Added Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.divisions.map((div) => (
                    <span key={div} className="bg-black text-white px-3 py-1 rounded-sm text-sm flex items-center gap-1 font-bold uppercase">
                      <FaMapMarkerAlt size={10} /> {div} (Div)
                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, divisions: prev.divisions.filter((d) => d !== div) }))} className="text-white hover:text-red-400 ml-1"><FaTimes size={10} /></button>
                    </span>
                  ))}
                  {formData.districts.map((dist) => (
                    <span key={dist} className="bg-gray-800 text-white px-3 py-1 rounded-sm text-sm flex items-center gap-1 font-bold uppercase">
                      <FaMapMarkerAlt size={10} /> {dist} (Dist)
                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, districts: prev.districts.filter((d) => d !== dist) }))} className="text-white hover:text-red-400 ml-1"><FaTimes size={10} /></button>
                    </span>
                  ))}
                  {formData.thanas.map((thana) => (
                    <span key={thana} className="bg-gray-100 border border-gray-200 text-black px-3 py-1 rounded-sm text-sm flex items-center gap-1 capitalize font-bold">
                      <FaMapMarkerAlt size={10} /> {thana}
                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, thanas: prev.thanas.filter((t) => t !== thana) }))} className="text-gray-500 hover:text-red-600 ml-1"><FaTimes size={10} /></button>
                    </span>
                  ))}
                  {formData.divisions.length === 0 && formData.districts.length === 0 && formData.thanas.length === 0 && (
                    <p className="text-sm text-gray-500 italic uppercase">No areas added yet</p>
                  )}
                </div>
              </section>

              {/* Section 2: Cost & Weight Logic */}
              <section className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 font-['Playfair_Display']">Cost & Weight Logic</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className={labelClass}>Base Cost (৳)</label><input type="number" name="baseCost" value={formData.baseCost} onChange={handleInputChange} className={inputClass} min="0" /></div>
                  <div><label className={labelClass}>Base Weight (Kg)</label><input type="number" name="baseWeightKg" value={formData.baseWeightKg} onChange={handleInputChange} className={inputClass} min="0" step="0.1" /></div>
                  <div><label className={labelClass}>Extra Cost/Kg (৳)</label><input type="number" name="extraWeightCostPerKg" value={formData.extraWeightCostPerKg} onChange={handleInputChange} className={inputClass} min="0" /></div>
                  <div><label className={labelClass}>Free Ship Min Order (৳)</label><input type="number" name="freeShippingMinOrder" value={formData.freeShippingMinOrder} onChange={handleInputChange} className={inputClass} min="0" placeholder="None" /></div>
                </div>
              </section>

              {/* Section 3: Restrictions */}
              <section className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2 font-['Playfair_Display']">Restrictions (Optional)</h3>
                <p className="text-sm text-gray-500 mb-4 uppercase">If left empty, rules apply to all products/categories.</p>

                {hasConflicts && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-sm font-bold text-red-700 uppercase">Conflict Detected!</p>
                      <p className="text-sm text-red-600">Items are in both Applicable and Excluded lists. Fix before saving.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass}>Applicable Categories</label>
                      <button type="button" onClick={() => handleSelectAllArray("applicableCategories", categories, formData.applicableCategories.length !== categories.length)} className="text-sm text-black font-bold hover:underline uppercase">
                        {formData.applicableCategories.length === categories.length ? "Unmark All" : "Mark All"}
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {categories.length === 0 ? <p className="text-sm text-gray-500 p-1">No categories</p> : categories.map((cat) => {
                        const isConflict = categoryConflicts.includes(cat._id.toString());
                        return (
                          <label key={cat._id} className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-sm ${isConflict ? "bg-red-50 border border-red-200" : ""}`}>
                            <input type="checkbox" checked={formData.applicableCategories.includes(cat._id.toString())} onChange={() => handleArrayIdChange("applicableCategories", cat._id)} className="accent-black w-4 h-4" />
                            <span className={`truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}>{cat.name} {isConflict && "⚠"}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass}>Excluded Categories</label>
                      <button type="button" onClick={() => handleSelectAllArray("excludedCategories", categories, formData.excludedCategories.length !== categories.length)} className="text-sm text-red-600 font-bold hover:underline uppercase">
                        {formData.excludedCategories.length === categories.length ? "Unmark All" : "Mark All"}
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {categories.length === 0 ? <p className="text-sm text-gray-500 p-1">No categories</p> : categories.map((cat) => {
                        const isConflict = categoryConflicts.includes(cat._id.toString());
                        return (
                          <label key={cat._id} className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-sm ${isConflict ? "bg-red-50 border border-red-200" : ""}`}>
                            <input type="checkbox" checked={formData.excludedCategories.includes(cat._id.toString())} onChange={() => handleArrayIdChange("excludedCategories", cat._id)} className="accent-red-600 w-4 h-4" />
                            <span className={`truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}>{cat.name} {isConflict && "⚠"}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass}>Applicable Products</label>
                      <button type="button" onClick={() => handleSelectAllArray("applicableProducts", products, formData.applicableProducts.length !== products.length)} className="text-sm text-black font-bold hover:underline uppercase">
                        {formData.applicableProducts.length === products.length ? "Unmark All" : "Mark All"}
                      </button>
                    </div>
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={`${inputClass} mb-2`} />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {products.length === 0 ? <p className="text-sm text-gray-500 p-1">No products found</p> : products.map((prod) => {
                        const isConflict = productConflicts.includes(prod._id.toString());
                        return (
                          <label key={prod._id} className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-sm ${isConflict ? "bg-red-50 border border-red-200" : ""}`}>
                            <input type="checkbox" checked={formData.applicableProducts.includes(prod._id.toString())} onChange={() => handleArrayIdChange("applicableProducts", prod._id)} className="accent-black w-4 h-4" />
                            <span className={`truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}>{prod.name} {isConflict && "⚠"}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass}>Excluded Products</label>
                      <button type="button" onClick={() => handleSelectAllArray("excludedProducts", products, formData.excludedProducts.length !== products.length)} className="text-sm text-red-600 font-bold hover:underline uppercase">
                        {formData.excludedProducts.length === products.length ? "Unmark All" : "Mark All"}
                      </button>
                    </div>
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={`${inputClass} mb-2`} />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {products.length === 0 ? <p className="text-sm text-gray-500 p-1">No products found</p> : products.map((prod) => {
                        const isConflict = productConflicts.includes(prod._id.toString());
                        return (
                          <label key={prod._id} className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-sm ${isConflict ? "bg-red-50 border border-red-200" : ""}`}>
                            <input type="checkbox" checked={formData.excludedProducts.includes(prod._id.toString())} onChange={() => handleArrayIdChange("excludedProducts", prod._id)} className="accent-red-600 w-4 h-4" />
                            <span className={`truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}>{prod.name} {isConflict && "⚠"}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="accent-black w-5 h-5" />
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Active</span>
                </label>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={submitBtnLoading || hasConflicts} className="w-full bg-black text-white py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2">
                  {submitBtnLoading ? "Processing..." : hasConflicts ? "Fix Conflicts to Save" : editingId ? "Update Zone" : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingManage;