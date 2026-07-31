import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetBlogsQuery } from "@redux/api/blogApiSlice";
import { FaCalendarAlt, FaClock, FaUser, FaFolder } from "react-icons/fa";
import Loader from "../../components/Loader";

const BlogListPage = () => {
  const { data, isLoading, isError } = useGetBlogsQuery({ status: "published" });
  const blogs = data?.data || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] font-['Trebuchet_MS']">
        <p className="text-gray-500 mb-4">Failed to load blogs.</p>
        <Link to="/" className="bg-black text-white px-6 py-2 rounded-sm uppercase text-sm font-bold">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      
      <header className="bg-white border-b border-gray-100 pt-32 pb-12 mb-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-['Playfair_Display'] mb-4">
            Our Blog
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Insights, tips, and stories about our products and the industry.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
              No blogs published yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link 
                key={blog._id} 
                to={`/blog/${blog.slug}`} 
                className="group bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="overflow-hidden aspect-w-16 aspect-h-9 bg-gray-100">
                  <img 
                    src={blog.featuredImage?.url} 
                    alt={blog.featuredImage?.altText || blog.title} 
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  {/* Category & SubCategory */}
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-[#B88E2F]">
                    {blog.category && <span className="flex items-center gap-1"><FaFolder size={10} /> {blog.category}</span>}
                    {blog.subCategory && <span className="text-gray-400">/ {blog.subCategory}</span>}
                  </div>

                  <h2 className="text-lg font-bold text-gray-800 font-['Playfair_Display'] mb-3 group-hover:text-black transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={10} /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock size={10} /> {blog.readingTime} min
                      </span>
                    </div>
                    {/* Author Name/Email */}
                    <span className="flex items-center gap-1 truncate max-w-[100px]">
                      <FaUser size={10} /> {blog.author?.name || blog.author?.email?.split('@')[0] || "Admin"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogListPage;