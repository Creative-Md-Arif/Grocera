/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../../../Utils/cart";

const getInitialState = () => {
  try {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const parsedCart = JSON.parse(cartData);
      return {
        cartItems: Array.isArray(parsedCart.cartItems)
          ? parsedCart.cartItems
          : [],
        shippingAddress: parsedCart.shippingAddress || {},
        paymentMethod: parsedCart.paymentMethod || "Cash on Delivery",
        itemsPrice: parsedCart.itemsPrice || 0,
        taxPrice: parsedCart.taxPrice || 0,
        totalPrice: parsedCart.totalPrice || 0, // ✅ ফিক্স: আগে ভুলে itemsPrice ব্যবহার হচ্ছিল
        totalSavings: parsedCart.totalSavings || 0,
        isCartOpen: false,
      };
    }
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
  }

  return {
    cartItems: [],
    shippingAddress: {},
    paymentMethod: "Cash on Delivery",
    itemsPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
    totalSavings: 0,
    isCartOpen: false,
  };
};

const initialState = getInitialState();

const isSameItem = (item1, item2) => {
  if (item1._id !== item2._id) return false;

  if (item1.variantInfo?.hasVariants && item2.variantInfo?.hasVariants) {
    return (
      item1.variantInfo.colorIndex === item2.variantInfo.colorIndex &&
      item1.variantInfo.sizeIndex === item2.variantInfo.sizeIndex
    );
  }

  if (!item1.variantInfo?.hasVariants && !item2.variantInfo?.hasVariants) {
    return true;
  }

  return false;
};

/**
 * ✅ FIXED: Variant-aware price normalizer
 *
 * আগে campaign থাকলে সরাসরি item.campaignPrice (backend থেকে আসা flat/fixed
 * value, variant-অনুযায়ী বদলায় না) কে finalPrice হিসেবে বসানো হতো। এতে
 * XXL/other higher-priced variant এও একই flat campaign price দেখাতো।
 *
 * এখন campaign discount সবসময় basePrice (= নির্বাচিত variant এর আসল দাম)
 * থেকে calculate হয়, discountType/discountValue দিয়ে। campaignPrice শুধু
 * তখনই fallback হিসেবে ব্যবহার হয় যদি discount type/value পাওয়া না যায়।
 */
const normalizeItemPrices = (item) => {
  if (!item) return null;

  const basePrice = Number(item.basePrice) || Number(item.price) || 0;

  let finalPrice = basePrice;
  let appliedDiscountPercent = Number(item.discountPercentage) || 0;
  let savings = 0;

  const hasCampaign = item.appliedCampaigns && item.appliedCampaigns.length > 0;

  if (hasCampaign) {
    const camp = item.appliedCampaigns[0];

    if (camp.discountType === "percentage" && camp.discountValue) {
      finalPrice = basePrice - (basePrice * camp.discountValue) / 100;
    } else if (camp.discountType === "fixed" && camp.discountValue) {
      finalPrice = basePrice - camp.discountValue;
    } else if (item.campaignPrice) {
      // ⚠️ শুধু fallback: discount type/value পাওয়া না গেলে backend এর flat মান
      finalPrice = Number(item.campaignPrice);
    }

    if (camp.maxDiscountAmount) {
      finalPrice = Math.max(finalPrice, basePrice - camp.maxDiscountAmount);
    }

    finalPrice = Math.max(Math.round(finalPrice), 0);
    savings = basePrice - finalPrice;
  } else if (appliedDiscountPercent > 0) {
    finalPrice = basePrice - (basePrice * appliedDiscountPercent) / 100;
    savings = (basePrice * appliedDiscountPercent) / 100;
  }

  return {
    ...item,
    price: basePrice,
    basePrice: basePrice,
    _finalPrice: finalPrice,
    finalPrice: finalPrice,
    _effectivePrice: finalPrice,
    effectivePrice: finalPrice,
    _savings: savings,
    savings: savings,
    discountPercentage: appliedDiscountPercent,
    appliedDiscountPercent: appliedDiscountPercent,
    weight: Number(item.weight) || 0.5,
  };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      if (!item || !item._id) {
        console.error("Invalid item:", item);
        return state;
      }

      const normalizedItem = normalizeItemPrices(item);

      const existItemIndex = state.cartItems.findIndex((x) =>
        isSameItem(x, normalizedItem),
      );

      if (existItemIndex !== -1) {
        const newQty = state.cartItems[existItemIndex].qty + normalizedItem.qty;
        state.cartItems[existItemIndex].qty = newQty;
        state.cartItems[existItemIndex] = {
          ...state.cartItems[existItemIndex],
          appliedCampaigns: normalizedItem.appliedCampaigns,
          campaignPrice: normalizedItem.campaignPrice,
          _finalPrice: normalizedItem._finalPrice,
          finalPrice: normalizedItem.finalPrice,
          _effectivePrice: normalizedItem._effectivePrice,
          effectivePrice: normalizedItem.effectivePrice,
          basePrice: normalizedItem.basePrice,
          _savings: normalizedItem._savings,
          savings: normalizedItem.savings,
          discountPercentage: normalizedItem.discountPercentage,
          appliedDiscountPercent: normalizedItem.appliedDiscountPercent,
          weight: normalizedItem.weight,
        };
      } else {
        state.cartItems.push(normalizedItem);
      }

      return updateCart(state);
    },

    updateCartQty: (state, action) => {
      const { _id, variantInfo, qty } = action.payload;
      const index = state.cartItems.findIndex((item) => {
        if (item._id !== _id) return false;
        if (variantInfo?.hasVariants) {
          return (
            item.variantInfo?.colorIndex === variantInfo.colorIndex &&
            item.variantInfo?.sizeIndex === variantInfo.sizeIndex
          );
        }
        return !item.variantInfo?.hasVariants;
      });

      if (index !== -1 && qty > 0) {
        state.cartItems[index].qty = qty;
      }

      return updateCart(state);
    },

    removeFromCart: (state, action) => {
      const { _id, variantInfo } = action.payload;

      if (!_id) {
        console.error("Invalid item ID provided for removal", action.payload);
        return state;
      }

      state.cartItems = state.cartItems.filter((item) => {
        if (item._id !== _id) return true;

        if (variantInfo?.hasVariants) {
          const itemHasVariants = item.variantInfo?.hasVariants;
          if (!itemHasVariants) return true;

          const colorMatch =
            item.variantInfo?.colorIndex === variantInfo.colorIndex;
          const sizeMatch =
            item.variantInfo?.sizeIndex === variantInfo.sizeIndex;

          return !(colorMatch && sizeMatch);
        }

        return false;
      });

      return updateCart(state);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
      return state;
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    clearCartItems: (state) => {
      state.cartItems = [];
      state.itemsPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
      state.totalSavings = 0;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    resetCart: (state) => {
      localStorage.removeItem("cart");
      return {
        cartItems: [],
        shippingAddress: {},
        paymentMethod: "Cash on Delivery",
        itemsPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
        totalSavings: 0,
        isCartOpen: false,
      };
    },

    toggleCartSidebar: (state, action) => {
      state.isCartOpen = action.payload;
    },
  },
});

export const {
  addToCart,
  updateCartQty,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  resetCart,
  toggleCartSidebar,
} = cartSlice.actions;

export default cartSlice.reducer;
