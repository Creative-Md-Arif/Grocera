/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import {
  useGetAllBannersQuery,
  useToggleBannerStatusMutation,
  useDeleteBannerMutation,
  useGetBannerStatsQuery,
} from "@redux/api/bannerApiSlice";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaImage,
  FaChartBar,
  FaMousePointer,
} from "react-icons/fa";

// --- Skeleton Loaders ---
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 p-4 rounded-sm h-24 animate-pulse"
      ></div>
    ))}
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-sm overflow-hidden animate-pulse"
      >
        <div className="h-40 bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- Memoized Banner Card ---
const BannerCard = memo(function BannerCard({
  banner,
  index,
  handleToggleStatus,
  handleDelete,
  getTypeLabel,
  togglingId,
  deletingId,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-black transition-colors group"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-gray-50 border-b border-gray-200">
        <img
          src={banner.image}
          alt={banner.headline}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="bg-black text-white text-sm font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
            {getTypeLabel(banner.type)}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span
            className={`border text-sm font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${banner.isActive ? "bg-white text-black border-black" : "bg-white text-gray-500 border-gray-300"}`}
          >
            {banner.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-base text-black mb-1 uppercase tracking-tight truncate font-['Playfair_Display']">
          {banner.headline}
        </h3>
        <p className="text-sm text-gray-500 uppercase tracking-wider mb-3 truncate">
          {banner.name}
        </p>

        {/* Stats */}
        <div className="flex gap-4 mb-4 text-sm text-gray-500 font-bold uppercase tracking-wider border-t border-b border-gray-100 py-2">
          <span className="flex items-center gap-1">
            <FaMousePointer size={12} className="text-gray-400" />{" "}
            {banner.clicks || 0}
          </span>
          <span className="flex items-center gap-1">
            <FaEye size={12} className="text-gray-400" />{" "}
            {banner.impressions || 0}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Toggle Status Button */}
          <button
            onClick={() => handleToggleStatus(banner._id)}
            disabled={togglingId === banner._id || deletingId === banner._id}
            className={`flex-1 py-2 border text-sm font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${banner.isActive ? "border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black" : "border-black text-black hover:bg-black hover:text-white"}`}
          >
            {togglingId === banner._id ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {banner.isActive ? (
                  <FaEyeSlash size={12} />
                ) : (
                  <FaEye size={12} />
                )}
                {banner.isActive ? "Hide" : "Show"}
              </>
            )}
          </button>

          {/* Edit Button (Fixed with Link) */}
          <Link
            to={`/admin/banner/update/${banner._id}`}
            className="flex-1 py-2 border border-gray-200 text-gray-600 hover:border-black hover:text-black text-sm font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
          >
            <FaEdit size={12} /> Edit
          </Link>

          {/* Delete Button */}
          <button
            onClick={() => handleDelete(banner._id, banner.name)}
            disabled={togglingId === banner._id || deletingId === banner._id}
            className="flex-1 py-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletingId === banner._id ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaTrash size={12} /> Del
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
});

const BannerList = () => {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: banners, isLoading, refetch } = useGetAllBannersQuery();
  const { data: stats, isLoading: statsLoading } = useGetBannerStatsQuery();
  const [toggleStatus] = useToggleBannerStatusMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const bannerTypes = useMemo(
    () => [
      { value: "hero", label: "Hero" },
      { value: "category", label: "Category" },
      { value: "promotional", label: "Promo" },
      { value: "sidebar", label: "Sidebar" },
      { value: "popup", label: "Popup" },
      { value: "footer", label: "Footer" },
      { value: "top-bar", label: "Top Bar" },
      { value: "middle", label: "Middle" },
    ],
    [],
  );

  const filteredBanners = useMemo(() => {
    if (!banners) return [];
    return banners.filter((banner) => {
      const typeMatch = filterType === "all" || banner.type === filterType;
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "active" && banner.isActive) ||
        (filterStatus === "inactive" && !banner.isActive);
      return typeMatch && statusMatch;
    });
  }, [banners, filterType, filterStatus]);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await toggleStatus(id).unwrap();
      toast.success("Status updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete banner "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteBanner(id).unwrap();
      toast.success("Banner deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete banner");
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeLabel = (type) =>
    bannerTypes.find((t) => t.value === type)?.label || type;

  // Reusable Select Style
  const selectClass =
    "bg-white border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-bold uppercase tracking-wider focus:ring-1 focus:ring-black focus:border-black outline-none transition-all cursor-pointer font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-6 py-2 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
                Banner <span className="text-red-600">/ Management</span>
              </h1>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                Manage All Placements & Creatives
              </p>
            </div>
            <Link
              to="/admin/banner/create/hero"
              className="inline-block mt-4 text-red-600 font-bold uppercase tracking-widest text-sm hover:underline"
            >
           Create your first banner
            </Link>
          </header>

          {/* Stats Cards */}
          {statsLoading ? (
            <StatsSkeleton />
          ) : (
            stats && (
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                  <FaImage className="text-xl text-gray-400" />
                  <div>
                    <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                      Total Banners
                    </p>
                    <p className="text-xl font-black text-black font-['Playfair_Display']">
                      {stats.totalBanners}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                  <FaEye className="text-xl text-gray-400" />
                  <div>
                    <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                      Active
                    </p>
                    <p className="text-xl font-black text-black font-['Playfair_Display']">
                      {stats.activeBanners}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                  <FaMousePointer className="text-xl text-gray-400" />
                  <div>
                    <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                      Total Clicks
                    </p>
                    <p className="text-xl font-black text-black font-['Playfair_Display']">
                      {stats.byType?.reduce(
                        (acc, t) => acc + t.totalClicks,
                        0,
                      ) || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                  <FaChartBar className="text-xl text-gray-400" />
                  <div>
                    <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                      Impressions
                    </p>
                    <p className="text-xl font-black text-black font-['Playfair_Display']">
                      {stats.byType?.reduce(
                        (acc, t) => acc + t.totalImpressions,
                        0,
                      ) || 0}
                    </p>
                  </div>
                </div>
              </section>
            )
          )}

          {/* Filters */}
          <section className="flex flex-col sm:flex-row gap-3 mb-6 p-4 border border-gray-200 rounded-sm bg-white">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`${selectClass} w-full sm:w-auto`}
            >
              <option value="all">All Types</option>
              {bannerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`${selectClass} w-full sm:w-auto`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </section>

          {/* Banner Grid */}
          {isLoading ? (
            <GridSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBanners.map((banner, index) => (
                <BannerCard
                  key={banner._id}
                  banner={banner}
                  index={index}
                  handleToggleStatus={handleToggleStatus}
                  handleDelete={handleDelete}
                  getTypeLabel={getTypeLabel}
                  togglingId={togglingId}
                  deletingId={deletingId}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredBanners?.length === 0 && (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-sm bg-white">
              <FaImage className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                No banners found
              </p>
              <Link
                to="/admin/banner/create"
                className="inline-block mt-4 text-red-600 font-bold uppercase tracking-widest text-sm hover:underline"
              >
                Create your first banner
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BannerList;
