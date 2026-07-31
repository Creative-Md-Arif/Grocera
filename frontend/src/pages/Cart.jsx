import { memo, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaArrowRight,
  FaPlus,
  FaMinus,
  FaTag,
  FaInfoCircle,
} from "react-icons/fa";
import {
  updateCartQty,
  removeFromCart,
  toggleCartSidebar,
} from "../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import { LuShoppingBag } from "react-icons/lu";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart) || {};
  const { cartItems = [], isCartOpen = false } = cart;

  // ✅ FIX: qty +/- বাটনের জন্য absolute-set reducer (updateCartQty) ব্যবহার করা হচ্ছে,
  // addToCart (যেটা AddToCartButton এখন cumulative-add হিসেবে ব্যবহার করে) না —
  // দুইটা ভিন্ন intent (set vs add) একই reducer এ থাকলে qty ভুল হয়ে যাচ্ছিল।
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

  const removeFromCartHandler = useCallback(
    (item) => {
      dispatch(
        removeFromCart({
          _id: item._id,
          variantInfo: item.variantInfo || null,
        }),
      );
    },
    [dispatch],
  );

  const closeCartSidebar = useCallback(() => {
    dispatch(toggleCartSidebar(false));
  }, [dispatch]);

  const checkoutHandler = useCallback(() => {
    closeCartSidebar();
    navigate("/shipping");
  }, [closeCartSidebar, navigate]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const finalPrice =
          Number(item.finalPrice) || Number(item._finalPrice) || item.price || 0;
        return acc + finalPrice * item.qty;
      }, 0),
    [cartItems],
  );

  const totalSavings = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const savings = Number(item.savings) || 0;
        return acc + savings * item.qty;
      }, 0),
    [cartItems],
  );

  return (
    <div
      className={`fixed inset-0 z-[1500] font-trebuchet transition-all duration-300 ${
        isCartOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
      style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart sidebar"
    >
      {/* Backdrop Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCartSidebar}
        aria-hidden="true"
      />

      {/* Smooth Sliding Sidebar Panel */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-full sm:max-w-[380px] h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 py-4 px-4 bg-white border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-[16px] font-bold text-gray-800 tracking-wide">
              Shopping Bag ({cartItems.length})
            </h1>
          </div>
          <button
            onClick={closeCartSidebar}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close cart"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto flex flex-col p-4 bg-white">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
              <LuShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
              <h2 className="text-[14px] font-medium text-gray-500 mb-4 text-center">
                Your shopping bag is empty
              </h2>
              <Link to="/shop" onClick={closeCartSidebar}>
                <button className="flex items-center gap-2 bg-[#007EFC] text-white py-2.5 px-5 rounded-lg font-bold text-[14px] transition-colors">
                  Go to Shop <FaArrowRight size={12} />
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => {
                const finalPrice =
                  Number(item.finalPrice) || Number(item._finalPrice) || item.price || 0;
                const basePrice = Number(item.basePrice) || Number(item.price) || 0;

                const savingsPerItem = Number(item.savings) || (basePrice - finalPrice);
                const hasCampaign = item.appliedCampaigns && item.appliedCampaigns.length > 0;
                const discountPercent = item.discountPercentage || 0;

                const variantText = item.variantInfo?.hasVariants
                  ? `${item.variantInfo.colorName} / ${item.variantInfo.sizeName}`
                  : "";

                return (
                  <div
                    key={`${item._id}-${item.variantInfo?.colorIndex}-${item.variantInfo?.sizeIndex}`}
                    className="p-3 bg-white border border-gray-200 rounded-xl flex gap-3 items-start"
                  >
                    <div className="relative w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || (item.images && item.images[0])}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                      {hasCampaign ? (
                        <div className="absolute top-0 right-0 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl bg-red-600">
                          Campaign
                        </div>
                      ) : discountPercent > 0 ? (
                        <div className="absolute top-0 right-0 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl bg-red-500">
                          {Math.round(discountPercent)}%
                        </div>
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-[14px] font-bold text-gray-800 truncate">
                          {item.name}
                        </h3>

                        {item.variantInfo?.hasVariants && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.variantInfo.colorHex }}
                            />
                            <span className="text-[14px] text-gray-500 truncate">
                              {variantText}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-900 text-[14px] font-bold">
                            ৳{Math.round(finalPrice).toLocaleString()}
                          </span>
                          {savingsPerItem > 0 && (
                            <span className="text-gray-400 text-[14px] line-through">
                              ৳{Math.round(basePrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                          <button
                            onClick={() =>
                              item.qty > 1 && updateQtyHandler(item, item.qty - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus size={8} />
                          </button>
                          <span className="w-6 text-center text-[14px] font-bold text-gray-800">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQtyHandler(item, item.qty + 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
                            aria-label="Increase quantity"
                          >
                            <FaPlus size={8} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-gray-800">
                            ৳{Math.round(item.qty * finalPrice).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCartHandler(item)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            aria-label="Remove item"
                          >
                            <IoMdClose size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary Container */}
        {cartItems.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
            <div className="space-y-2 text-[14px]">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-800">
                  ৳{Math.round(subtotal + totalSavings).toLocaleString()}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FaTag size={10} /> Savings
                  </span>
                  <span className="font-bold">
                    - ৳{Math.round(totalSavings).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="h-px bg-gray-100 my-2" />

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-800 font-bold">Total Amount</span>
                <span className="text-[18px] font-bold text-red-600">
                  ৳{Math.round(subtotal).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              disabled={cartItems.length === 0}
              onClick={checkoutHandler}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#007EFC] text-white py-3.5 rounded-xl font-bold text-[14px] transition-colors hover:bg-[#006ee0]"
            >
              Proceed to Checkout <FaArrowRightLong size={14} />
            </button>

            <p className="mt-3 text-[14px] text-center text-gray-400 flex items-center justify-center gap-1.5">
              <FaInfoCircle size={12} /> Verified Secure Checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Cart);