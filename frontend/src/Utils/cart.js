export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

// 🆕 আপডেটেড updateCart
export const updateCart = (state) => {
  const cartItems = Array.isArray(state?.cartItems) ? state.cartItems : [];
  let totalSavings = 0;

  state.itemsPrice = addDecimals(
    cartItems.reduce((acc, item) => {
      // finalPrice এখন ক্যাম্পেইন প্রাইসও হতে পারে, সাধারণ প্রাইসও হতে পারে (কার্ট স্লাইস ঠিক করে দিয়েছে)
      const finalPrice = Number(item.finalPrice) || Number(item.price) || 0;
      const qty = Number(item.qty) || 1;

      // savings-ও কার্ট স্লাইস থেকে আসছে
      totalSavings += (Number(item.savings) || 0) * qty;

      return acc + finalPrice * qty;
    }, 0),
  );

  const itemsPriceNum = Number(state.itemsPrice);

  state.shippingPrice = addDecimals(0);
  state.taxPrice = addDecimals(0);
  state.totalPrice = addDecimals(itemsPriceNum);
  state.totalSavings = addDecimals(totalSavings);

  localStorage.setItem("cart", JSON.stringify(state));
  return state;
};

export const addFavoriteToLocalStorage = (product) => {
  const favorites = getFavoritesFromLocalStorage();
  if (!favorites.some((p) => p._id === product._id)) {
    favorites.push(product);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
};

export const removeFavoriteFromLocalStorage = (productId) => {
  const favorites = getFavoritesFromLocalStorage();
  const updateFavorites = favorites.filter(
    (product) => product._id !== productId,
  );
  localStorage.setItem("favorites", JSON.stringify(updateFavorites));
};

export const getFavoritesFromLocalStorage = () => {
  const favoritesJSON = localStorage.getItem("favorites");
  return favoritesJSON ? JSON.parse(favoritesJSON) : [];
};
