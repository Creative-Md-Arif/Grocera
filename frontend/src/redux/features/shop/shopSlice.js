import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  products: [],
  checked: [],
  selectedBrand: "", // 'radio' এর বদলে 'selectedBrand' ব্যবহার করা হলো
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setChecked: (state, action) => {
      state.checked = action.payload;
    },
    setRadio: (state, action) => {
      // অ্যাকশন নেম একই রাখতে পারেন, কিন্তু স্টেট চেঞ্জ হবে selectedBrand এ
      state.selectedBrand = action.payload;
    },
  },
});

export const { setCategories, setProducts, setChecked, setRadio } =
  shopSlice.actions;
export default shopSlice.reducer;
