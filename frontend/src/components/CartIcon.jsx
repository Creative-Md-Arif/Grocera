/* eslint-disable react/prop-types */
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { toggleCartSidebar } from "../redux/features/cart/cartSlice";

const CartIcon = ({ cartCount }) => {
  const dispatch = useDispatch();
  const handleOpenCart = () => {
    dispatch(toggleCartSidebar(true));
  };

  return (
    <button
      onClick={handleOpenCart}
      className="relative group block outline-none"
      aria-label="Open Shopping Cart"
    >
      <HiOutlineShoppingBag
        className="text-gray-600 transition-colors duration-300 group-hover:text-[#D4A843]"
        size={20}
      />
      {/* Badge */}
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#D4A843] text-[10px] font-bold text-[#1A1A1A]">
          {cartCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;