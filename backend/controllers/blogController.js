import mongoose from "mongoose";
import Blog from "../models/blogModel.js";
import sanitizeHtml from "sanitize-html";

// ---------------------------------------------------------
// 🛠 Helper Functions
// ---------------------------------------------------------

// ১. XSS Protection: HTML Content Sanitize করার ফাংশন
const sanitizeContent = (html) => {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "a",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
      "div",
      "span",
      "hr",
      "br",
      "iframe",
      "figure",
      "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
      "*": ["class", "style", "data-*", "id"],
    },
    // নিরাপত্তার জন্য a tag এ স্বয়ংক্রিয়ভাবে rel="noopener noreferrer" যুক্ত করা
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  });
};

// ২. Word Count এবং Reading Time ক্যালকুলেট করার ফাংশন
const calculateMetrics = (htmlContent) => {
  const plainText = sanitizeHtml(htmlContent, {
    allowedAttributes: {},
    allowedTags: [],
  });
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200)); // প্রতি ২০০ শব্দে ১ মিনিট
  return { wordCount: words, readingTime };
};

// ৩. টাইটেল থেকে অটো স্লাগ জেনারেট করার ফাংশন
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// ---------------------------------------------------------
// 🚀 Controller Functions
// ---------------------------------------------------------

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res) => {
  try {
    let {
      title,
      content,
      excerpt,
      featuredImage,
      seo,
      social,
      category,
      subCategory,
      tags,
      status,
      slug,
      publishedAt,
    } = req.body;

    if (!title || !content || !featuredImage?.url) {
      return res.status(400).json({
        success: false,
        message: "Title, Content, and Featured Image are required",
      });
    }

    // Content Sanitize করা
    content = sanitizeContent(content);

    // Metrics ক্যালকুলেট করা
    const { wordCount, readingTime } = calculateMetrics(content);

    // স্লাগ জেনারেট করা (যদি ফ্রন্টএন্ড থেকে না দেওয়া হয়)
    const finalSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : generateSlug(title);

    const blog = await Blog.create({
      title,
      slug: finalSlug,
      content,
      excerpt,
      featuredImage,
      seo,
      social,
      category,
      subCategory,
      tags,
      status: status || "draft",
      publishedAt: publishedAt || Date.now(),
      author: req.user._id,
      wordCount,
      readingTime,
      // প্রথম রিভিশন হিসেবে সেভ করা
      revisions: [{ content, excerpt, savedAt: Date.now() }],
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Blog with this title or slug already exists. Please use a different slug.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

// @desc    Get all blogs (Admin sees all, Public sees only published)
// @route   GET /api/blogs
// @access  Public (But admin data protected by middleware if used)
export const getAllBlogs = async (req, res) => {
  try {
    const filter = {};

    // যদি রাউটে authenticate থাকে এবং ইউজার এডমিন না হয়, তবে শুধু published দেখাবে
    // যদি রাউট পাবলিক হয়, তবে সবাই published দেখবে
    if (!req.user || !req.user.isAdmin) {
      filter.status = "published";
      filter.publishedAt = { $lte: new Date() }; // শিডিউল করা পোস্ট সময় হলে দেখাবে
    }

    // পারফরম্যান্সের জন্য বড় content এবং revisions আনা হচ্ছে না
    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .select("-content -revisions")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
};

// @desc    Get single blog by Slug (Frontend) or ID (Admin Edit)
// @route   GET /api/blogs/:slugOrId
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const { slugOrId } = req.params;

    const isId = mongoose.isValidObjectId(slugOrId);
    const query = isId ? { _id: slugOrId } : { slug: slugOrId };

    // পাবলিক ইউজার শুধু published ব্লগ দেখতে পারবে, কিন্তু এডমিন ড্রাফটও দেখতে পারবে
    if (!req.user || !req.user.isAdmin) {
      query.status = "published";
    }

    const blog = await Blog.findOne(query)
      .populate("author", "name email")
      .select("-revisions"); // রিভিশন হিস্ট্রি ছাড়া ডাটা দেখানো হবে

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or not published yet",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = req.body;

    // যদি কন্টেন্ট আপডেট করা হয়
    if (updateData.content) {
      updateData.content = sanitizeContent(updateData.content);
      const metrics = calculateMetrics(updateData.content);
      updateData.wordCount = metrics.wordCount;
      updateData.readingTime = metrics.readingTime;

      // Revision History আপডেট করা (ম্যাক্স ১০টি রাখা হবে)
      const blog = await Blog.findById(id);
      if (blog) {
        blog.revisions.unshift({
          content: updateData.content,
          excerpt: updateData.excerpt,
          savedAt: Date.now(),
        });
        if (blog.revisions.length > 10) blog.revisions.pop();
        await blog.save();
      }
    }

    // যদি টাইটেল আপডেট হয় এবং স্লাগ এডিট করা না হয়, তবে স্লাগ আপডেট হবে না (SEO এর জন্য ভালো)
    // তবে যদি স্লাগ ম্যানুয়ালি দেওয়া হয়:
    if (updateData.slug) {
      updateData.slug = updateData.slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-revisions");

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This slug is already in use. Please use a unique slug.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};
