/* eslint-disable react/prop-types */

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { API_URL } from "@redux/constants";
import { useState } from "react";
import { useRef } from "react";
import { useMemo } from "react";

const BlogEditor = ({ value, onChange }) => {
  const quillRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // ইমেজ আপলোড হ্যান্ডলার
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);
      setIsUploadingImage(true);

      try {
        const res = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();

        if (data.url) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection();
          editor.insertEmbed(range.index, "image", data.url, "user");
          editor.setSelection(range.index + 1);
        } else {
          console.error("Image upload failed");
        }
      } catch (err) {
        console.error("Image upload error:", err);
      } finally {
        setIsUploadingImage(false);
      }
    };
  };

  // টুলবার কনফিগারেশন
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          ["link", "image", "video"],
          ["clean"],
          ["undo", "redo"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
      history: {
        delay: 2000,
        maxStack: 500,
        userOnly: true,
      },
    }),
    [],
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "color",
    "background",
    "align",
    "list",
    "bullet",
    "script",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="relative">
      {isUploadingImage && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Write your epic blog content here..."
        className="h-72 pb-12 border-gray-200"
      />
    </div>
  );
};

export default BlogEditor;
