/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const AddToCartButton = ({
  product,
  qty = 1,
  buttonText = "Add",
  addedText = "Added",
  customStyles = "",
  isOrderNow = true,
  variant = "both",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  if (!product) {
    return (
      <button
        disabled
        className="opacity-50 cursor-not-allowed px-2 py-2 border border-neutral-200 bg-neutral-50 text-neutral-400 font-medium text-[12px] h-8 w-20"
      >
        ...
      </button>
    );
  }

  // ── এই exact product/variant এর জন্য cart-এ আগে থেকে থাকা qty বের করা ──
  const existingCartItem = cartItems.find((item) => {
    if (item._id !== product._id) return false;
    if (product?.variantInfo?.hasVariants) {
      return (
        item.variantInfo?.colorIndex === product.variantInfo.colorIndex &&
        item.variantInfo?.sizeIndex === product.variantInfo.sizeIndex
      );
    }
    return !item.variantInfo?.hasVariants;
  });

  const existingQty = existingCartItem?.qty || 0;

  // qty selector দিয়ে existingQty এর চেয়ে বেশি qty সিলেক্ট করলে বাটন আনলক হবে
  const isAdded = existingQty > 0 && qty <= existingQty;

  const mainImage =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : product?.image || "/placeholder.jpg";

  /**
   * ✅ FIX: variant থাকলে সবসময় variantInfo.variantPrice ব্যবহার করা হবে,
   * base product.price/basePrice শুধু non-variant product এর জন্য fallback।
   * আগে এখানে সবসময় product.price বসতো, যেটা XXL/other size select করলেও
   * base(default) variant এর দাম save করে ফেলতো — এখন ফিক্সড।
   */
  const getBasePrice = () => {
    if (product.variantInfo?.hasVariants && product.variantInfo?.variantPrice) {
      return product.variantInfo.variantPrice;
    }
    return product.price || product.basePrice || 0;
  };

  const getFinalPrice = () => {
    const base = getBasePrice();

    // যদি product এ আগে থেকেই effective/final price calculate করা থাকে
    // (campaign বা discountPercentage সহ), সেটাকেই priority দাও — কিন্তু
    // সেটা ধরে নেওয়া যাবে না যে সেই মান variant-aware ছিল, তাই শুধুমাত্র
    // non-variant product এর ক্ষেত্রেই আগের calculated ভ্যালু ব্যবহার করা হচ্ছে।
    if (!product.variantInfo?.hasVariants) {
      return product.finalPrice || product._effectivePrice || base;
    }

    // Variant থাকলে discount/campaign percentage থাকলে base (variant price) থেকেই
    // recalculate করো, যাতে XXL এর মতো higher-priced variant এও সঠিক discount বসে।
    const discountPercent = product.discountPercentage || 0;
    if (discountPercent > 0) {
      return Math.round(base - (base * discountPercent) / 100);
    }
    return base;
  };

  const createCartItem = () => {
    const basePrice = getBasePrice();
    const finalPrice = getFinalPrice();

    return {
      _id: product._id,
      name: product.name,
      price: basePrice, // ✅ এখন সঠিক variant price (e.g. XXL = 1050)
      finalPrice: finalPrice,
      basePrice: basePrice,
      _effectivePrice: finalPrice,
      effectivePrice: finalPrice,
      campaignPrice: product.campaignPrice,
      appliedCampaigns: product.appliedCampaigns || [],
      discountPercentage: product.discountPercentage,
      qty,
      image: mainImage,
      variantInfo: product.variantInfo || {
        hasVariants: false,
        colorIndex: null,
        colorName: "",
        colorHex: "",
        sizeIndex: null,
        sizeName: "",
        variantPrice: null,
        sku: "",
        countInStock: 0,
      },
      weight: product.weight || 0.5,
    };
  };

  const handleAddToCart = () => {
    const totalQty = existingQty + qty;

    if (product.variantInfo?.hasVariants) {
      const stock = product.variantInfo.countInStock;
      if (stock !== undefined && stock < totalQty) {
        toast.error(`Only ${stock} units available!`);
        return;
      }
    } else if (product.countInStock < totalQty) {
      toast.error(`Only ${product.countInStock} units available!`);
      return;
    }

    if (!isAdded) {
      dispatch(addToCart(createCartItem()));
    }
  };

  const handleOrderNow = () => {
    const totalQty = existingQty + qty;

    if (product.variantInfo?.hasVariants) {
      const stock = product.variantInfo.countInStock;
      if (stock !== undefined && stock < totalQty) {
        toast.error(`Only ${stock} units available!`);
        return;
      }
    } else if (product.countInStock < totalQty) {
      toast.error(`Only ${product.countInStock} units available!`);
      return;
    }
    dispatch(addToCart(createCartItem()));
    navigate("/shipping");
  };

  const renderAddToCartBtn = () => (
    <motion.button
      whileTap={!isAdded && product.countInStock !== 0 ? { scale: 0.98 } : {}}
      onClick={handleAddToCart}
      disabled={isAdded || product.countInStock === 0}
      className={`group relative flex items-center justify-center gap-1 h-8 px-2 max-w-[100px] rounded-[4px] border border-neutral-900 font-playfair font-medium text-[14px] uppercase tracking-wide overflow-hidden transition-colors duration-300 w-full outline-none
        ${
          isAdded
            ? "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"
            : "text-neutral-900 bg-white"
        } ${customStyles}`}
    >
      {!isAdded && (
        <span className="absolute inset-0 bg-neutral-100 -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
      )}

      <span className="relative flex items-center gap-1 z-10 truncate">
        {isAdded ? (
          <FaCheck className="text-[10px]" />
        ) : (
          <CiShoppingCart className="text-[13px]" />
        )}
        {isAdded ? addedText : buttonText}
      </span>
    </motion.button>
  );

  const renderOrderNowBtn = () => (
    <div className="w-full max-w-[100px] flex flex-col">
      <motion.button
        whileTap={product.countInStock !== 0 ? { scale: 0.98 } : {}}
        onClick={handleOrderNow}
        disabled={product.countInStock === 0}
        className="group relative flex items-center justify-center h-8 px-2 bg-[#314ec9] border border-[#314ec9] text-white rounded-[4px] font-playfair font-medium text-[14px] uppercase tracking-wide overflow-hidden transition-all duration-300 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-100 disabled:cursor-not-allowed outline-none w-full"
      >
        <span className="absolute inset-0 bg-[#233ca3] -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
        <span className="relative z-10 truncate">Buy Now</span>
      </motion.button>
    </div>
  );

  if (variant === "add") return renderAddToCartBtn();
  if (variant === "order") return renderOrderNowBtn();

  return (
    <div className="flex items-center gap-1.5">
      {renderAddToCartBtn()}
      {isOrderNow && renderOrderNowBtn()}
    </div>
  );
};

export default AddToCartButton;