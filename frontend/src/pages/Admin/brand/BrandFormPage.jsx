import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useGetBrandByIdQuery,
  useCheckBrandNameQuery,
  useUploadBrandImageMutation, // ✅ ইম্পোর্ট করুন
} from "@redux/api/brandApiSlice";
import { toast } from "react-toastify";
import { FaSave, FaTimes, FaTags, FaUpload } from "react-icons/fa";
import AdminMenu from "../AdminMenu";
import { useEffect, useState } from "react";

const BrandFormPage = () => {
  const { id: brandId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!brandId;

  const { data: brandData, isLoading: brandLoading } = useGetBrandByIdQuery(
    brandId,
    { skip: !isEdit },
  );

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [uploadImage, { isLoading: isUploading }] =
    useUploadBrandImageMutation(); // ✅ আপলোড হুক

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    country: "",
    isActive: true,
    isFeatured: false,
    order: 0,
    metaTitle: "",
    metaDescription: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // ✅ ক্লাউডিনারি URL এখানে থাকবে
  const [nameTouched, setNameTouched] = useState(false);

  const { data: checkResult } = useCheckBrandNameQuery(
    { name: formData.name, excludeId: brandId },
    { skip: !nameTouched || formData.name.length < 2 },
  );

  const inputClass =
    "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass =
    "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  useEffect(() => {
    if (brandData) {
      setFormData({
        name: brandData.name || "",
        description: brandData.description || "",
        country: brandData.country || "",
        isActive: brandData.isActive,
        isFeatured: brandData.isFeatured,
        order: brandData.order || 0,
        metaTitle: brandData.metaTitle || "",
        metaDescription: brandData.metaDescription || "",
      });
      setImagePreview(brandData.image || "");
      setUploadedImageUrl(brandData.image || ""); // ✅ এডিট করার সময় পুরোনো URL সেট করা
    }
  }, [brandData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "name") setNameTouched(true);
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      const imageFormData = new FormData();
      imageFormData.append("image", file);

      try {
        const res = await uploadImage(imageFormData).unwrap();

        // ব্যাকএন্ড থেকে আসা URL খুঁজে বের করা
        const imageUrl = res.image || res.url || res.secure_url || "";

        if (imageUrl) {
          setUploadedImageUrl(imageUrl);
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Image URL not found in response");
        }
      } catch (err) {
        toast.error(err?.data?.message || "Image upload failed");
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    if (checkResult?.exists) {
      toast.error("Brand name already exists");
      return;
    }

    if (!uploadedImageUrl) {
      toast.error("Please wait for image to upload or select an image");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("country", formData.country);
    data.append("isActive", formData.isActive);
    data.append("isFeatured", formData.isFeatured);
    data.append("order", formData.order);
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);
    data.append("image", uploadedImageUrl); // ✅ ক্লাউডিনারি URL পাঠানো হচ্ছে

    try {
      if (isEdit) {
        await updateBrand({ brandId, formData: data }).unwrap();
      } else {
        await createBrand(data).unwrap();
      }
      navigate("/admin/brands");
    } catch (err) {
      toast.error(err?.data?.error || "Something went wrong");
    }
  };

  if (isEdit && brandLoading)
    return (
      <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS']">
        <AdminMenu />
        <div className="pt-24 text-center text-gray-500 uppercase tracking-widest font-bold">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 border-l-4 border-black pl-6 py-2">
            <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight flex items-center gap-3">
              <FaTags /> {isEdit ? "Edit" : "Create"}{" "}
              <span className="text-red-600">/ Brand</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
              {isEdit
                ? "Update brand information"
                : "Add a new brand to your catalog"}
            </p>
          </header>

          {/* Form Section */}
          <section className="bg-white border border-gray-200 p-6 rounded-sm mb-6">
            <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
              {isEdit ? "Edit Brand Details" : "New Brand Details"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Name */}
              <div>
                <label className={labelClass}>Brand Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. Apple"
                />
                {nameTouched && checkResult?.exists && (
                  <p className="text-red-600 text-xs mt-2 font-bold uppercase tracking-wider flex items-center gap-1">
                    <FaTimes size={10} /> {checkResult.existingBrand?.name}{" "}
                    already exists
                  </p>
                )}
                {nameTouched &&
                  !checkResult?.exists &&
                  formData.name.length >= 2 && (
                    <p className="text-green-600 text-xs mt-2 font-bold uppercase tracking-wider">
                      ✓ Available
                    </p>
                  )}
              </div>

              {/* Country */}
              <div>
                <label className={labelClass}>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. USA"
                />
              </div>

              {/* Image Upload - Cloudinary */}
              <div className="md:col-span-2">
                <label className={labelClass}>Brand Image *</label>
                <div className="flex items-center gap-6 mt-2">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Brand Preview"
                      className="w-32 h-32 object-contain border border-gray-200 p-2 rounded-sm bg-white"
                    />
                  )}
                  <label
                    className={`${inputClass} cursor-pointer w-fit border-dashed flex items-center gap-2 hover:border-black hover:bg-gray-50 ${isUploading ? "opacity-50 cursor-wait" : ""}`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload size={14} /> Upload Image
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`${inputClass} resize-none`}
                  placeholder="Short brand description..."
                ></textarea>
              </div>

              <div>
                <label className={labelClass}>Meta Title (SEO)</label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="SEO Meta Title"
                />
              </div>

              <div>
                <label className={labelClass}>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Meta Description (SEO)</label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows="2"
                  className={`${inputClass} resize-none`}
                  placeholder="SEO Meta Description"
                ></textarea>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-8 mt-2">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 accent-black cursor-pointer"
                  />
                  Active Brand
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-5 h-5 accent-yellow-500 cursor-pointer"
                  />
                  Featured Brand (Show on Homepage)
                </label>
              </div>

              <div className="md:col-span-2 flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={
                    isCreating ||
                    isUpdating ||
                    checkResult?.exists ||
                    isUploading
                  }
                  className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave size={14} />{" "}
                      {isEdit ? "Update Brand" : "Save Brand"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/brands")}
                  className="px-8 py-3 bg-gray-100 text-gray-700 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded-sm"
                >
                  <FaTimes size={14} /> Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BrandFormPage;
