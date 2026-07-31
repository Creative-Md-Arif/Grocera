import { useSelector } from "react-redux";

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites);
  const favoriteCount = favorites?.length || 0;

  if (favoriteCount === 0) return null;

  return (
    <span className="absolute -top-2 -right-2.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#D4A843] text-[10px] font-bold text-[#1A1A1A]">
      {favoriteCount}
    </span>
  );
};

export default FavoritesCount;