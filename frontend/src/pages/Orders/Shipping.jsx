/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import PlaceOrder from "./PlaceOrder";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import {
  FaMoneyBillWave,
  FaMoneyBillWaveAlt,
  FaUniversity,
  FaSpinner,
  FaCreditCard,
  FaHome,
} from "react-icons/fa";

import bd from "@bd-geo-data/bd-location-data";
import { useCalculateShippingMutation } from "@redux/api/shippingApiSlice";
// ✅ Auth Settings এর জন্য ইম্পোর্ট করা হয়েছে
import { useGetSiteSettingsQuery } from "@redux/api/siteSettingApiSlice";
import { HiChevronRight } from "react-icons/hi";
import { FaLock } from "react-icons/fa6";

/* ─── helpers ─────────────────────────────────────────────── */
const getItemFinalPrice = (item) =>
  Number(item._finalPrice) ||
  Number(item._effectivePrice) ||
  Number(item.finalPrice) ||
  Number(item.price) ||
  0;

const getItemBasePrice = (item) =>
  Number(item.basePrice) || Number(item.price) || 0;

/* ─── Static Data outside component to prevent re-creation ─── */
const inputBase =
  "w-full py-2.5 px-4 sm:py-3 bg-white border font-mono text-xs sm:text-sm text-black placeholder-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-md appearance-none";

const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`;

const paymentMethods = [
  {
    id: "Cash on Delivery",
    label: "Cash on Delivery",
    sub: "Pay when received",
    icon: <FaMoneyBillWave />,
  },
  {
    id: "SSLCommerz",
    label: "Credit/Debit Card",
    sub: "Visa, Master, Amex",
    icon: <FaCreditCard />,
  },
  { id: "bKash", label: "bKash", sub: "Pay now", icon: <FaMoneyBillWaveAlt /> },
  { id: "Nagad", label: "Nagad", sub: "Pay now", icon: <FaMoneyBillWaveAlt /> },
  {
    id: "Rocket",
    label: "Rocket",
    sub: "Pay now",
    icon: <FaMoneyBillWaveAlt />,
  },
  {
    id: "Bank",
    label: "Bank Transfer",
    sub: "Pay now",
    icon: <FaUniversity />,
  },
];

/* ─── Field (Accessibility Improved) ───────────────────────── */
const Field = ({ label, error, touched, htmlFor, children }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="block text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-gray-500 mb-1.5"
    >
      {label}
    </label>
    {children}
    {error && touched && (
      <p className="mt-1 text-[10px] sm:text-xs font-mono text-red-500 uppercase tracking-wide">
        ⚠ {error}
      </p>
    )}
  </div>
);

const inputStyle = (fieldName, errors, touched) =>
  `${inputBase} ${errors[fieldName] && touched[fieldName] ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-300 hover:border-gray-400"}`;

/* ─── Shipping ─────────────────────────────────────────────── */
const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ ডাইনামিক Auth Settings ফেচ করা হচ্ছে
  const { data: siteData } = useGetSiteSettingsQuery();
  const authSettings = siteData?.data?.authSettings;
  const allowGuestCheckout = authSettings?.allowGuestCheckout ?? true;
  const requireLoginForCheckout =
    authSettings?.requireLoginForCheckout ?? false;

  const isGuestCheckoutAllowed =
    !userInfo && allowGuestCheckout && !requireLoginForCheckout;
  const mustLogin =
    !userInfo && (!allowGuestCheckout || requireLoginForCheckout);

  const [calculateShipping, { isLoading: isCalculating }] =
    useCalculateShippingMutation();
  const shippingDebounceRef = useRef(null);

  const getSaved = useCallback(() => {
    try {
      const s = localStorage.getItem("shippingAddress");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }, []);

  const init = shippingAddress || getSaved() || {};

  const [name, setName] = useState(init.name || "");
  const [email, setEmail] = useState(init.email || ""); // ✅ গেস্ট ইউজারের জন্য ইমেইল
  const [address, setAddress] = useState(init.address || "");
  const [division, setDivision] = useState(init.division || "");
  const [district, setDistrict] = useState(init.district || "");
  const [thana, setThana] = useState(init.thana || "");
  const [phoneNumber, setPhoneNumber] = useState(init.phoneNumber || "");
  const [paymentMethod, setPaymentMethod] = useState(
    init.paymentMethod || "Cash on Delivery",
  );

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shippingCharge: 0,
    totalPrice: 0,
    totalSavings: 0,
    shippingMethodName: "",
    estimatedDays: "",
    isFreeShipping: false,
  });

  const divisionsEn = useMemo(() => bd.allDivisions("en"), []);
  const divisionsBn = useMemo(() => bd.allDivisions("bn"), []);
  const [districtsList, setDistrictsList] = useState([]);
  const [thanasList, setThanasList] = useState([]);

  useEffect(() => {
    if (division) {
      const dEn = bd.districtsOf(division, "en");
      const dBn = bd.districtsOf(division, "bn");
      setDistrictsList(dEn.map((en, i) => ({ en, bn: dBn[i] })));
      setDistrict("");
      setThana("");
      setThanasList([]);
    } else {
      setDistrictsList([]);
      setDistrict("");
      setThana("");
      setThanasList([]);
    }
  }, [division]);

  useEffect(() => {
    if (district) {
      const tEn = bd.thanasOf(district, "en");
      const tBn = bd.thanasOf(district, "bn");
      setThanasList(tEn.map((en, i) => ({ en, bn: tBn[i] })));
      setThana("");
    } else {
      setThanasList([]);
      setThana("");
    }
  }, [district]);

  const validateField = useCallback((field, value) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Min 3 characters";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Letters and spaces only";
        return "";
      case "email": // ✅ ইমেইল ভ্যালিডেশন
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Enter a valid email";
        return "";
      case "phoneNumber":
        if (!value.trim()) return "Phone number is required";
        if (!/^01[3-9]\d{8}$/.test(value))
          return "Valid Bangladeshi number required (01XXXXXXXXX)";
        return "";
      case "address":
        if (!value.trim()) return "Full address is required";
        if (value.trim().length < 10) return "Min 10 characters";
        return "";
      case "division":
        if (!value) return "Please select a division";
        return "";
      case "district":
        if (!value) return "Please select a district";
        return "";
      case "thana":
        if (!value) return "Please select a thana";
        return "";
      case "paymentMethod":
        if (!value) return "Select a payment method";
        return "";
      default:
        return "";
    }
  }, []);

  const handleChange = useCallback(
    (field, raw) => {
      let value = raw;
      if (field === "phoneNumber") value = raw.replace(/\D/g, "").slice(0, 11);

      const setters = {
        name: setName,
        email: setEmail,
        address: setAddress,
        division: setDivision,
        district: setDistrict,
        thana: setThana,
        phoneNumber: setPhoneNumber,
      };

      if (setters[field]) setters[field](value);

      setTouched((prevTouched) => {
        if (prevTouched[field]) {
          const error = validateField(field, value);
          setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
        }
        return prevTouched;
      });
    },
    [validateField],
  );

  const handlePaymentChange = useCallback(
    (id) => {
      setPaymentMethod(id);
      dispatch(savePaymentMethod(id));

      setTouched((prevTouched) => {
        if (prevTouched.paymentMethod) {
          const error = validateField("paymentMethod", id);
          setErrors((prevErrors) => ({ ...prevErrors, paymentMethod: error }));
        }
        return prevTouched;
      });

      const pending = localStorage.getItem("pendingOrderData");
      if (pending) {
        try {
          localStorage.setItem(
            "pendingOrderData",
            JSON.stringify({ ...JSON.parse(pending), paymentMethod: id }),
          );
        } catch (err) {
          console.error("Error updating pending order data:", err);
        }
      }
    },
    [dispatch, validateField],
  );

  const handleBlur = useCallback(
    (field, value) => {
      setTouched((p) => ({ ...p, [field]: true }));
      setErrors((p) => ({ ...p, [field]: validateField(field, value) }));
    },
    [validateField],
  );

  const validateAll = useCallback(() => {
    const fields = {
      name,
      phoneNumber,
      address,
      division,
      district,
      thana,
      paymentMethod,
    };
    if (isGuestCheckoutAllowed) fields.email = email;

    const newErrors = {};
    Object.keys(fields).forEach((f) => {
      const e = validateField(f, fields[f]);
      if (e) newErrors[f] = e;
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(Object.keys(fields).map((f) => [f, true])));
    return Object.keys(newErrors).length === 0;
  }, [
    name,
    email,
    phoneNumber,
    address,
    division,
    district,
    thana,
    paymentMethod,
    validateField,
    isGuestCheckoutAllowed,
  ]);

  useEffect(() => {
    if (name || phoneNumber || address || division || email) {
      localStorage.setItem(
        "shippingAddress",
        JSON.stringify({
          name,
          email,
          address,
          division,
          district,
          thana,
          phoneNumber,
          paymentMethod,
        }),
      );
    }
  }, [
    name,
    email,
    address,
    division,
    district,
    thana,
    phoneNumber,
    paymentMethod,
  ]);

  useEffect(() => {
    const saved = getSaved();
    if (saved && !shippingAddress?.name) {
      dispatch(saveShippingAddress(saved));
      dispatch(savePaymentMethod(saved.paymentMethod || "Cash on Delivery"));
    }
  }, [dispatch, getSaved, shippingAddress?.name]);

  useEffect(() => {
    const subtotal = cartItems.reduce(
      (a, item) => a + getItemFinalPrice(item) * (Number(item.qty) || 1),
      0,
    );
    const savings = cartItems.reduce(
      (a, item) =>
        a +
        (getItemBasePrice(item) - getItemFinalPrice(item)) *
          (Number(item.qty) || 1),
      0,
    );

    if (thana && district && division && cartItems.length > 0) {
      if (shippingDebounceRef.current) {
        clearTimeout(shippingDebounceRef.current);
      }
      shippingDebounceRef.current = setTimeout(async () => {
        try {
          const orderItemsData = cartItems.map((item) => ({
            product: item._id || item.product,
            category: item.category,
            qty: Number(item.qty) || 1,
            weight: Number(item.weight) || 0,
          }));
          const res = await calculateShipping({
            thana: thana.trim(),
            district: district.trim(),
            division: division.trim(),
            orderItems: orderItemsData,
            subtotal,
          }).unwrap();
          setOrderSummary({
            subtotal,
            shippingCharge: res.shippingCost,
            totalPrice: subtotal + res.shippingCost,
            totalSavings: savings,
            shippingMethodName: res.zoneName || "Standard Delivery",
            estimatedDays: res.estimatedDays || "3-5 Days",
            isFreeShipping: res.isFreeShipping || false,
          });
        } catch (err) {
          console.error("Shipping Calculation API Error:", err);
          toast.error(
            err?.data?.error || "Could not calculate shipping. Using default.",
          );
          setOrderSummary({
            subtotal,
            shippingCharge: 150,
            totalPrice: subtotal + 150,
            totalSavings: savings,
            shippingMethodName: "Standard Delivery",
            estimatedDays: "3-5 Days",
            isFreeShipping: false,
          });
        }
      }, 400);
    } else {
      setOrderSummary({
        subtotal,
        shippingCharge: 0,
        totalPrice: subtotal,
        totalSavings: savings,
        shippingMethodName: "",
        estimatedDays: "",
        isFreeShipping: false,
      });
    }

    return () => {
      if (shippingDebounceRef.current) {
        clearTimeout(shippingDebounceRef.current);
      }
    };
  }, [division, district, thana, cartItems, calculateShipping]);

  const handleShippingDetails = useCallback(() => {
    if (mustLogin) {
      toast.error("Please sign in to continue checkout");
      navigate("/login?redirect=/shipping");
      return null;
    }

    if (!validateAll()) {
      toast.error("Please fill all required fields correctly!");
      return null;
    }
    const data = {
      name,
      email: userInfo ? userInfo.email : email,
      address,
      division: division.trim(),
      district: district.trim(),
      thana: thana.trim(),
      city: thana.trim(),
      phoneNumber,
      shippingCharge: orderSummary.shippingCharge,
      paymentMethod,
    };
    dispatch(saveShippingAddress(data));
    dispatch(savePaymentMethod(paymentMethod));
    localStorage.setItem("shippingAddress", JSON.stringify(data));
    return data;
  }, [
    mustLogin,
    userInfo,
    navigate,
    validateAll,
    name,
    email,
    address,
    division,
    district,
    thana,
    phoneNumber,
    orderSummary.shippingCharge,
    paymentMethod,
    dispatch,
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Checkout | Veloura</title>
        <meta
          name="description"
          content="Complete your secure checkout at AriX Co. Enter your delivery details and choose a payment method."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4">
          {mustLogin && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-[#007EFC] mt-0.5 flex-shrink-0">
                <FaLock size={16} />
              </span>
              <div className="flex-1">
                <p className="text-[13px] sm:text-sm text-gray-700 font-medium">
                  You need to sign in before placing your order.
                </p>
                <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">
                  Don&apos;t worry —{" "}
                  <span className="font-semibold text-gray-700">
                    your cart items are safe
                  </span>{" "}
                  and won&apos;t be lost. You can fill in your delivery details
                  now.
                </p>
              </div>
              <Link
                to="/login?redirect=/shipping"
                className="flex-shrink-0 bg-[#007EFC] text-white text-[12px] sm:text-[13px] font-bold px-4 py-2 rounded-lg hover:bg-[#006ee0] transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
            </div>
          )}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[14px] font-playfair font-medium flex-wrap py-4 bg-white"
          >
            <Link
              to="/"
              className="flex items-center gap-1.5 text-black hover:underline text-[14px] font-medium"
            >
              <FaHome className="text-[14px]" />
              <span>Home</span>
            </Link>
            <span className="contents">
              <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
              <Link
                to="/cart"
                className="text-black hover:underline text-[14px] font-medium"
              >
                Cart
              </Link>
            </span>
            <span className="contents">
              <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
              <span className="text-black font-black text-[14px]">
                Checkout
              </span>
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto py-6 sm:py-10 px-4">
        <div className="mb-6 sm:mb-10 border-b-2 border-black pb-4">
          <p className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.3em] text-gray-400 mb-1">
            Step 1 of 2
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-black uppercase tracking-tight">
            Checkout
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div className="w-full lg:w-7/12 space-y-6">
            <section className="bg-white p-4 sm:p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-white bg-black rounded-full">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-mono font-black text-black uppercase tracking-tight">
                  Delivery Details
                </h2>
              </div>
              <div className="space-y-4">
                <Field
                  label="Full Name"
                  error={errors.name}
                  touched={touched.name}
                  htmlFor="fullName"
                >
                  <input
                    id="fullName"
                    type="text"
                    className={inputStyle("name", errors, touched)}
                    value={name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={(e) => handleBlur("name", e.target.value)}
                    placeholder="Receiver's full name"
                  />
                </Field>

                {isGuestCheckoutAllowed && (
                  <Field
                    label="Email Address (For Order Updates)"
                    error={errors.email}
                    touched={touched.email}
                    htmlFor="email"
                  >
                    <input
                      id="email"
                      type="email"
                      className={inputStyle("email", errors, touched)}
                      value={email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={(e) => handleBlur("email", e.target.value)}
                      placeholder="guest@example.com"
                    />
                  </Field>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Phone Number"
                    error={errors.phoneNumber}
                    touched={touched.phoneNumber}
                    htmlFor="phoneNumber"
                  >
                    <input
                      id="phoneNumber"
                      type="tel"
                      className={inputStyle("phoneNumber", errors, touched)}
                      value={phoneNumber}
                      onChange={(e) =>
                        handleChange("phoneNumber", e.target.value)
                      }
                      onBlur={(e) => handleBlur("phoneNumber", e.target.value)}
                      placeholder="01XXX-XXXXXX"
                    />
                  </Field>
                  <Field
                    label="Division"
                    error={errors.division}
                    touched={touched.division}
                    htmlFor="division"
                  >
                    <select
                      id="division"
                      value={division}
                      onChange={(e) => handleChange("division", e.target.value)}
                      onBlur={(e) => handleBlur("division", e.target.value)}
                      className={inputStyle("division", errors, touched)}
                      style={{
                        backgroundImage: `url("${selectArrow}")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                      }}
                    >
                      <option value="">Select division</option>
                      {divisionsEn.map((div, i) => (
                        <option key={div} value={div}>
                          {divisionsBn[i]} ({div})
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="District"
                    error={errors.district}
                    touched={touched.district}
                    htmlFor="district"
                  >
                    <select
                      id="district"
                      value={district}
                      onChange={(e) => handleChange("district", e.target.value)}
                      onBlur={(e) => handleBlur("district", e.target.value)}
                      className={inputStyle("district", errors, touched)}
                      disabled={!division}
                      style={{
                        backgroundImage: `url("${selectArrow}")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                      }}
                    >
                      <option value="">Select district</option>
                      {districtsList.map((dist) => (
                        <option key={dist.en} value={dist.en}>
                          {dist.bn} ({dist.en})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Thana / Upazila"
                    error={errors.thana}
                    touched={touched.thana}
                    htmlFor="thana"
                  >
                    <div className="relative">
                      <select
                        id="thana"
                        value={thana}
                        onChange={(e) => handleChange("thana", e.target.value)}
                        onBlur={(e) => handleBlur("thana", e.target.value)}
                        className={`${inputStyle("thana", errors, touched)} pr-8`}
                        disabled={!district}
                        style={{
                          backgroundImage: `url("${selectArrow}")`,
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        <option value="">Select thana</option>
                        {thanasList.map((t) => (
                          <option key={t.en} value={t.en}>
                            {t.bn} ({t.en})
                          </option>
                        ))}
                      </select>
                      {isCalculating && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                          <FaSpinner className="animate-spin text-gray-400 text-xs" />
                        </div>
                      )}
                    </div>
                    {thana && district && division && (
                      <p className="mt-1 text-[10px] sm:text-xs font-mono uppercase tracking-wide text-gray-500 flex items-center gap-1">
                        {isCalculating
                          ? "⟳ Calculating shipping..."
                          : `✓ Shipping: ৳${orderSummary.shippingCharge}`}
                      </p>
                    )}
                  </Field>
                </div>
                <Field
                  label="Full Address"
                  error={errors.address}
                  touched={touched.address}
                  htmlFor="address"
                >
                  <input
                    id="address"
                    type="text"
                    className={inputStyle("address", errors, touched)}
                    value={address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    onBlur={(e) => handleBlur("address", e.target.value)}
                    placeholder="House / Road / Area"
                  />
                </Field>
              </div>
            </section>

            <section className="bg-white p-4 sm:p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-white bg-black rounded-full">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-mono font-black text-black uppercase tracking-tight">
                  Payment Method
                </h2>
              </div>

              {errors.paymentMethod && touched.paymentMethod && (
                <p className="mb-3 text-[10px] sm:text-xs font-mono text-red-500 uppercase tracking-wide bg-red-50 p-2 rounded-md border border-red-100">
                  ⚠ {errors.paymentMethod}
                </p>
              )}

              <div className="flex flex-col gap-3">
                {paymentMethods.map((m) => {
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handlePaymentChange(m.id)}
                      className="w-full flex items-center gap-3 text-left"
                    >
                      <div
                        className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          active ? "border-black" : "border-gray-300"
                        }`}
                      >
                        {active && (
                          <div className="w-2 h-2 bg-black rounded-full" />
                        )}
                      </div>
                      <span
                        className={`text-[14px] font-trebuchet font-black uppercase tracking-tight ${
                          active ? "text-black" : "text-gray-600"
                        }`}
                      >
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-3">
                <div className="w-1 h-8 bg-black flex-shrink-0 rounded-full"></div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 mb-0.5">
                    Selected
                  </p>
                  <p className="text-xs sm:text-sm font-mono font-black text-black uppercase">
                    {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-mono text-gray-500 mt-0.5">
                    {paymentMethod === "Cash on Delivery"
                      ? `Pay ৳${orderSummary.totalPrice.toFixed(2)} on delivery`
                      : paymentMethod === "SSLCommerz"
                        ? "Secure payment via SSLCommerz gateway"
                        : "You will be redirected to payment instructions"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="w-full lg:w-5/12">
            <div className="sticky top-[70px] sm:top-[90px]">
              <PlaceOrder
                orderSummary={orderSummary}
                onPlaceOrder={handleShippingDetails}
                isShippingCalculating={isCalculating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
