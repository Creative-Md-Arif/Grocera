import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import { BASE_URL } from "../../redux/constants";
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@redux/api/siteSettingApiSlice";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaLinkedin,
  FaSave,
  FaCog,
  FaImage,
  FaUpload,
  FaFont,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa";

// --- Skeleton Loader ---
const FormSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-sm p-6 space-y-4 animate-pulse"
      >
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

const SiteSettingManage = () => {
  const { data, isLoading } = useGetSiteSettingsQuery();
  const [updateSiteSettings, { isLoading: isSaving }] =
    useUpdateSiteSettingsMutation();

  // States
  const [contact, setContact] = useState({ email: "", phone: "", address: "" });
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    linkedin: "",
  });
  const [copyrightText, setCopyrightText] = useState("");

  // Logo States
  const [logoType, setLogoType] = useState("image");
  const [logo, setLogo] = useState({ url: "", public_id: "" });
  const [textLogo, setTextLogo] = useState({
    fontSize: "32px",
    fontWeight: "bold",
    parts: [{ text: "Grocera ", color: "#000000" }],
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setContact(data.data.contact || { email: "", phone: "", address: "" });
      setSocialLinks(
        data.data.socialLinks || {
          facebook: "",
          instagram: "",
          youtube: "",
          twitter: "",
          linkedin: "",
        },
      );
      setCopyrightText(data.data.copyrightText || "");

      // Logo Data Prefill
      setLogoType(data.data.logoType || "image");
      setLogo(data.data.logo || { url: "", public_id: "" });
      setTextLogo(
        data.data.textLogo || {
          fontSize: "32px",
          fontWeight: "bold",
          parts: [{ text: "Grocera ", color: "#000000" }],
        },
      );
    }
  }, [data]);

  // Image Logo Upload Handler
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/upload/logo`, {
        method: "POST",
        credentials: "include",
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Upload failed");
      }

      setLogo({ url: result.url, public_id: result.public_id });
      toast.success("Logo uploaded — click Save Changes to apply");
    } catch (error) {
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  };

  // Text Logo Handlers
  const handleTextPartChange = (index, field, value) => {
    const newParts = [...textLogo.parts];
    newParts[index][field] = value;
    setTextLogo({ ...textLogo, parts: newParts });
  };

  const addTextPart = () => {
    setTextLogo({
      ...textLogo,
      parts: [...textLogo.parts, { text: "", color: "#000000" }],
    });
  };

  const removeTextPart = (index) => {
    if (textLogo.parts.length === 1) return;
    const newParts = textLogo.parts.filter((_, i) => i !== index);
    setTextLogo({ ...textLogo, parts: newParts });
  };

  // Save Handler (Auth Settings বাদ দেওয়া হয়েছে)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSiteSettings({
        contact,
        socialLinks,
        copyrightText,
        logo,
        logoType,
        textLogo,
      }).unwrap();
      toast.success("Site settings updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update settings");
    }
  };

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-sm px-4 py-2.5 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all font-['Trebuchet_MS']";
  const labelClass =
    "flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 mb-2";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                Contact Info, Social Links & Footer
              </h2>
            </div>
          </header>

          {isLoading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSave}>
              {/* Logo Section (Image / Text) */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-sm p-6 mb-6"
              >
                <h2 className="text-base font-black uppercase tracking-widest text-black mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <FaImage size={14} className="text-gray-400" /> Site Logo
                </h2>

                {/* Logo Type Toggle */}
                <div className="flex gap-4 mb-6 border-b border-gray-100 pb-4">
                  <label
                    className={`flex items-center gap-2 px-4 py-2 border rounded-sm cursor-pointer transition-all ${logoType === "image" ? "border-black bg-black text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
                  >
                    <input
                      type="radio"
                      name="logoType"
                      value="image"
                      checked={logoType === "image"}
                      onChange={() => setLogoType("image")}
                      className="hidden"
                    />
                    <FaImage size={12} /> Image Logo
                  </label>
                  <label
                    className={`flex items-center gap-2 px-4 py-2 border rounded-sm cursor-pointer transition-all ${logoType === "text" ? "border-black bg-black text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
                  >
                    <input
                      type="radio"
                      name="logoType"
                      value="text"
                      checked={logoType === "text"}
                      onChange={() => setLogoType("text")}
                      className="hidden"
                    />
                    <FaFont size={12} /> Text Logo
                  </label>
                </div>

                {/* Conditional Logo Content */}
                {logoType === "image" ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="w-32 h-32 shrink-0 border border-gray-200 rounded-sm bg-gray-50 flex items-center justify-center overflow-hidden">
                      {logo.url ? (
                        <img
                          src={logo.url}
                          alt="Site logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaImage className="text-3xl text-gray-300" />
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="logo-upload"
                        className={`inline-flex items-center gap-2 py-2.5 px-5 border text-sm font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer ${
                          isUploadingLogo
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-black text-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {isUploadingLogo ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaUpload size={12} />
                        )}
                        {isUploadingLogo ? "Uploading..." : "Upload Image"}
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-400 mt-2">
                        PNG, JPG, WEBP or SVG — max 2MB.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Font Size & Weight */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Font Size</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={textLogo.fontSize}
                          onChange={(e) =>
                            setTextLogo({
                              ...textLogo,
                              fontSize: e.target.value,
                            })
                          }
                          placeholder="32px"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Font Weight</label>
                        <select
                          className={inputClass}
                          value={textLogo.fontWeight}
                          onChange={(e) =>
                            setTextLogo({
                              ...textLogo,
                              fontWeight: e.target.value,
                            })
                          }
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="bolder">Bolder</option>
                          <option value="lighter">Lighter</option>
                          <option value="300">300</option>
                          <option value="500">500</option>
                          <option value="700">700</option>
                          <option value="900">900</option>
                        </select>
                      </div>
                    </div>

                    {/* Text Parts (Multiple Colors) */}
                    <div>
                      <label className={labelClass}>Text Parts & Colors</label>
                      <div className="space-y-3 border border-gray-100 p-4 rounded-sm bg-gray-50">
                        {textLogo.parts.map((part, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="text"
                              className={`${inputClass} flex-1`}
                              placeholder={`Part ${index + 1} (e.g. Grocera)`}
                              value={part.text}
                              onChange={(e) =>
                                handleTextPartChange(
                                  index,
                                  "text",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="flex items-center gap-2 border border-gray-200 rounded-sm p-1 bg-white">
                              <input
                                type="color"
                                value={part.color}
                                onChange={(e) =>
                                  handleTextPartChange(
                                    index,
                                    "color",
                                    e.target.value,
                                  )
                                }
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                              />
                              <span className="text-xs text-gray-500 uppercase pr-2">
                                {part.color}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTextPart(index)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-sm transition-colors"
                              disabled={textLogo.parts.length === 1}
                            >
                              <FaTrashAlt size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addTextPart}
                          className="mt-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black border border-black px-3 py-2 rounded-sm hover:bg-black hover:text-white transition-all"
                        >
                          <FaPlus size={10} /> Add Part
                        </button>
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="mt-4 p-4 border border-dashed border-gray-200 rounded-sm bg-white">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                        Preview:
                      </p>
                      <div
                        style={{
                          fontSize: textLogo.fontSize,
                          fontWeight: textLogo.fontWeight,
                        }}
                      >
                        {textLogo.parts.map((part, index) => (
                          <span key={index} style={{ color: part.color }}>
                            {part.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Contact Info */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-sm p-6"
                >
                  <h2 className="text-base font-black uppercase tracking-widest text-black mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                    <FaCog size={14} className="text-gray-400" /> Contact Info
                  </h2>

                  <div className="mb-4">
                    <label className={labelClass}>
                      <FaEnvelope size={12} /> Email
                    </label>
                    <input
                      type="email"
                      className={inputClass}
                      value={contact.email}
                      onChange={(e) =>
                        setContact({ ...contact, email: e.target.value })
                      }
                      placeholder="support@Grocera.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelClass}>
                      <FaPhone size={12} /> Phone
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={contact.phone}
                      onChange={(e) =>
                        setContact({ ...contact, phone: e.target.value })
                      }
                      placeholder="+880 17100000000"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <FaMapMarkerAlt size={12} /> Address
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={contact.address}
                      onChange={(e) =>
                        setContact({ ...contact, address: e.target.value })
                      }
                      placeholder="Dhaka, Bangladesh"
                    />
                  </div>
                </motion.section>

                {/* Social Links */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white border border-gray-200 rounded-sm p-6"
                >
                  <h2 className="text-base font-black uppercase tracking-widest text-black mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                    <FaFacebook size={14} className="text-gray-400" /> Follow Us
                  </h2>

                  {[
                    {
                      key: "facebook",
                      icon: FaFacebook,
                      ph: "https://facebook.com/...",
                    },
                    {
                      key: "instagram",
                      icon: FaInstagram,
                      ph: "https://instagram.com/...",
                    },
                    {
                      key: "youtube",
                      icon: FaYoutube,
                      ph: "https://youtube.com/...",
                    },
                    {
                      key: "twitter",
                      icon: FaTwitter,
                      ph: "https://twitter.com/...",
                    },
                    {
                      key: "linkedin",
                      icon: FaLinkedin,
                      ph: "https://linkedin.com/...",
                    },
                  ].map(({ key, icon: Icon, ph }) => (
                    <div className="mb-4 last:mb-0" key={key}>
                      <label className={labelClass}>
                        <Icon size={12} /> {key}
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        value={socialLinks[key]}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={ph}
                      />
                    </div>
                  ))}
                </motion.section>
              </div>

              {/* Copyright */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-sm p-6 mb-6"
              >
                <label className={labelClass}>Copyright Text</label>
                <input
                  type="text"
                  className={inputClass}
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  placeholder="Grocera — All rights reserved."
                />
              </motion.section>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaSave size={12} />
                )}
                Save Changes
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default SiteSettingManage;
