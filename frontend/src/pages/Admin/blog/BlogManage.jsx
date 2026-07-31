import { useState, memo, useMemo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AdminMenu from "../AdminMenu";
import {
  useGetBlogsQuery,
  useDeleteBlogMutation,
} from "@redux/api/blogApiSlice";
import { toast } from "react-toastify";
import {
  FaBlog,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaPlus,
  FaClock,
  FaLock,
} from "react-icons/fa";

// --- Skeleton Loaders ---
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 p-4 rounded-sm h-24 animate-pulse"
      ></div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="h-14 border-b border-gray-100 last:border-0 animate-pulse bg-gray-50"
      ></div>
    ))}
  </div>
);

// --- Status Config Helper ---
const getStatusConfig = (status) => {
  switch (status) {
    case "published":
      return { color: "text-green-600 border-green-600", icon: <FaCheckCircle size={10} />, label: "Published" };
    case "scheduled":
      return { color: "text-blue-600 border-blue-600", icon: <FaClock size={10} />, label: "Scheduled" };
    case "private":
      return { color: "text-red-600 border-red-600", icon: <FaLock size={10} />, label: "Private" };
    default:
      return { color: "text-gray-500 border-gray-300", icon: <FaTimesCircle size={10} />, label: "Draft" };
  }
};

// --- Memoized Row ---
const BlogRow = memo(function BlogRow({
  blog,
  index,
  handleDelete,
  deletingId,
}) {
  const statusInfo = getStatusConfig(blog.status);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
    >
      {/* Image & Title */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={blog.featuredImage?.url || "https://via.placeholder.com/48"}
            alt={blog.featuredImage?.altText || blog.title}
            className="w-12 h-12 object-cover rounded-sm border border-gray-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm text-black font-bold truncate max-w-[200px]">
              {blog.title}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {blog.category || "Uncategorized"}
            </p>
          </div>
        </div>
      </td>
      
      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`bg-white border text-sm font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-flex items-center gap-1 ${statusInfo.color}`}
        >
          {statusInfo.icon}
          {statusInfo.label}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-500 uppercase tracking-wider hidden md:table-cell">
        {new Date(blog.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="inline-flex gap-2">
          <Link
            to={`/admin/blog/edit/${blog._id}`}
            className="py-2 px-3 border border-gray-200 text-black hover:bg-black hover:text-white hover:border-black text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1"
          >
            <FaEdit size={12} /> Edit
          </Link>
          <button
            onClick={() => handleDelete(blog._id, blog.title)}
            disabled={deletingId === blog._id}
            className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletingId === blog._id ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaTrash size={12} /> Del
              </>
            )}
          </button>
        </div>
      </td>
    </motion.tr>
  );
});

BlogRow.propTypes = {
  blog: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    featuredImage: PropTypes.shape({
      url: PropTypes.string,
      altText: PropTypes.string,
    }),
    status: PropTypes.string,
    category: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleDelete: PropTypes.func.isRequired,
  deletingId: PropTypes.string,
};

const BlogManage = () => {
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading, refetch } = useGetBlogsQuery();
  const [deleteBlog] = useDeleteBlogMutation();

  const blogs = useMemo(() => data?.data || [], [data]);

  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === "published").length;
    const drafts = blogs.filter((b) => b.status === "draft").length;
    return { total, published, drafts };
  }, [blogs]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete blog "${title}"?`)) return;
    setDeletingId(id);
    try {
      await deleteBlog(id).unwrap();
      toast.success("Blog deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                Manage Blog Posts
              </h2>
            </div>
            <Link
              to="/admin/blog/create"
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              <FaPlus size={12} /> Create New
            </Link>
          </header>

          {/* Stats Cards */}
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaFileAlt className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Total Blogs
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.total}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaCheckCircle className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Published
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.published}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaTimesCircle className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Drafts
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.drafts}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Table */}
          {isLoading ? (
            <TableSkeleton />
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-sm bg-white">
              <FaBlog className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                No blogs found. Create one!
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-widest text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog, index) => (
                    <BlogRow
                      key={blog._id}
                      blog={blog}
                      index={index}
                      handleDelete={handleDelete}
                      deletingId={deletingId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogManage;