/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import AdminMenu from "./AdminMenu";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from "@redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { TreeSelect } from "antd";
import {
  FaTrash,
  FaSave,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaPalette,
  FaRuler,
  FaTruck,
} from "react-icons/fa";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import "react-quill/dist/quill.snow.css";

window.Quill = Quill;
Quill.register("modules/imageResize", ImageResize);

// Custom Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce"></div>
  </div>
);

// --- Skeleton Loader ---
const FormSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex gap-4 border-b border-gray-200 pb-4">
      <div className="h-10 w-24 bg-gray-200 rounded"></div>
      <div className="h-10 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="h-36 bg-gray-100 border border-dashed border-gray-200 rounded"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded"></div>)}
    </div>
    <div className="h-48 bg-gray-100 rounded"></div>
  </div>
);

// --- Memoized React Quill Editor ---
const DescriptionEditor = memo(function DescriptionEditor({ quillRef, value, onChange, modules, formats }) {
  return (
    <div className="border border-gray-200 rounded-sm overflow-hidden">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="min-h-[300px] sm:min-h-[400px] description-quill"
      />
    </div>
  );
});

const ProductUpdate = () => {
  const params = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const { data: productData, isLoading, refetch } = useGetProductByIdQuery(params._id);
  const { data: categories = [] } = useFetchCategoriesQuery();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [brand, setBrand] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [warranty, setWarranty] = useState("");
  const [discountedAmount, setDiscountedAmount] = useState(0);
  const [weight, setWeight] = useState(0.5);

  const [shippingDetails, setShippingDetails] = useState({
    isFreeShipping: false,
    isIndividualShipping: false,
    individualShippingCost: 0,
    extraShippingCost: 0,
  });

  const [keyFeatures, setKeyFeatures] = useState([""]);
  const [specifications, setSpecifications] = useState([{ label: "", value: "" }]);

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [activeVariantTab, setActiveVariantTab] = useState("basic");

  const [uploadLoading, setUploadLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // --- Handlers wrapped in useCallback for Performance ---
  const handlePriceChange = useCallback((val) => {
    const p = Number(val);
    setPrice(p);
    setDiscountedAmount((prevDisc) => {
      if (prevDisc > 0 && p > 0) return Math.round((p * (prevDisc / p > 0 ? (prevDisc / Number(price)) * 100 : 0)) / 100); 
      return prevDisc;
    });
  }, [price]);

  const handleDiscountPercentageChange = useCallback((val) => {
    const perc = Number(val);
    setDiscountPercentage(perc);
    setPrice((prevPrice) => {
      if (prevPrice > 0 && perc > 0) {
        setDiscountedAmount(Math.round((prevPrice * perc) / 100));
      } else {
        setDiscountedAmount(0);
      }
      return prevPrice;
    });
  }, []);

  const handleDiscountedAmountChange = useCallback((val) => {
    const amt = Number(val);
    setDiscountedAmount(amt);
    setPrice((prevPrice) => {
      if (prevPrice > 0 && amt > 0) {
        setDiscountPercentage(Math.round((amt / prevPrice) * 100));
      } else {
        setDiscountPercentage(0);
      }
      return prevPrice;
    });
  }, []);

  // Category Tree
  const organizedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const buildTree = (cats, parentPath = "") => {
      return cats.map((cat) => {
        const currentPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
        const node = { title: cat.name, label: currentPath, value: cat._id, key: cat._id };
        if (cat.children && cat.children.length > 0) {
          node.children = buildTree(cat.children, currentPath);
        }
        return node;
      });
    };
    return buildTree(categories);
  }, [categories]);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("image", file);
      try {
        toast.info("Uploading image to description...");
        const res = await uploadProductImage(formData).unwrap();
        const url = res.images[0];
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", url);
      } catch (error) {
        toast.error("Image upload failed");
      }
    };
  }, [uploadProductImage]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
      imageResize: {
        parrentElement: "section",
        modules: ["Resize", "DisplaySize", "Toolbar"],
      },
    }),
    [imageHandler]
  );

  const formats = [
    "header", "size", "bold", "italic", "underline", "strike", "blockquote",
    "color", "background", "align", "script", "list", "bullet", "indent",
    "link", "image", "video",
  ];

 useEffect(() => {
  if (productData && productData._id) {
    setName(productData.name);
    setDescription(productData.description || "");
    setPrice(productData.price || 0);
    setCategory(productData.category?._id || productData.category);
    setQuantity(productData.quantity || 0);
    setBrand(productData.brand || "");
    setImages(productData.images || []);
    setDiscountPercentage(productData.discountPercentage || 0);
    setIsFeatured(productData.isFeatured || false);
    setWarranty(productData.warranty || "");
    setDiscountedAmount(productData.discountedAmount || 0);
    setCountInStock(productData.countInStock || 0);
    setWeight(productData.weight || 0.5);

    if (productData.shippingDetails) setShippingDetails(structuredClone(productData.shippingDetails));
    if (productData.keyFeatures) setKeyFeatures(structuredClone(productData.keyFeatures));
    if (productData.specifications) setSpecifications(structuredClone(productData.specifications));

    if (productData.hasVariants !== undefined) setHasVariants(productData.hasVariants);
    if (productData.variants && productData.variants.length > 0) setVariants(structuredClone(productData.variants));
  }
}, [productData]);

  const addSpec = useCallback(() => setSpecifications((s) => [...s, { label: "", value: "" }]), []);
  const removeSpec = useCallback((index) => setSpecifications((s) => s.filter((_, i) => i !== index)), []);
  
const handleSpecChange = useCallback((index, field, val) => {
  setSpecifications((prev) =>
    prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
  );
}, []);

  const addFeature = useCallback(() => setKeyFeatures((f) => [...f, ""]), []);
  const removeFeature = useCallback((index) => setKeyFeatures((f) => f.filter((_, i) => i !== index)), []);
  
  const handleFeatureChange = useCallback((index, val) => {
    setKeyFeatures((prev) => {
      const newFeatures = [...prev];
      newFeatures[index] = val;
      return newFeatures;
    });
  }, []);
  
const addColorVariant = useCallback(() => {
  setVariants((v) => [
    ...v,
    {
      color: { name: "", hexCode: "#000000", image: "", images: [] },
      sizes: [{ size: "", price: Number(price) || 0, countInStock: 0, sku: "", isAvailable: true }],
      isActive: true,
    },
  ]);
}, [price]);

  const removeColorVariant = useCallback((colorIndex) => setVariants((v) => v.filter((_, i) => i !== colorIndex)), []);
const updateColorInfo = useCallback((colorIndex, field, value) => {
  setVariants((prev) =>
    prev.map((v, i) =>
      i === colorIndex ? { ...v, color: { ...v.color, [field]: value } } : v
    )
  );
}, []);
  
const uploadColorImage = useCallback(async (e, colorIndex) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("image", file);
  try {
    toast.info("Uploading color image...");
    const res = await uploadProductImage(formData).unwrap();
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== colorIndex) return v;
        const newImage = res.images[0];
        const images = v.color.images.includes(newImage)
          ? v.color.images
          : [...v.color.images, newImage];
        return { ...v, color: { ...v.color, image: newImage, images } };
      })
    );
    toast.success("Color image uploaded!");
  } catch (error) {
    toast.error("Upload failed");
  }
}, [uploadProductImage]);

const addSizeToVariant = useCallback((colorIndex) => {
  setVariants((prev) =>
    prev.map((v, i) =>
      i === colorIndex
        ? {
            ...v,
            sizes: [
              ...v.sizes,
              { size: "", price: Number(price) || 0, countInStock: 0, sku: "", isAvailable: true },
            ],
          }
        : v
    )
  );
}, [price]);
  
const removeSizeFromVariant = useCallback((colorIndex, sizeIndex) => {
  setVariants((prev) =>
    prev.map((v, i) =>
      i === colorIndex ? { ...v, sizes: v.sizes.filter((_, si) => si !== sizeIndex) } : v
    )
  );
}, []);

const updateSizeInfo = useCallback((colorIndex, sizeIndex, field, value) => {
  setVariants((prev) =>
    prev.map((v, i) =>
      i === colorIndex
        ? { ...v, sizes: v.sizes.map((s, si) => (si === sizeIndex ? { ...s, [field]: value } : s)) }
        : v
    )
  );
}, []);

  const moveImage = useCallback((index, direction) => {
    setImages((prev) => {
      const updatedImages = [...prev];
      const newIndex = direction === "left" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= updatedImages.length) return prev;
      [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];
      return updatedImages;
    });
  }, []);

  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("image", files[i]);
    setUploadLoading(true);
    try {
      const res = await uploadProductImage(formData).unwrap();
      setImages((prev) => [...prev, ...res.images]);
      toast.success("Images Sync Complete");
    } catch (err) {
      toast.error("Upload Error");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    if (hasVariants) {
      if (variants.length === 0) {
        toast.error("At least one color variant is required.");
        setUpdateLoading(false);
        return;
      }
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.color.name) {
          toast.error(`Color name is required for variant ${i + 1}`);
          setUpdateLoading(false);
          return;
        }
        if (!v.color.image) {
          toast.error(`Image is required for color: ${v.color.name}`);
          setUpdateLoading(false);
          return;
        }
        if (v.sizes.length === 0) {
          toast.error(`At least one size required for: ${v.color.name}`);
          setUpdateLoading(false);
          return;
        }
        for (let j = 0; j < v.sizes.length; j++) {
          if (!v.sizes[j].size) {
            toast.error(`Size name required for ${v.color.name}`);
            setUpdateLoading(false);
            return;
          }
          if (v.sizes[j].price <= 0) {
            toast.error(`Valid price required for ${v.color.name} - ${v.sizes[j].size}`);
            setUpdateLoading(false);
            return;
          }
        }
      }
    }

    try {
      const formData = new FormData();
      formData.append("images", JSON.stringify(images));
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("quantity", quantity);
      formData.append("brand", brand);
      formData.append("countInStock", countInStock);
      formData.append("discountPercentage", discountPercentage);
      formData.append("discountedAmount", discountedAmount);
      formData.append("isFeatured", isFeatured);
      formData.append("warranty", warranty);
      formData.append("weight", weight);
      formData.append("shippingDetails", JSON.stringify(shippingDetails));

      formData.append("keyFeatures", JSON.stringify(keyFeatures.filter((f) => f.trim() !== "")));
      formData.append("specifications", JSON.stringify(specifications.filter((s) => s.label.trim() !== "")));

      formData.append("hasVariants", hasVariants);
      if (hasVariants) {
        formData.append("variants", JSON.stringify(variants));
        formData.append("defaultColorIndex", 0);
        formData.append("defaultSizeIndex", 0);
      }

      const data = await updateProduct({ productId: params._id, formData }).unwrap();
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success(`DATA_UPDATED_SUCCESSFULLY`);
        refetch();
        navigate("/admin/allproductslist");
      }
    } catch (err) {
      const errorMessage = err?.data?.error || "UPDATE_FAILED";
      toast.error(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("FATAL_ERROR: Permanent Deletion?")) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(params._id).unwrap();
      toast.success("RECORD_DELETED");
      navigate("/admin/allproductslist");
    } catch (err) {
      toast.error("DELETE_FAILED");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reusable Input Style with Trebuchet MS and min 14px font
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass = "text-sm font-bold text-gray-600 tracking-wider uppercase mb-2 block font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 border-l-4 border-black pl-6 py-2">
            <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight">
              Product <span className="text-red-600">/ Edit_Update</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
              Security Level: Admin | ID: {params._id?.substring(0, 10)}...
            </p>
          </header>

          {/* Tab Navigation */}
          <nav className="flex gap-4 mb-6 border-b border-gray-200">
            {["basic", "variants"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveVariantTab(tab)}
                className={`px-6 py-3 font-bold uppercase text-sm tracking-widest transition-all flex items-center gap-2 border-b-2 ${
                  activeVariantTab === tab ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "variants" && <FaPalette className="text-sm" />}
                {tab} {tab === "variants" && hasVariants ? `(${variants.length})` : ""}
              </button>
            ))}
          </nav>

          {isLoading ? (
            <div className="bg-white border border-gray-200 p-6 lg:p-10 rounded-sm">
              <FormSkeleton />
            </div>
          ) : (
            <section className="bg-white border border-gray-200 p-6 lg:p-10 relative overflow-hidden rounded-sm">
              {/* BASIC INFO TAB */}
              {activeVariantTab === "basic" && (
                <div className="space-y-12">
                  {/* Image Gallery */}
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                      Gallery Assets
                    </p>
                    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border border-dashed border-gray-200 min-h-[140px] items-center justify-center rounded-sm">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group border border-gray-200 overflow-hidden w-24 h-24 sm:w-32 sm:h-32 bg-white transition-all duration-300 hover:border-black rounded-sm"
                        >
                          <img src={img} alt="product" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <div className="flex gap-3">
                              <button type="button" onClick={() => moveImage(index, "left")} disabled={index === 0} className="text-white hover:text-red-500 disabled:opacity-30" aria-label="Move left">
                                <FaArrowLeft size={14} />
                              </button>
                              <button type="button" onClick={() => moveImage(index, "right")} disabled={index === images.length - 1} className="text-white hover:text-red-500 disabled:opacity-30" aria-label="Move right">
                                <FaArrowRight size={14} />
                              </button>
                            </div>
                            <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600" aria-label="Delete image">
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <label className="w-24 h-24 sm:w-32 sm:h-32 border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-100 transition-all text-gray-400 hover:text-black group rounded-sm">
                        {uploadLoading ? <LoadingSpinner /> : <FaPlus size={20} className="group-hover:rotate-90 transition-transform" />}
                        <span className="text-sm font-bold uppercase mt-2 tracking-tighter text-center">Upload</span>
                        <input type="file" accept="image/*" multiple onChange={uploadFileHandler} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className={labelClass}>Product Identifier</label>
                      <input type="text" value={name} placeholder="E.g. Mech-Keyboard X1" onChange={(e) => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Base Price (৳)</label>
                      <input type="number" value={price} placeholder="0.00" onChange={(e) => handlePriceChange(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Discount %</label>
                      <input type="number" value={discountPercentage} placeholder="0" onChange={(e) => handleDiscountPercentageChange(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Markdown Amount (৳)</label>
                      <input type="number" value={discountedAmount} placeholder="0" onChange={(e) => handleDiscountedAmountChange(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Total Quantity</label>
                      <input type="number" value={quantity} placeholder="100" onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Initial Stock</label>
                      <input type="number" value={countInStock} placeholder="0" onChange={(e) => setCountInStock(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Brand Mark</label>
                      <input type="text" value={brand} placeholder="Veloura" onChange={(e) => setBrand(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Weight (Kg)</label>
                      <input type="number" value={weight} step="0.1" placeholder="0.5" onChange={(e) => setWeight(e.target.value)} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className={labelClass}>Category / Sub-Category</label>
                      <TreeSelect
                        showSearch
                        style={{ width: "100%" }}
                        value={category || undefined}
                        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                        placeholder="SELECT CATEGORY"
                        allowClear
                        onChange={(newValue) => setCategory(newValue)}
                        treeData={organizedCategories}
                        treeNodeLabelProp="label"
                        className="border border-gray-200 rounded-sm h-[42px] flex items-center text-sm"
                        variant="borderless"
                        filterTreeNode={(input, node) => node.title.toLowerCase().includes(input.toLowerCase())}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Warranty Period</label>
                      <input type="text" value={warranty} placeholder="24 Months" onChange={(e) => setWarranty(e.target.value)} className={inputClass} />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Featured</label>
                      <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-black cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-4 pt-6 bg-gray-50 p-4 rounded-sm border border-gray-200">
                      <div className="flex-1">
                        <label className="text-sm font-bold text-red-600 uppercase tracking-wider block">Enable Variants</label>
                        <p className="text-sm text-gray-500 mt-1">Color & Size combinations</p>
                      </div>
                      <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="w-6 h-6 accent-red-600 cursor-pointer" />
                    </div>
                  </div>

                  {/* Shipping Details Section */}
                  <div className="border-t border-gray-100 pt-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                      <FaTruck className="text-sm" /> Shipping Configuration (Optional)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 border border-gray-200 rounded-sm">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={shippingDetails.isFreeShipping} onChange={(e) => setShippingDetails({ ...shippingDetails, isFreeShipping: e.target.checked })} className="w-5 h-5 accent-black" />
                        <label className="text-sm font-bold text-gray-700">Free Shipping</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={shippingDetails.isIndividualShipping} onChange={(e) => setShippingDetails({ ...shippingDetails, isIndividualShipping: e.target.checked })} className="w-5 h-5 accent-black" />
                        <label className="text-sm font-bold text-gray-700">Individual Shipping</label>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Individual Cost (৳)</label>
                        <input type="number" value={shippingDetails.individualShippingCost} onChange={(e) => setShippingDetails({ ...shippingDetails, individualShippingCost: Number(e.target.value) })} className={inputClass} disabled={!shippingDetails.isIndividualShipping} />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Extra Cost (৳)</label>
                        <input type="number" value={shippingDetails.extraShippingCost} onChange={(e) => setShippingDetails({ ...shippingDetails, extraShippingCost: Number(e.target.value) })} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="border-t border-gray-100 pt-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Key Features</p>
                    {keyFeatures.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <input type="text" value={feature} placeholder="e.g. Ultra Responsive Switches" onChange={(e) => handleFeatureChange(index, e.target.value)} className={`${inputClass} flex-1`} />
                        <button type="button" onClick={() => removeFeature(index)} className="text-gray-400 hover:text-red-500 transition-colors px-3" aria-label="Remove feature">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addFeature} className="text-sm font-bold uppercase bg-black text-white px-5 py-2.5 mt-2 hover:bg-gray-800 transition-colors rounded-sm">
                      + Add Feature
                    </button>
                  </div>

                  {/* Specifications */}
                  <div className="border-t border-gray-100 pt-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Specifications</p>
                    {specifications.map((spec, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <input type="text" placeholder="Label (e.g. Battery)" value={spec.label} onChange={(e) => handleSpecChange(index, "label", e.target.value)} className={inputClass} />
                        <div className="flex gap-2">
                          <input type="text" placeholder="Value (e.g. 4000mAh)" value={spec.value} onChange={(e) => handleSpecChange(index, "value", e.target.value)} className={`${inputClass} flex-1`} />
                          <button type="button" onClick={() => removeSpec(index)} className="text-gray-400 hover:text-red-500 transition-colors px-3" aria-label="Remove spec">
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addSpec} className="text-sm font-bold uppercase bg-black text-white px-5 py-2.5 mt-2 hover:bg-gray-800 transition-colors rounded-sm">
                      + Add Spec
                    </button>
                  </div>

                  {/* Description Editor */}
                  <div className="border-t border-gray-100 pt-8">
                    <label className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-4 block">Description Data</label>
                    <DescriptionEditor
                      quillRef={quillRef}
                      value={description}
                      onChange={setDescription}
                      modules={modules}
                      formats={formats}
                    />
                  </div>
                </div>
              )}

              {/* VARIANTS TAB */}
              {activeVariantTab === "variants" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-xl font-['Playfair_Display'] font-bold text-black tracking-tight uppercase">
                        Product Variants
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Configure color and size combinations
                      </p>
                    </div>
                    <button type="button" onClick={addColorVariant} className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold uppercase text-sm tracking-widest hover:bg-red-600 transition-all rounded-sm">
                      <FaPlus /> Add Color
                    </button>
                  </div>

                  {variants.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-sm">
                      <FaPalette className="mx-auto text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-sm">No variants added yet.</p>
                    </div>
                  )}

                  {variants.map((variant, colorIndex) => (
                    <div key={colorIndex} className="bg-gray-50 p-6 border border-gray-200 rounded-sm">
                      <div className="flex flex-col md:flex-row items-start gap-4 mb-6 pb-6 border-b border-gray-200">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                          <div>
                            <label className={labelClass}>Color Name</label>
                            <input type="text" value={variant.color.name} onChange={(e) => updateColorInfo(colorIndex, "name", e.target.value)} placeholder="e.g. Red" className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Hex Code</label>
                            <div className="flex gap-2">
                              <input type="color" value={variant.color.hexCode} onChange={(e) => updateColorInfo(colorIndex, "hexCode", e.target.value)} className="w-12 h-[42px] rounded-sm border border-gray-200 cursor-pointer p-1" />
                              <input type="text" value={variant.color.hexCode} onChange={(e) => updateColorInfo(colorIndex, "hexCode", e.target.value)} className={`${inputClass} flex-1 uppercase`} />
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>Color Image</label>
                            <div className="flex gap-2 items-center">
                              {variant.color.image ? (
                                <div className="relative w-12 h-12 group">
                                  <img src={variant.color.image} alt="Color" className="w-full h-full object-cover rounded-sm border border-gray-200" />
                                  <button type="button" onClick={() => updateColorInfo(colorIndex, "image", "")} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaTrash size={8} />
                                  </button>
                                </div>
                              ) : (
                                <label className="w-12 h-12 border border-dashed border-gray-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-black hover:bg-gray-100 transition-all text-gray-400 hover:text-black">
                                  <FaPlus size={14} />
                                  <input type="file" accept="image/*" onChange={(e) => uploadColorImage(e, colorIndex)} className="hidden" />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeColorVariant(colorIndex)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete variant">
                          <FaTrash size={16} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                            <FaRuler className="text-sm" /> Sizes for {variant.color.name || `Color ${colorIndex + 1}`}
                          </h4>
                          <button type="button" onClick={() => addSizeToVariant(colorIndex)} className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-1 hover:text-red-600 transition-colors">
                            <FaPlus size={10} /> Add Size
                          </button>
                        </div>

                        {variant.sizes.map((size, sizeIndex) => (
                          <div key={sizeIndex} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 bg-white p-4 border border-gray-200 rounded-sm">
                            <div>
                              <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Size</label>
                              <input type="text" value={size.size} onChange={(e) => updateSizeInfo(colorIndex, sizeIndex, "size", e.target.value)} placeholder="S, M, L" className={`${inputClass} py-2`} />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Price (৳)</label>
                              <input type="number" value={size.price} onChange={(e) => updateSizeInfo(colorIndex, sizeIndex, "price", Number(e.target.value))} placeholder="0" className={`${inputClass} py-2`} />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Stock</label>
                              <input type="number" value={size.countInStock} onChange={(e) => updateSizeInfo(colorIndex, sizeIndex, "countInStock", Number(e.target.value))} placeholder="0" className={`${inputClass} py-2`} />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-gray-500 uppercase block mb-1">SKU</label>
                              <input type="text" value={size.sku} onChange={(e) => updateSizeInfo(colorIndex, sizeIndex, "sku", e.target.value)} placeholder="SKU-001" className={`${inputClass} py-2`} />
                            </div>
                            <div className="flex items-end justify-center">
                              <button type="button" onClick={() => removeSizeFromVariant(colorIndex, sizeIndex)} className="p-2.5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete size">
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 pt-8 mt-8">
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-8 py-3 bg-white border border-black text-black font-bold uppercase tracking-widest text-sm hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 rounded-sm"
                >
                  {deleteLoading ? <LoadingSpinner /> : <FaTrash size={14} />}
                  {deleteLoading ? "Purging..." : "Delete_Record"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={updateLoading}
                  className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 rounded-sm"
                >
                  {updateLoading ? <LoadingSpinner /> : <FaSave size={14} />}
                  {updateLoading ? "Syncing..." : "Push_Updates"}
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductUpdate;
