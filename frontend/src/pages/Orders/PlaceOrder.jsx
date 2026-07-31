/* eslint-disable react/display-name */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useCreateOrderMutation } from "@redux/api/orderApiSlice";
import { useValidateCupponMutation } from "@redux/api/cupponApiSlice";
import { useInitSSLCommerzMutation } from "@redux/api/paymentApiSlice";
import {
  clearCartItems,
  updateCartQty,
} from "../../redux/features/cart/cartSlice";
import { useState, memo, useCallback } from "react";
import { toast } from "react-toastify";
import { FaMinus, FaPlus, FaXmark, FaSpinner } from "react-icons/fa6";

/* ─── helpers ─────────────────────────────────────────────── */
const getItemFinalPrice = (item) =>
  Number(item._finalPrice) ||
  Number(item._effectivePrice) ||
  Number(item.finalPrice) ||
  Number(item.price) ||
  0;

const getItemBasePrice = (item) =>
  Number(item.basePrice) ||
  Number(item.variantInfo?.variantPrice) ||
  Number(item.price) ||
  0;

/* ─── Custom Loader ─────────────────────────────────────── */
const ButtonSpinner = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    <span>Processing...</span>
  </div>
);

/* ─── Inline cart items ────────────────────────────────────── */
const InlineItems = memo(() => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const updateQtyHandler = useCallback(
    (item, newQty) => {
      const stock = item.variantInfo?.hasVariants
        ? item.variantInfo.countInStock
        : item.countInStock;

      if (stock !== undefined && newQty > stock) {
        toast.error(`Only ${stock} units available!`);
        return;
      }

      dispatch(
        updateCartQty({
          _id: item._id,
          variantInfo: item.variantInfo || null,
          qty: newQty,
        }),
      );
    },
    [dispatch],
  );

  return (
    <div>
      <div
        className="space-y-0 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {cartItems.map((item, idx) => {
          const displayImage =
            Array.isArray(item?.images) && item.images.length > 0
              ? item.images[0]
              : item?.image || "/placeholder.jpg";
          const unitPrice = getItemFinalPrice(item);
          const basePrice = getItemBasePrice(item);
          const savingsPerUnit = basePrice - unitPrice;
          const discountPercent = item.discountPercentage || 0;
          const variantText = item.variantInfo?.hasVariants
            ? `${item.variantInfo.colorName} · ${item.variantInfo.sizeName}`
            : null;

          let badgeElement = null;
          const hasCampaign =
            item.appliedCampaigns && item.appliedCampaigns.length > 0;

          if (hasCampaign) {
            const camp = item.appliedCampaigns[0];
            const typeName = (camp.type || "")
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            const discountText =
              camp.discountType === "percentage"
                ? `-${camp.discountValue}%`
                : `-৳${camp.discountValue}`;
            badgeElement = (
              <span className="inline-flex items-center text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-sm uppercase tracking-wide leading-tight whitespace-nowrap">
                {typeName} {discountText}
              </span>
            );
          } else if (discountPercent > 0) {
            badgeElement = (
              <span className="inline-block text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-sm uppercase tracking-wide leading-tight">
                −{Math.round(discountPercent)}% OFF
              </span>
            );
          }

          return (
            <div
              key={`${item._id}-${item.variantInfo?.colorIndex}-${item.variantInfo?.sizeIndex}`}
              className={`flex items-start gap-3 py-3 ${idx !== cartItems.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                <img
                  src={displayImage}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-mono font-bold text-black uppercase tracking-tight line-clamp-2 flex-1 min-w-0">
                    {item.name}
                  </p>
                  {badgeElement}
                </div>

                {variantText && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.variantInfo?.colorHex && (
                      <span
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.variantInfo.colorHex }}
                      />
                    )}
                    <span className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase">
                      {variantText}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right leading-none">
                  <p className="text-xs sm:text-sm font-mono font-black text-black">
                    ৳{(item.qty * unitPrice).toLocaleString("en-BD")}
                  </p>
                  {savingsPerUnit > 0 && (
                    <p className="text-[9px] sm:text-[10px] font-mono text-gray-400 line-through mt-0.5">
                      ৳{(basePrice * item.qty).toLocaleString("en-BD")}
                    </p>
                  )}
                </div>
                <div className="flex items-center border border-gray-300 rounded-md h-7 text-xs">
                  <button
                    type="button"
                    className="w-7 h-full flex items-center justify-center text-gray-500 border-r border-gray-300 hover:bg-gray-50 transition-colors rounded-l-md disabled:opacity-30"
                    onClick={() =>
                      item.qty > 1 && updateQtyHandler(item, item.qty - 1)
                    }
                    disabled={item.qty === 1}
                    aria-label="Decrease quantity"
                  >
                    <FaMinus size={8} />
                  </button>
                  <span className="w-8 h-full flex items-center justify-center font-mono font-black text-black bg-gray-50">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    className="w-7 h-full flex items-center justify-center text-gray-500 border-l border-gray-300 hover:bg-gray-50 transition-colors rounded-r-md"
                    onClick={() => updateQtyHandler(item, item.qty + 1)}
                    aria-label="Increase quantity"
                  >
                    <FaPlus size={8} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {cartItems.length === 0 && (
          <div className="py-10 text-center border border-dashed border-gray-200 rounded-md">
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
              Cart is empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

/* ─── PlaceOrder ────────────────────────────────────────────── */
const PlaceOrder = ({
  orderSummary,
  onPlaceOrder,
  onProceedToPayment,
  isShippingCalculating = false,
}) => {
  const {
    cartItems,
    paymentMethod: reduxPaymentMethod,
    shippingAddress,
  } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createOrder] = useCreateOrderMutation();
  const [initSSLCommerz, { isLoading: isInitializingSSL }] =
    useInitSSLCommerzMutation();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validateCuppon, { isLoading: isValidating }] =
    useValidateCupponMutation();

  const {
    subtotal,
    shippingCharge,
    totalPrice,
    totalSavings,
    shippingMethodName,
    estimatedDays,
    isFreeShipping,
  } = orderSummary;

  const effectivePaymentMethod =
    reduxPaymentMethod || shippingAddress?.paymentMethod || "Cash on Delivery";

  const isManualPayment = ["bKash", "Nagad", "Rocket", "Bank"].includes(
    effectivePaymentMethod,
  );
  const isSSLCommerz = effectivePaymentMethod === "SSLCommerz";

  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotalPrice = Math.max(0, totalPrice - couponDiscount);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    try {
      const productIds = cartItems.map((item) => item._id || item.product);
      const res = await validateCuppon({
        code: couponInput,
        itemsPrice: subtotal,
        productIds,
      }).unwrap();
      setAppliedCoupon({
        code: res.cuppon.code,
        discountAmount: res.discountAmount,
      });
      setCouponInput("");
      toast.success(`Coupon ${res.cuppon.code} applied!`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err?.data?.error || "Invalid coupon code");
    }
  }, [couponInput, cartItems, subtotal, validateCuppon]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponInput("");
  }, []);

  const placeOrderHandler = useCallback(async () => {
    if (isShippingCalculating) {
      toast.info("Please wait while shipping cost is being calculated...");
      return;
    }

    const freshAddress = onPlaceOrder();
    if (!freshAddress) return;

    try {
      setIsLoading(true);

      const orderItemsWithVariants = cartItems.map((item) => ({
        name: item.name,
        qty: Number(item.qty),
        image: item.image || (item.images && item.images[0]),
        price: getItemFinalPrice(item),
        product: item._id || item.product,
        discountPercentage: Number(item.discountPercentage || 0),
        variantInfo: item.variantInfo || {
          hasVariants: false,
          colorIndex: null,
          colorName: "",
          colorHex: "",
          sizeIndex: null,
          sizeName: "",
          variantPrice: null,
          sku: "",
        },
      }));

      const safeShippingAddress = {
        name: freshAddress.name || "",
        address: freshAddress.address || "",
        city: freshAddress.thana || freshAddress.city || "",
        division: freshAddress.division || "",
        district: freshAddress.district || "",
        thana: freshAddress.thana || "",
        phoneNumber: freshAddress.phoneNumber || "",
        email: freshAddress.email || "",
      };

      if (
        !safeShippingAddress.division ||
        !safeShippingAddress.district ||
        !safeShippingAddress.thana
      ) {
        toast.error("Please select your Division, District and Thana!");
        return;
      }

      const resolvedPaymentMethod =
        freshAddress.paymentMethod || effectivePaymentMethod;

      const baseOrderData = {
        orderItems: orderItemsWithVariants,
        shippingAddress: safeShippingAddress,
        email: freshAddress.email || "", 
        user: userInfo ? userInfo._id : null, 
        paymentMethod: resolvedPaymentMethod,
        itemsPrice: subtotal.toFixed(2),
        shippingPrice: shippingCharge.toFixed(2),
        totalPrice: finalTotalPrice.toFixed(2),
        totalSavings: totalSavings.toFixed(2),
        cupponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      if (isManualPayment) {
        localStorage.setItem("pendingOrderData", JSON.stringify(baseOrderData));
        if (onProceedToPayment) {
          onProceedToPayment(baseOrderData);
        } else {
          navigate("/payment/checkout");
        }
      } else if (isSSLCommerz) {
        const orderRes = await createOrder(baseOrderData).unwrap();
        const sslRes = await initSSLCommerz(orderRes._id).unwrap();

        if (sslRes.url) {
          localStorage.removeItem("pendingOrderData");
          window.location.href = sslRes.url;
        } else {
          toast.error("Failed to connect to payment gateway.");
        }
      } else {
        const res = await createOrder(baseOrderData).unwrap();
        toast.success("Order placed successfully! 📦");
        dispatch(clearCartItems());
        localStorage.removeItem("shippingAddress");
        localStorage.removeItem("pendingOrderData");
        navigate(`/order/${res._id}`);
      }
    } catch (error) {

      if (error?.status === 401) {
        toast.error(error?.data?.error || "Please login to continue");
        navigate("/login?redirect=/shipping");
      } else {
        toast.error(
          error?.data?.message || "Something went wrong while placing order.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isShippingCalculating,
    onPlaceOrder,
    cartItems,
    effectivePaymentMethod,
    subtotal,
    shippingCharge,
    finalTotalPrice,
    totalSavings,
    appliedCoupon,
    isManualPayment,
    isSSLCommerz,
    onProceedToPayment,
    navigate,
    createOrder,
    initSSLCommerz,
    userInfo,
    dispatch,
  ]);

  const isButtonDisabled =
    isLoading ||
    cartItems.length === 0 ||
    isShippingCalculating ||
    isInitializingSSL;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-gray-100 bg-gray-50">
        <p className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-1">
          Review &amp; Confirm
        </p>
        <h2 className="text-xl sm:text-2xl font-mono font-black text-black uppercase tracking-tight leading-none">
          Order Summary
        </h2>
      </div>
      <div className="px-4 sm:px-6 pt-4 pb-4">
        <InlineItems />
      </div>

      <div className="px-4 sm:px-6 pb-4">
        <div className="border border-dashed border-gray-300 p-3 sm:p-4 rounded-md bg-gray-50/50">
          {!appliedCoupon ? (
            <>
              <p className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-gray-600 mb-2">
                Have a coupon?
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm font-mono uppercase tracking-widest text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidating || !couponInput.trim()}
                  className="bg-black text-white px-4 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isValidating ? "..." : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-[10px] sm:text-xs font-mono text-red-500 mt-1.5 uppercase tracking-wider">
                  ✕ {couponError}
                </p>
              )}
            </>
          ) : (
            <div className="flex justify-between items-center bg-green-50 p-2 rounded-md border border-green-200">
              <div>
                <p className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-green-700">
                  Coupon Applied ✓
                </p>
                <p className="text-xs sm:text-sm font-mono font-black text-green-900 mt-0.5">
                  {appliedCoupon.code}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Remove coupon"
                aria-label="Remove coupon"
              >
                <FaXmark size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-4 sm:mx-6 border-t border-gray-100 pt-3 pb-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-gray-500">
            Subtotal
          </span>
          <span className="text-xs sm:text-sm font-mono font-black text-black">
            ৳{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-gray-500">
            Shipping
          </span>
          {isShippingCalculating ? (
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-gray-500">
              <FaSpinner className="animate-spin" size={10} /> Calculating...
            </span>
          ) : shippingCharge > 0 || isFreeShipping ? (
            <div className="text-right">
              <span className="text-xs sm:text-sm font-mono font-black text-black">
                {isFreeShipping ? "FREE" : `৳${shippingCharge.toFixed(2)}`}
              </span>
              {shippingMethodName && (
                <p className="text-[9px] sm:text-[10px] text-gray-500 font-mono mt-0.5 leading-tight">
                  {shippingMethodName} {estimatedDays && `· ${estimatedDays}`}
                </p>
              )}
            </div>
          ) : (
            <span className="text-[10px] sm:text-xs font-mono text-gray-400 uppercase">
              Select address
            </span>
          )}
        </div>

        {appliedCoupon && (
          <div className="flex justify-between items-center py-1.5 px-2.5 bg-green-50 border border-green-100 rounded-md">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-green-700">
              Coupon ({appliedCoupon.code})
            </span>
            <span className="text-xs sm:text-sm font-mono font-black text-green-600">
              −৳{appliedCoupon.discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {totalSavings > 0 && (
          <div className="flex justify-between items-center py-1.5 px-2.5 bg-gray-50 border border-gray-100 rounded-md">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-green-700">
              Product Savings
            </span>
            <span className="text-xs sm:text-sm font-mono font-black text-green-600">
              −৳{totalSavings.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="mx-4 sm:mx-6 border-t-2 border-black pt-3 pb-4 flex justify-between items-baseline">
        <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-black">
          Total Payable
        </span>
        {isShippingCalculating ? (
          <span className="flex items-center gap-2 text-gray-500 font-mono font-black text-lg sm:text-xl">
            <FaSpinner className="animate-spin" size={14} /> Updating...
          </span>
        ) : (
          <span className="text-2xl sm:text-3xl font-mono font-black text-black leading-none">
            ৳{finalTotalPrice.toFixed(2)}
          </span>
        )}
      </div>

      <div className="px-4 sm:px-6 pb-5">
        <button
          type="button"
          onClick={placeOrderHandler}
          disabled={isButtonDisabled}
          className={`w-full py-3.5 sm:py-4 font-mono font-black text-xs sm:text-sm uppercase tracking-widest rounded-md transition-colors duration-200 flex items-center justify-center ${
            isButtonDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isLoading || isInitializingSSL ? (
            <ButtonSpinner />
          ) : isShippingCalculating ? (
            "Calculating Shipping..."
          ) : isManualPayment ? (
            "Proceed to Payment →"
          ) : isSSLCommerz ? (
            "Pay via SSLCommerz →"
          ) : (
            "Confirm Order →"
          )}
        </button>
        <p className="text-center text-[9px] sm:text-[10px] text-gray-500 mt-2.5 font-mono uppercase tracking-wider">
          {isManualPayment
            ? "Payment first · then order is created"
            : isSSLCommerz
              ? "You will be redirected to secure payment"
              : "By confirming, you agree to our terms"}
        </p>
      </div>
    </div>
  );
};

export default memo(PlaceOrder);
