import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import {
  useGetBlogDetailsQuery,
  useGetBlogsQuery,
} from "@redux/api/blogApiSlice";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaFolder,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaLink,
  FaTags,
} from "react-icons/fa";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

const BlogPage = () => {
  const { slugOrId } = useParams();
  
  const { data: blogData, isLoading, isError } = useGetBlogDetailsQuery(slugOrId);
  const { data: relatedData } = useGetBlogsQuery({ status: "published", limit: 3 });

  const blog = blogData?.data;
  const relatedBlogs = relatedData?.data?.filter(b => b._id !== blog?._id).slice(0, 3) || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slugOrId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
        <Loader />
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] font-['Trebuchet_MS']">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-500 mb-6">Blog post not found.</p>
        <Link to="/" className="bg-black text-white px-6 py-2 rounded-sm uppercase tracking-widest text-sm font-bold">
          Go Home
        </Link>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(blog.content, { USE_PROFILES: { html: true } });

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.seo?.metaTitle || blog.title}</title>
        <meta name="description" content={blog.seo?.metaDescription || blog.excerpt} />
        <meta name="keywords" content={blog.seo?.metaKeywords} />
        {blog.seo?.canonicalUrl && <link rel="canonical" href={blog.seo.canonicalUrl} />}
        
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.social?.ogTitle || blog.title} />
        <meta property="og:description" content={blog.social?.ogDescription || blog.excerpt} />
        <meta property="og:image" content={blog.social?.ogImage || blog.featuredImage?.url} />
        
        <meta name="twitter:card" content={blog.social?.twitterCard || "summary_large_image"} />
        <meta name="twitter:title" content={blog.social?.ogTitle || blog.title} />
        <meta name="twitter:description" content={blog.social?.ogDescription || blog.excerpt} />
        <meta name="twitter:image" content={blog.social?.ogImage || blog.featuredImage?.url} />
      </Helmet>

      {/* Hero Section */}
      <header className="relative w-full h-[50vh] min-h-[400px] bg-gray-900 overflow-hidden">
        <img 
          src={blog.featuredImage?.url} 
          alt={blog.featuredImage?.altText || blog.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="relative h-full max-w-4xl mx-auto flex flex-col justify-end px-4 sm:px-6 pb-12">
          
          {/* Category & Sub-Category */}
          <div className="flex items-center gap-2 mb-4 w-fit">
            {blog.category && (
              <span className="inline-block bg-[#B88E2F] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                {blog.category}
              </span>
            )}
            {blog.subCategory && (
              <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                {blog.subCategory}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] leading-tight mb-4">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
            <span className="flex items-center gap-2">
              <FaUser size={12} /> {blog.author?.name || blog.author?.email?.split('@')[0] || "Admin"}
            </span>
            <span className="flex items-center gap-2">
              <FaCalendarAlt size={12} /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-2">
              <FaClock size={12} /> {blog.readingTime} min read
            </span>
            <span className="flex items-center gap-2">
              <FaFolder size={12} /> {blog.wordCount} words
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-sm mb-8"
        >
          <FaArrowLeft size={10} /> Back to Blogs
        </Link>

        <article className="bg-white border border-gray-100 shadow-sm rounded-sm p-6 md:p-10">
          {blog.excerpt && (
            <div className="border-l-4 border-[#B88E2F] pl-4 mb-8 text-lg text-gray-600 italic font-medium">
              {blog.excerpt}
            </div>
          )}

          {/* Rich Text Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-['Playfair_Display'] prose-headings:text-gray-800 prose-a:text-[#B88E2F] prose-img:rounded-sm"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
          />

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                <FaTags size={12} /> Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span key={index} className="text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1 rounded-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Share */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Share this post</h4>
            <div className="flex items-center gap-2">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-sm hover:bg-black hover:text-white transition-colors">
                <FaFacebookF size={14} />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-sm hover:bg-black hover:text-white transition-colors">
                <FaTwitter size={14} />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-sm hover:bg-black hover:text-white transition-colors">
                <FaLinkedinIn size={14} />
              </a>
              <button onClick={copyLink} className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-sm hover:bg-black hover:text-white transition-colors">
                <FaLink size={14} />
              </button>
            </div>
          </div>
        </article>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16">
            <h3 className="text-xl font-bold font-['Playfair_Display'] text-gray-800 mb-6 border-b border-gray-100 pb-3">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relBlog) => (
                <Link 
                  key={relBlog._id} 
                  to={`/blog/${relBlog.slug}`} 
                  className="group bg-white border border-gray-100 rounded-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                    <img 
                      src={relBlog.featuredImage?.url} 
                      alt={relBlog.featuredImage?.altText || relBlog.title} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-gray-800 group-hover:text-[#B88E2F] transition-colors line-clamp-2">
                      {relBlog.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                      <FaCalendarAlt size={10} /> {new Date(relBlog.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BlogPage;