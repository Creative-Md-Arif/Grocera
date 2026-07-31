/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
} from "../../redux/features/favorite/favoriteSlice";
import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from "../../Utils/localStorage";

const HeartIcon = ({ product }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites) || [];
  const isFavorite = favorites.some((p) => p._id === product._id);

  useEffect(() => {
    const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
    dispatch(setFavorites(favoritesFromLocalStorage));
  }, [dispatch]);

  const toggleFavorites = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSyncing(true);
    setTimeout(() => {
      if (isFavorite) {
        dispatch(removeFromFavorites(product));
        removeFavoriteFromLocalStorage(product._id);
      } else {
        dispatch(addToFavorites(product));
        addFavoriteToLocalStorage(product);
      }
      setIsSyncing(false);
    }, 600);
  };

  return (
    <motion.div
      onClick={toggleFavorites}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
    >
      <AnimatePresence mode="wait">
        {isSyncing ? (
          <motion.div
            key="loader"
            initial={{ rotate: 0, opacity: 0 }}
            animate={{ rotate: 360, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
            className="text-purple-700"
          >
            <AiOutlineLoading3Quarters size={18} />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isFavorite ? (
              <FaHeart className="text-purple-700 text-[18px]" />
            ) : (
              <FaRegHeart className="text-gray-400 hover:text-purple-700 text-[18px] transition-colors duration-200" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className="absolute inset-0 bg-purple-700/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default HeartIcon;
