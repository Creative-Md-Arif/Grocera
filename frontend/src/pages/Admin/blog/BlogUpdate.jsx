/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminMenu from "../AdminMenu";
import {
  useGetBlogDetailsQuery,
  useUpdateBlogMutation,
} from "@redux/api/blogApiSlice";
import { toast } from "react-toastify";
import { FaUpload, FaSave } from "react-icons/fa";
import { API_URL } from "@redux/constants";
import DOMPurify from "dompurify";
import Loader from "../../../components/Loader";
import BlogEditor from "./BlogEditor";

const inputClass =
  "w-full bg-white border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all";
const labelClass =
  "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2";
const sectionClass = "bg-white border border-gray-200 p-6 rounded-sm space-y-4";

const BlogUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: blogData, isLoading } = useGetBlogDetailsQuery(id);
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  // State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const [featuredImage, setFeaturedImage] = useState({
    url: "",
    altText: "",
    titleText: "",
    caption: "",
  });
  const [uploading, setUploading] = useState(false);

  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    focusKeyword: "",
  });
  const [social, setSocial] = useState({
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  });

  const autoSaveRef = useRef(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  // Prefill form when data arrives
  useEffect(() => {
    if (blogData?.data) {
      const blog = blogData.data;
      setTitle(blog.title || "");
      setSlug(blog.slug || "");
      setExcerpt(blog.excerpt || "");
      setContent(blog.content || "");
      setCategory(blog.category || "");
      setSubCategory(blog.subCategory || "");
      setTags(blog.tags?.join(", ") || "");
      setStatus(blog.status || "draft");
      setIsFeatured(blog.isFeatured || false);
      setIsSticky(blog.isSticky || false);

      setFeaturedImage(
        blog.featuredImage || {
          url: "",
          altText: "",
          titleText: "",
          caption: "",
        },
      );
      setSeo(
        blog.seo || {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          canonicalUrl: "",
          focusKeyword: "",
        },
      );
      setSocial(blog.social || { ogTitle: "", ogDescription: "", ogImage: "" });
    }
  }, [blogData]);

  // Word Count & Reading Time
  const metrics = useMemo(() => {
    const plainText = content.replace(/<[^>]+>/g, " ");
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, readingTime };
  }, [content]);

  // Auto Save Logic (5 seconds debounce)
  useEffect(() => {
    if (!title || !content || !id || isLoading) return;

    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    setAutoSaveStatus("Editing...");

    autoSaveRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus("Auto-saving...");
        await updateBlog({
          id,
          title,
          slug,
          excerpt,
          content: DOMPurify.sanitize(content, {
            USE_PROFILES: { html: true },
          }),
          category,
          subCategory,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status,
          isFeatured,
          isSticky,
          featuredImage,
          seo,
          social,
        }).unwrap();
        setAutoSaveStatus("All changes saved");
      } catch (err) {
        setAutoSaveStatus("Auto-save failed");
      }
    }, 5000);

    return () => clearTimeout(autoSaveRef.current);
  }, [
    title,
    slug,
    excerpt,
    content,
    category,
    subCategory,
    tags,
    status,
    isFeatured,
    isSticky,
    featuredImage,
    seo,
    social,
    id,
    updateBlog,
    isLoading,
  ]);

  // Image Upload
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setFeaturedImage((prev) => ({ ...prev, url: data.url }));
        toast.success("Image uploaded successfully");
      } else throw new Error(data.message || "Upload failed");
    } catch (error) {
      toast.error(error.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);

    if (!title || !content || !featuredImage.url)
      return toast.error("Title, Content, and Image are required");

    try {
      await updateBlog({
        id,
        title,
        slug,
        excerpt,
        content: DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }),
        category,
        subCategory,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status,
        isFeatured,
        isSticky,
        featuredImage,
        seo,
        social,
      }).unwrap();
      toast.success("Blog updated successfully");
      navigate("/admin/blog-manage");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update blog");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfdfd]">
        <AdminMenu />
        <main className="pt-24 px-4 lg:pl-[260px]">
          <Loader />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-3">
            <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider">
              Edit Blog Post
            </h2>
            <span className="text-xs font-bold text-gray-500">
              {autoSaveStatus}
            </span>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">
            {/* Basic Info */}
            <div className={sectionClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Excerpt (Short Summary)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className={`${inputClass} h-20 resize-none`}
                />
              </div>
            </div>

            {/* Rich Text Editor & Metrics */}
            <div className={sectionClass}>
              <div className="flex justify-between items-center mb-2">
                <label className={labelClass}>Content</label>
                <div className="text-xs text-gray-500 font-bold">
                  Words: {metrics.words} | Reading Time: {metrics.readingTime}{" "}
                  min
                </div>
              </div>
              <BlogEditor value={content} onChange={setContent} />

              {/* Live Preview */}
              {content && (
                <div className="mt-12 border-t pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Live Preview
                  </h4>
                  <div
                    className="prose max-w-none text-sm bg-gray-50 p-4 rounded-sm overflow-hidden"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(content),
                    }}
                  />
                </div>
              )}
            </div>

            {/* Featured Image */}
            <div className={sectionClass}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-600 border-b pb-2">
                Featured Image
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-sm hover:bg-gray-200 text-sm font-bold uppercase tracking-widest">
                  <FaUpload size={12} /> Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadFileHandler}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <span className="text-sm text-gray-500 animate-pulse">
                    Uploading...
                  </span>
                )}
                {featuredImage.url && (
                  <img
                    src={featuredImage.url}
                    alt="Blog"
                    className="w-20 h-20 object-cover rounded-sm border"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Alt Text"
                  value={featuredImage.altText}
                  onChange={(e) =>
                    setFeaturedImage({
                      ...featuredImage,
                      altText: e.target.value,
                    })
                  }
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Image Title"
                  value={featuredImage.titleText}
                  onChange={(e) =>
                    setFeaturedImage({
                      ...featuredImage,
                      titleText: e.target.value,
                    })
                  }
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Caption"
                  value={featuredImage.caption}
                  onChange={(e) =>
                    setFeaturedImage({
                      ...featuredImage,
                      caption: e.target.value,
                    })
                  }
                  className={`${inputClass} md:col-span-2`}
                />
              </div>
            </div>

            {/* Taxonomy & Publishing */}
            <div className={sectionClass}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-600 border-b pb-2">
                Taxonomy & Publishing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sub Category</label>
                  <input
                    type="text"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-end gap-6 pb-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-black after:content-[''] after:absolute after:mt-[2px] after:ml-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                    <span className="ml-2 text-xs font-bold uppercase tracking-widest text-gray-700">
                      Featured
                    </span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSticky}
                      onChange={(e) => setIsSticky(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-black after:content-[''] after:absolute after:mt-[2px] after:ml-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                    <span className="ml-2 text-xs font-bold uppercase tracking-widest text-gray-700">
                      Sticky
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className={sectionClass}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-600 border-b pb-2">
                SEO Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Meta Title</label>
                  <input
                    type="text"
                    value={seo.metaTitle}
                    onChange={(e) =>
                      setSeo({ ...seo, metaTitle: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Meta Description</label>
                  <textarea
                    value={seo.metaDescription}
                    onChange={(e) =>
                      setSeo({ ...seo, metaDescription: e.target.value })
                    }
                    className={`${inputClass} h-20 resize-none`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Focus Keyword</label>
                  <input
                    type="text"
                    value={seo.focusKeyword}
                    onChange={(e) =>
                      setSeo({ ...seo, focusKeyword: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Canonical URL</label>
                  <input
                    type="text"
                    value={seo.canonicalUrl}
                    onChange={(e) =>
                      setSeo({ ...seo, canonicalUrl: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Meta Keywords</label>
                  <input
                    type="text"
                    value={seo.metaKeywords}
                    onChange={(e) =>
                      setSeo({ ...seo, metaKeywords: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div className={sectionClass}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-600 border-b pb-2">
                Social Media (Open Graph)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>OG Title</label>
                  <input
                    type="text"
                    value={social.ogTitle}
                    onChange={(e) =>
                      setSocial({ ...social, ogTitle: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>OG Image URL</label>
                  <input
                    type="text"
                    value={social.ogImage}
                    onChange={(e) =>
                      setSocial({ ...social, ogImage: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>OG Description</label>
                  <textarea
                    value={social.ogDescription}
                    onChange={(e) =>
                      setSocial({ ...social, ogDescription: e.target.value })
                    }
                    className={`${inputClass} h-20 resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUpdating || uploading}
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaSave size={14} />
                )}
                Update Blog
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BlogUpdate;
