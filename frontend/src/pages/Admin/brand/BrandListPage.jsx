
import { Link } from "react-router-dom";
import {
  useGetBrandsQuery,
  useDeleteBrandMutation,
  useToggleBrandActiveMutation,
  useToggleBrandFeaturedMutation,
} from "@redux/api/brandApiSlice";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTimes, FaTrash, FaStar, FaRegStar, FaTags } from "react-icons/fa";
import AdminMenu from "../AdminMenu";
import { useState } from "react";

const BrandListPage = () => {
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);

  const { data, isLoading, error } = useGetBrandsQuery({
    search,
    includeProducts: "true",
  });
  
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();
  const [toggleActive] = useToggleBrandActiveMutation();
  const [toggleFeatured] = useToggleBrandFeaturedMutation();

  const brands = data?.brands || [];

  console.log("Brands Data:", data);

  // Reusable Styles
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";

  const handleDelete = async (force = false) => {
    if (!deleteModal) return;
    try {
      await deleteBrand({ brandId: deleteModal._id, force }).unwrap();
      setDeleteModal(null);
    } catch (err) {
      toast.error(err?.data?.error || "Failed to delete brand");
    }
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
      <div className="pt-24 text-center text-red-500 uppercase tracking-widest font-bold">Error loading brands</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          
          {/* Header */}
          <header className="mb-8 border-l-4 border-black pl-6 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight flex items-center gap-3">
                <FaTags /> Brand <span className="text-red-600">/ Management</span>
              </h1>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                Add, edit, and manage your product brands
              </p>
            </div>
            <Link 
              to="/admin/brand/create" 
              className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2 rounded-sm"
            >
              <FaPlus size={12} /> Add New Brand
            </Link>
          </header>

          {/* Search Section */}
          <section className="bg-white border border-gray-200 p-4 rounded-sm mb-6">
             <input
                type="text"
                placeholder="Search brands by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputClass}
              />
          </section>

          {/* List Section */}
          <section className="bg-white border border-gray-200 p-6 rounded-sm">
            <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
              Brand List ({brands.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Image & Name</th>
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center">Products</th>
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center">Featured</th>
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center">Status</th>
                    <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {brand.image ? (
                            <img src={brand.image} alt={brand.name} className="w-12 h-12 object-contain border border-gray-100 p-1 rounded-sm bg-white" />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded-sm">No img</div>
                          )}
                          <div>
                            <div className="font-bold text-gray-800">{brand.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{brand.country || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-700 font-medium text-center">{brand.productCount || 0}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleFeatured(brand._id)}
                          className={`text-lg transition-colors ${brand.isFeatured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-gray-400"}`}
                          title="Toggle Featured"
                        >
                          {brand.isFeatured ? <FaStar /> : <FaRegStar />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleActive(brand._id)}
                          className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider border transition-colors ${
                            brand.isActive 
                              ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" 
                              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/brand/${brand._id}/edit`}
                            className="text-black hover:text-red-600 transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider border border-gray-200 px-3 py-1.5 rounded-sm hover:border-black"
                          >
                            <FaEdit /> Edit
                          </Link>
                          <button
                            onClick={() => setDeleteModal(brand)}
                            className="text-red-600 hover:text-white hover:bg-red-600 transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider border border-red-200 px-3 py-1.5 rounded-sm"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {brands.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-400 uppercase tracking-widest text-xs font-bold">
                        No brands found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          
        </div>
      </main>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 max-w-md w-full rounded-sm border-t-4 border-red-600">
            <h2 className="text-xl font-['Playfair_Display'] font-black text-black mb-2 flex items-center gap-2">
              <FaTrash /> Delete Brand?
            </h2>
            <p className="text-gray-600 text-sm font-['Trebuchet_MS'] mb-6">
              Are you sure you want to delete <strong>{deleteModal.name}</strong>?
              {deleteModal.productCount > 0 && (
                <span className="block mt-3 p-3 bg-red-50 border border-red-200 rounded-sm text-red-600 font-bold">
                  ⚠️ {deleteModal.productCount} product(s) are using this brand. Deleting will not remove the brand name text from existing products.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors flex items-center gap-2 rounded-sm"
              >
                <FaTimes size={12} /> Cancel
              </button>
              {deleteModal.productCount > 0 && (
                <button
                  onClick={() => handleDelete(true)}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-orange-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-orange-700 transition-colors flex items-center gap-2 rounded-sm disabled:opacity-50"
                >
                  <FaTrash size={12} /> Force Delete
                </button>
              )}
              <button
                onClick={() => handleDelete(false)}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-colors flex items-center gap-2 rounded-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandListPage;