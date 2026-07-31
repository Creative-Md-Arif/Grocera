/* eslint-disable react/prop-types */
import { HiOutlineHeart } from "react-icons/hi2";
import { Link } from "react-router-dom";
import FavoritesCount from "../pages/Products/FavoritesCount";

const FavoriteIcon = ({ onClick }) => {
  return (
    <Link to="/favorite" onClick={onClick} className="relative group block outline-none">
      <HiOutlineHeart
        className="text-gray-600 transition-colors duration-300 group-hover:text-[#D4A843]"
        size={20}
      />
      <FavoritesCount />
    </Link>
  );
};

export default FavoriteIcon;